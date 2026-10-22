import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Icon from '../../components/icons/Icon.tsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';
import {
  ORDER_STATUSES,
  getAllOrders,
  updateOrderStatus,
} from '../../services/orderService.ts';
import type { Order, OrderStatus } from '../../services/orderService.ts';
import { formatPrice } from '../../utils/format.ts';

const DESKTOP_QUERY = '(min-width: 1024px)';

function itemCount(order: Order): number {
  return order.items.length;
}

function statusLabel(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusSelect({
  order,
  disabled,
  onChange,
}: {
  order: Order;
  disabled: boolean;
  onChange: (order: Order, status: OrderStatus) => void;
}) {
  return (
    <select
      aria-label={`Estado del pedido ${order.code}`}
      value={order.status}
      disabled={disabled}
      onChange={(event) => onChange(order, event.target.value as OrderStatus)}
      className="border-borde-input bg-fondo-superficie text-cuerpo text-texto-principal rounded-md border px-2 py-1 disabled:opacity-60"
    >
      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {statusLabel(status)}
        </option>
      ))}
    </select>
  );
}

function OrderDetail({
  order,
  statusControl,
}: {
  order: Order;
  /** Selector de estado. Si falta, el estado se muestra como texto. */
  statusControl?: ReactNode;
}) {
  return (
    <div className="border-borde-divisor bg-fondo-superficie rounded-lg border p-6">
      <h2 className="text-titulo-3 text-texto-principal font-bold">
        {order.code}
      </h2>
      <dl className="text-cuerpo mt-5 grid grid-cols-[5rem_1fr] gap-y-1">
        <dt className="text-texto-secundario">Fecha</dt>
        <dd className="text-texto-principal">{order.date}</dd>
        <dt className="text-texto-secundario">Estado</dt>
        <dd className="text-texto-principal">
          {statusControl ?? statusLabel(order.status)}
        </dd>
        <dt className="text-texto-secundario">Cliente</dt>
        <dd className="text-texto-principal">
          <span className="block">{order.customer.name}</span>
          <span className="block">{order.customer.email}</span>
        </dd>
        <dt className="text-texto-secundario">Envío</dt>
        <dd className="text-texto-principal">{order.address}</dd>
      </dl>

      <hr className="border-borde-divisor my-5" />

      <h3 className="text-titulo-3 text-texto-principal font-bold">
        Productos
      </h3>
      <ul className="mt-2">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="border-borde-divisor flex items-center justify-between gap-4 border-b py-3"
          >
            <span className="text-cuerpo text-texto-principal">
              {item.quantity} x {item.name}
            </span>
            <span className="text-cuerpo text-texto-principal font-bold">
              {formatPrice(item.priceAtPurchase * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-cuerpo text-texto-principal font-bold">
          Total
        </span>
        <span className="text-cuerpo text-texto-principal font-bold">
          {formatPrice(order.total)}
        </span>
      </div>
    </div>
  );
}

/** Desktop order table (pics-admin/pedidos-izq.jpg). */
function OrdersTable({
  orders,
  selected,
  updatingId,
  onSelect,
  onStatusChange,
}: {
  orders: Order[];
  selected: Order | null;
  updatingId: string | null;
  onSelect: (order: Order) => void;
  onStatusChange: (order: Order, status: OrderStatus) => void;
}) {
  return (
    <div className="border-borde-divisor bg-fondo-superficie overflow-hidden rounded-lg border">
      <table className="w-full border-collapse text-left">
        <thead className="bg-fondo-estructura text-texto-sobre-estructura">
          <tr>
            <th scope="col" className="text-cuerpo-chico-label px-4 py-3">
              Pedido
            </th>
            <th scope="col" className="text-cuerpo-chico-label px-4 py-3">
              Fecha
            </th>
            <th scope="col" className="text-cuerpo-chico-label px-4 py-3">
              Cliente
            </th>
            <th scope="col" className="text-cuerpo-chico-label px-4 py-3">
              Productos
            </th>
            <th scope="col" className="text-cuerpo-chico-label px-4 py-3">
              Total
            </th>
            <th scope="col" className="text-cuerpo-chico-label px-4 py-3">
              Estado
            </th>
            <th scope="col" className="w-10 px-4 py-3">
              <span className="sr-only">Ver detalle</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className={`border-borde-divisor border-t ${
                order.id === selected?.id ? 'bg-fondo-pagina' : ''
              }`}
            >
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSelect(order)}
                  aria-label={`Ver pedido ${order.code}`}
                  className="text-cuerpo text-texto-principal font-semibold"
                >
                  {order.code}
                </button>
              </td>
              <td className="text-cuerpo text-texto-secundario px-4 py-3">
                {order.date}
              </td>
              <td className="text-cuerpo text-texto-secundario px-4 py-3">
                {order.customer.name}
              </td>
              <td className="text-cuerpo text-texto-secundario px-4 py-3">
                {itemCount(order)}
              </td>
              <td className="text-cuerpo text-texto-principal px-4 py-3 font-bold">
                {formatPrice(order.total)}
              </td>
              <td className="px-4 py-3">
                <StatusSelect
                  order={order}
                  disabled={updatingId === order.id}
                  onChange={onStatusChange}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <Icon
                  name="chevron_right"
                  className="text-texto-secundario text-xl"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mobile order list (pics-admin/Admin-Pedidos.jpg). */
function OrdersList({
  orders,
  onSelect,
}: {
  orders: Order[];
  onSelect: (order: Order) => void;
}) {
  return (
    <ul className="mt-6 flex flex-col">
      {orders.map((order) => (
        <li key={order.id} className="border-borde-divisor border-b">
          <button
            type="button"
            onClick={() => onSelect(order)}
            aria-label={`Ver pedido ${order.code}`}
            className="flex w-full items-center gap-4 py-3 text-left"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-cuerpo-boton text-texto-principal font-semibold">
                {order.code}
              </span>
              <span className="text-cuerpo-chico text-texto-secundario">
                {order.customer.name}
              </span>
              <span className="text-cuerpo-chico text-texto-secundario">
                {order.date} · {itemCount(order)} producto
              </span>
              <span className="text-cuerpo-chico text-texto-secundario font-semibold">
                {statusLabel(order.status)}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-cuerpo text-texto-principal font-bold">
                {formatPrice(order.total)}
              </span>
              <Icon
                name="chevron_right"
                className="text-texto-secundario text-xl"
              />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Admin orders section. Carga los pedidos con `getAllOrders()` (GET
 * /api/orders, solo admin) y permite cambiar el estado de cada uno con
 * `updateOrderStatus()` (PUT /api/orders/:id/status).
 *
 * Desktop es un master-detail: la tabla (con el selector de estado en cada
 * fila) a la izquierda y el pedido seleccionado a la derecha, por defecto el
 * más nuevo. En mobile, al seleccionar se reemplaza la lista por el detalle a
 * ancho completo, con un link "‹ Pedidos" para volver.
 *
 * Los precios del detalle son `priceAtPurchase` (precio histórico guardado en
 * el pedido), nunca el precio actual del catálogo.
 */
export default function AdminOrdersPage() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getAllOrders(controller.signal)
      .then((result) => {
        setOrders(result);
        setLoadStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadStatus('error');
      });
    return () => controller.abort();
  }, []);

  const selected =
    orders.find((order) => order.id === selectedId) ??
    (isDesktop ? (orders[0] ?? null) : null);

  function select(order: Order) {
    setSelectedId(order.id);
  }

  async function changeStatus(order: Order, status: OrderStatus) {
    if (status === order.status) return;
    setUpdatingId(order.id);
    setUpdateError(null);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrders((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch {
      setUpdateError(
        `No se pudo actualizar el estado del pedido ${order.code}. Intentá de nuevo.`,
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const title = (
    <h1 className="text-titulo-2 text-texto-principal font-bold">Pedidos</h1>
  );
  const errorBanner = updateError ? (
    <p role="alert" className="text-cuerpo text-texto-error mt-4">
      {updateError}
    </p>
  ) : null;

  if (loadStatus === 'loading') {
    return (
      <>
        {title}
        <p role="status" className="text-cuerpo text-texto-secundario mt-6">
          Cargando pedidos…
        </p>
      </>
    );
  }

  if (loadStatus === 'error') {
    return (
      <>
        {title}
        <p role="alert" className="text-cuerpo text-texto-error mt-6">
          No se pudieron cargar los pedidos. Probá de nuevo más tarde.
        </p>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        {title}
        <p className="text-cuerpo text-texto-secundario mt-6">
          Todavía no hay pedidos.
        </p>
      </>
    );
  }

  if (!isDesktop) {
    if (selected) {
      return (
        <>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-cuerpo-chico text-texto-secundario inline-flex items-center"
          >
            <Icon name="chevron_left" className="text-xl" />
            Pedidos
          </button>
          {errorBanner}
          <div className="mt-4">
            <OrderDetail
              order={selected}
              statusControl={
                <StatusSelect
                  order={selected}
                  disabled={updatingId === selected.id}
                  onChange={changeStatus}
                />
              }
            />
          </div>
        </>
      );
    }
    return (
      <>
        {title}
        <OrdersList orders={orders} onSelect={select} />
      </>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div>
        {title}
        {errorBanner}
        <div className="mt-6">
          <OrdersTable
            orders={orders}
            selected={selected}
            updatingId={updatingId}
            onSelect={select}
            onStatusChange={changeStatus}
          />
        </div>
      </div>
      {selected ? <OrderDetail order={selected} /> : null}
    </div>
  );
}
