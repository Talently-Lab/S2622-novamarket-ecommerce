import { ApiError, apiFetch } from './api.ts';

/** Estados válidos del pedido. Espejo de `ORDER_STATUSES` en el backend. */
export const ORDER_STATUSES = [
  'pendiente',
  'pagado',
  'confirmado',
  'enviado',
  'entregado',
  'cancelado',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Línea de pedido tal como la devuelve el backend. */
export interface BackendOrderItemDto {
  _id?: string;
  productId?: string | null;
  nombre: string;
  cantidad: number;
  /** Precio al momento de la compra. No cambia si el catálogo cambia. */
  precioHistorico: number;
}

/** `userId` llega populado con `nombre` y `email` (puede ser null si el usuario fue borrado). */
export interface BackendOrderDto {
  _id: string;
  userId: { _id: string; nombre: string; email: string } | null;
  items: BackendOrderItemDto[];
  total: number;
  estado: OrderStatus;
  direccionEnvio: {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  /** Precio histórico: lo que pagó el cliente el día de la compra. */
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  /** Código corto para mostrar (últimos 6 caracteres del id). */
  code: string;
  date: string;
  customer: { name: string; email: string };
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === 'string' &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

function isBackendOrderDto(value: unknown): value is BackendOrderDto {
  if (typeof value !== 'object' || value === null) return false;
  const dto = value as Record<string, unknown>;
  return (
    typeof dto._id === 'string' &&
    Array.isArray(dto.items) &&
    dto.items.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).nombre === 'string' &&
        typeof (item as Record<string, unknown>).cantidad === 'number' &&
        typeof (item as Record<string, unknown>).precioHistorico === 'number',
    ) &&
    typeof dto.total === 'number' &&
    isOrderStatus(dto.estado) &&
    typeof dto.createdAt === 'string'
  );
}

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function mapOrderDto(dto: BackendOrderDto): Order {
  const address = dto.direccionEnvio;
  return {
    id: dto._id,
    code: `#${dto._id.slice(-6).toUpperCase()}`,
    date: formatOrderDate(dto.createdAt),
    customer: {
      name: dto.userId?.nombre ?? 'Cliente eliminado',
      email: dto.userId?.email ?? '',
    },
    address: address
      ? `${address.calle}, ${address.ciudad}, ${address.provincia} (${address.codigoPostal})`
      : '',
    items: dto.items.map((item, index) => ({
      id: item._id ?? `${dto._id}-${index}`,
      name: item.nombre,
      quantity: item.cantidad,
      priceAtPurchase: item.precioHistorico,
    })),
    total: dto.total,
    status: dto.estado,
  };
}

function readData(response: unknown): unknown {
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as { data: unknown }).data
    : undefined;
}

/**
 * GET /api/orders (solo admin). Devuelve todos los pedidos, del más nuevo al
 * más viejo. El backend lo resuelve con `OrderService.getAllOrders()`.
 */
export async function getAllOrders(signal?: AbortSignal): Promise<Order[]> {
  const response = await apiFetch<unknown>('/orders', { signal });
  const data = readData(response);
  if (!Array.isArray(data) || !data.every(isBackendOrderDto)) {
    throw new ApiError('Invalid orders response');
  }
  return data.map(mapOrderDto);
}

/** PUT /api/orders/:id/status (solo admin). Devuelve el pedido actualizado. */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const response = await apiFetch<unknown>(`/orders/${id}/status`, {
    method: 'PUT',
    body: { estado: status },
  });
  const data = readData(response);
  if (!isBackendOrderDto(data)) {
    throw new ApiError('Invalid order response');
  }
  return mapOrderDto(data);
}

/* ------------------------------------------------------------------ *
 * Checkout (POST /api/orders, rol client)
 * ------------------------------------------------------------------ */

/** One line sent to the backend: product id + units. */
export interface CreateOrderItemInput {
  productId: string;
  cantidad: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  /** Must equal the server's own sum, or the backend answers 400. */
  total: number;
  direccionEnvio: {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
}

/**
 * The created order as the confirmation screen needs it. Kept separate from
 * `Order` because `POST /api/orders` returns the raw document with `userId`
 * as an ObjectId (not populated) — reading a customer name from it would lie.
 */
export interface PlacedOrder {
  id: string;
  /** Short display code in the design's `NM-XXXXXX` format. */
  code: string;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
}

type CreatedOrderDto = {
  _id: string;
  items: Array<{
    productId?: string;
    nombre: string;
    cantidad: number;
    precioHistorico: number;
  }>;
  total: number;
};

function isCreatedOrderDto(value: unknown): value is CreatedOrderDto {
  if (typeof value !== 'object' || value === null) return false;
  const dto = value as Record<string, unknown>;
  return (
    typeof dto._id === 'string' &&
    typeof dto.total === 'number' &&
    Array.isArray(dto.items) &&
    dto.items.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).nombre === 'string' &&
        typeof (item as Record<string, unknown>).cantidad === 'number' &&
        typeof (item as Record<string, unknown>).precioHistorico === 'number',
    )
  );
}

/**
 * POST /api/orders — creates the order and decrements stock server-side.
 * The backend does NOT empty the cart, so the caller clears it after success.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<PlacedOrder> {
  const response = await apiFetch<unknown>('/orders', {
    method: 'POST',
    body: input,
  });
  const data = readData(response);
  if (!isCreatedOrderDto(data)) {
    throw new ApiError('Invalid order response');
  }
  return {
    id: data._id,
    code: `NM-${data._id.slice(-6).toUpperCase()}`,
    total: data.total,
    items: data.items.map((item) => ({
      productId: String(item.productId ?? ''),
      name: item.nombre,
      quantity: item.cantidad,
      priceAtPurchase: item.precioHistorico,
    })),
  };
}
