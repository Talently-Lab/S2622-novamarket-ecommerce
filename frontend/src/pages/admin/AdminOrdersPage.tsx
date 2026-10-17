import { useState } from 'react';
import Icon from '../../components/icons/Icon.tsx';
import { ADMIN_ORDERS } from '../../data/adminOrders.ts';
import type { Order } from '../../data/adminOrders.ts';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';
import { formatPrice } from '../../utils/format.ts';

const DESKTOP_QUERY = '(min-width: 1024px)';

function itemCount(order: Order): number {
  return order.items.length;
}

function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="rounded-lg border border-borde-divisor bg-fondo-superficie p-6">
      <h2 className="text-titulo-3 font-bold text-texto-principal">
        {order.id}
      </h2>
      <dl className="mt-5 grid grid-cols-[5rem_1fr] gap-y-1 text-cuerpo">
        <dt className="text-texto-secundario">Fecha</dt>
        <dd className="text-texto-principal">{order.date}</dd>
        <dt className="text-texto-secundario">Cliente</dt>
        <dd className="text-texto-principal">
          <span className="block">{order.customer.name}</span>
          <span className="block">{order.customer.email}</span>
          <span className="block">{order.customer.phone}</span>
        </dd>
      </dl>

      <hr className="my-5 border-borde-divisor" />

      <h3 className="text-titulo-3 font-bold text-texto-principal">Productos</h3>
      <ul className="mt-2">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 border-b border-borde-divisor py-3"
          >
            <span className="text-cuerpo text-texto-principal">
              {item.quantity} x {item.name}
            </span>
            <span className="text-cuerpo font-bold text-texto-principal">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-cuerpo font-bold text-texto-principal">Total</span>
        <span className="text-cuerpo font-bold text-texto-principal">
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
  onSelect,
}: {
  orders: Order[];
  selected: Order | null;
  onSelect: (order: Order) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-borde-divisor bg-fondo-superficie">
      <table className="w-full border-collapse text-left">
        <thead className="bg-fondo-estructura text-texto-sobre-estructura">
          <tr>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Pedido
            </th>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Fecha
            </th>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Cliente
            </th>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Productos
            </th>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Total
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
              className={`border-t border-borde-divisor ${
                order.id === selected?.id ? 'bg-fondo-pagina' : ''
              }`}
            >
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSelect(order)}
                  aria-label={`Ver pedido ${order.id}`}
                  className="text-cuerpo font-semibold text-texto-principal"
                >
                  {order.id}
                </button>
              </td>
              <td className="px-4 py-3 text-cuerpo text-texto-secundario">
                {order.date}
              </td>
              <td className="px-4 py-3 text-cuerpo text-texto-secundario">
                {order.customer.name}
              </td>
              <td className="px-4 py-3 text-cuerpo text-texto-secundario">
                {itemCount(order)}
              </td>
              <td className="px-4 py-3 text-cuerpo font-bold text-texto-principal">
                {formatPrice(order.total)}
              </td>
              <td className="px-4 py-3 text-right">
                <Icon
                  name="chevron_right"
                  className="text-xl text-texto-secundario"
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
        <li key={order.id} className="border-b border-borde-divisor">
          <button
            type="button"
            onClick={() => onSelect(order)}
            aria-label={`Ver pedido ${order.id}`}
            className="flex w-full items-center gap-4 py-3 text-left"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-cuerpo-boton font-semibold text-texto-principal">
                {order.id}
              </span>
              <span className="text-cuerpo-chico text-texto-secundario">
                {order.customer.name}
              </span>
              <span className="text-cuerpo-chico text-texto-secundario">
                {order.date} · {itemCount(order)} producto
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-cuerpo font-bold text-texto-principal">
                {formatPrice(order.total)}
              </span>
              <Icon
                name="chevron_right"
                className="text-xl text-texto-secundario"
              />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Admin orders section (SN-251). No orders API exists yet, so the page reads
 * the static fixture in `src/data/adminOrders.ts`.
 *
 * Desktop is a master-detail: the table on the left and the selected order on
 * the right, defaulting to the newest one. The design only covers the list on
 * mobile, so selecting there swaps the list for a full-width detail with a
 * "‹ Pedidos" back link, matching the create/edit form's navigation pattern.
 */
export default function AdminOrdersPage() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected =
    ADMIN_ORDERS.find((order) => order.id === selectedId) ??
    (isDesktop ? (ADMIN_ORDERS[0] ?? null) : null);

  function select(order: Order) {
    setSelectedId(order.id);
  }

  if (!isDesktop) {
    if (selected) {
      return (
        <>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="inline-flex items-center text-cuerpo-chico text-texto-secundario"
          >
            <Icon name="chevron_left" className="text-xl" />
            Pedidos
          </button>
          <div className="mt-4">
            <OrderDetail order={selected} />
          </div>
        </>
      );
    }
    return (
      <>
        <h1 className="text-titulo-2 font-bold text-texto-principal">Pedidos</h1>
        <OrdersList orders={ADMIN_ORDERS} onSelect={select} />
      </>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div>
        <h1 className="text-titulo-2 font-bold text-texto-principal">
          Pedidos
        </h1>
        <div className="mt-6">
          <OrdersTable
            orders={ADMIN_ORDERS}
            selected={selected}
            onSelect={select}
          />
        </div>
      </div>
      {selected ? <OrderDetail order={selected} /> : null}
    </div>
  );
}
