import { ApiError, apiFetch } from './api.ts';
import type { CartItem } from '../types/cart.ts';

/**
 * Backend cart DTO (`GET /api/cart` and every mutation return the same shape).
 * `productId` is the Mongo ObjectId of the product, not a cart-line id: the
 * API addresses lines by product.
 */
export interface BackendCartItemDto {
  productId: string;
  nombre: string;
  precio: number;
  imagenUrl?: string | null;
  stock: number;
  cantidad: number;
  subtotal: number;
}

export interface BackendCartDto {
  items: BackendCartItemDto[];
  totalUnidades: number;
  total: number;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}

/** Normalized cart the context consumes, independent of the server shape. */
export interface CartSnapshot {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

type CartResponse = {
  ok: boolean;
  message: string | null;
  data: BackendCartDto | null;
};

function isBackendCartItemDto(value: unknown): value is BackendCartItemDto {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'string' &&
    typeof item.nombre === 'string' &&
    typeof item.precio === 'number' &&
    typeof item.stock === 'number' &&
    typeof item.cantidad === 'number' &&
    item.cantidad > 0
  );
}

/**
 * Reads the cart out of an envelope. A missing or malformed `data` is a
 * contract violation and throws instead of resolving as an empty cart, so a
 * broken response can never silently wipe the user's cart on screen.
 */
function readCart(response: unknown): CartSnapshot {
  const data =
    typeof response === 'object' && response !== null && 'data' in response
      ? (response as { data: unknown }).data
      : undefined;
  if (
    typeof data !== 'object' ||
    data === null ||
    !('items' in data) ||
    !Array.isArray((data as { items: unknown }).items) ||
    !(data as { items: unknown[] }).items.every(isBackendCartItemDto)
  ) {
    throw new ApiError('Invalid cart response');
  }

  const dto = data as BackendCartDto;
  const items: CartItem[] = dto.items.map((item) => ({
    productId: String(item.productId),
    name: item.nombre,
    unitPrice: item.precio,
    quantity: item.cantidad,
    stock: item.stock,
    imageUrl: item.imagenUrl ?? '',
  }));

  return {
    items,
    // Recompute locally instead of trusting the totals: one malformed total
    // must not disagree with the lines the user sees.
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    ),
  };
}

/** GET /api/cart — the authenticated user's cart with current product data. */
export async function getCart(signal?: AbortSignal): Promise<CartSnapshot> {
  const response = await apiFetch<CartResponse>('/cart', { signal });
  return readCart(response);
}

/** POST /api/cart — adds `cantidad` units, summing into an existing line. */
export async function addToCart(
  productId: string,
  cantidad = 1,
): Promise<CartSnapshot> {
  const response = await apiFetch<CartResponse>('/cart', {
    method: 'POST',
    body: { productId, cantidad },
  });
  return readCart(response);
}

/** PATCH /api/cart/:productId — replaces the quantity (does not sum). */
export async function setCartItemQuantity(
  productId: string,
  cantidad: number,
): Promise<CartSnapshot> {
  const response = await apiFetch<CartResponse>(
    `/cart/${encodeURIComponent(productId)}`,
    { method: 'PATCH', body: { cantidad } },
  );
  return readCart(response);
}

/** DELETE /api/cart/:productId — removes one line. */
export async function removeCartItem(productId: string): Promise<CartSnapshot> {
  const response = await apiFetch<CartResponse>(
    `/cart/${encodeURIComponent(productId)}`,
    { method: 'DELETE' },
  );
  return readCart(response);
}

/** DELETE /api/cart — empties the whole cart. */
export async function clearCart(): Promise<CartSnapshot> {
  const response = await apiFetch<CartResponse>('/cart', { method: 'DELETE' });
  return readCart(response);
}
