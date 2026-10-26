import { Button } from '@chakra-ui/react';
import { Link } from 'react-router';
import FeaturedProducts from '../components/FeaturedProducts.tsx';
import Icon from '../components/icons/Icon.tsx';
import type { CartItem } from '../types/cart.ts';
import { formatPrice } from '../utils/format.ts';

export interface CartPageProps {
  items?: CartItem[];
  discount?: number;
  onIncrement?: (productId: string) => void;
  onDecrement?: (productId: string) => void;
  onRemove?: (productId: string) => void;
  onCheckout?: () => void;
}

const noop = () => {};

function stockLabel(stock: number): string {
  return stock === 1 ? 'Última unidad' : `Últimas ${stock} unidades`;
}

function CartRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}) {
  const lineSubtotal = item.unitPrice * item.quantity;
  const stock = item.stock ?? 0;
  const showStock = stock > 0 && stock <= 2;

  return (
    <li className="grid grid-cols-[76px_minmax(0,1fr)] gap-x-3 py-4 lg:grid-cols-[76px_minmax(0,1fr)_minmax(5.5rem,8rem)_minmax(7rem,9.5rem)_minmax(6rem,8rem)_64px] lg:items-center lg:gap-x-0">
      <div className="bg-fondo-deshabilitado flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-md">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon
            name="image_not_supported"
            className="text-texto-secundario text-2xl"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 lg:contents">
        <p className="text-cuerpo text-texto-principal line-clamp-2 font-semibold lg:col-start-2">
          {item.name}
        </p>
        <p className="text-cuerpo-chico text-texto-secundario lg:hidden">
          {formatPrice(item.unitPrice)} c/u
        </p>

        {showStock ? (
          <p className="text-cuerpo-chico text-texto-secundario flex items-center gap-1 lg:hidden">
            <Icon name="info" className="text-texto-secundario text-base" />
            {stockLabel(stock)}
          </p>
        ) : null}

        <p className="text-cuerpo text-texto-secundario hidden lg:col-start-3 lg:block">
          {formatPrice(item.unitPrice)}
        </p>

        <div className="mt-1 flex items-center justify-between gap-3 lg:contents">
          <div
            role="group"
            aria-label={`Cantidad de ${item.name}`}
            className="border-texto-secundario inline-flex h-10 items-center rounded-md border lg:col-start-4 lg:justify-self-start"
          >
            <button
              type="button"
              aria-label={`Restar cantidad de ${item.name}`}
              disabled={item.quantity === 1}
              onClick={() => onDecrement(item.productId)}
              className="text-texto-secundario hover:bg-fondo-pagina focus-visible:outline-borde-foco flex h-full w-10 items-center justify-center rounded-l-md focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon name="remove" className="text-lg" />
            </button>
            <span className="text-cuerpo-boton text-texto-principal min-w-8 px-1 text-center font-semibold">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Sumar cantidad de ${item.name}`}
              onClick={() => onIncrement(item.productId)}
              className="text-texto-secundario hover:bg-fondo-pagina focus-visible:outline-borde-foco flex h-full w-10 items-center justify-center rounded-r-md focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Icon name="add" className="text-lg" />
            </button>
          </div>

          <div className="flex items-center gap-1 lg:contents">
            <span className="text-precio text-texto-principal font-bold lg:col-start-5 lg:justify-self-start">
              {formatPrice(lineSubtotal)}
            </span>
            <button
              type="button"
              aria-label={`Eliminar ${item.name}`}
              onClick={() => onRemove(item.productId)}
              className="text-texto-secundario hover:bg-fondo-pagina focus-visible:outline-borde-foco flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 lg:col-start-6 lg:justify-self-end"
            >
              <Icon name="delete" className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <Icon name="shopping_cart" className="text-texto-secundario text-7xl" />
      <h1 className="text-titulo-2 text-texto-principal mt-6 font-bold">
        Tu carrito está vacío
      </h1>
      <p className="text-cuerpo text-texto-secundario mt-2">
        Sumá productos para armar tu setup
      </p>
      <Button
        variant="primary"
        asChild
        style={{ width: '100%' }}
        className="mt-6"
      >
        <Link to="/productos">Ver catálogo</Link>
      </Button>
      <div className="mt-10 w-full text-left">
        <FeaturedProducts title="Más vendidos" />
      </div>
    </div>
  );
}

export default function CartPage({
  items = [],
  discount = 0,
  onIncrement = noop,
  onDecrement = noop,
  onRemove = noop,
  onCheckout = noop,
}: CartPageProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const total = subtotal - discount;

  return (
    <main
      className={
        items.length === 0
          ? 'mx-auto max-w-2xl px-4 py-6 sm:px-6'
          : 'mx-auto max-w-7xl px-4 py-6 sm:px-6'
      }
    >
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
          <section aria-label="Productos del carrito">
            <h1 className="text-titulo-2 text-texto-principal font-bold">
              Tu carrito
            </h1>

            <div className="border-borde-divisor text-cuerpo-chico text-texto-secundario mt-6 hidden border-b pb-2 font-semibold lg:grid lg:grid-cols-[76px_minmax(0,1fr)_minmax(5.5rem,8rem)_minmax(7rem,9.5rem)_minmax(6rem,8rem)_64px]">
              <span className="lg:col-span-2 lg:col-start-1">Producto</span>
              <span className="lg:col-start-3">Precio</span>
              <span className="lg:col-start-4">Cantidad</span>
              <span className="lg:col-start-5">Subtotal</span>
            </div>

            <ul className="divide-borde-divisor mt-4 divide-y lg:mt-0">
              {items.map((item) => (
                <CartRow
                  key={item.productId}
                  item={item}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </section>

          <aside
            aria-labelledby="cart-summary-title"
            className="border-borde-divisor lg:bg-fondo-superficie mt-6 border-t pt-4 lg:mt-0 lg:rounded-xl lg:border lg:p-6"
          >
            <h2
              id="cart-summary-title"
              className="text-titulo-3 text-texto-principal sr-only font-bold lg:not-sr-only lg:mb-4"
            >
              Resumen
            </h2>

            <div className="text-cuerpo text-texto-secundario flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="text-cuerpo text-texto-secundario mt-2 flex items-center justify-between">
              <span>Descuentos</span>
              <span>-{formatPrice(discount)}</span>
            </div>
            <div className="border-borde-divisor mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-titulo-3 text-texto-principal font-bold">
                Total
              </span>
              <span className="text-precio text-texto-principal font-bold">
                {formatPrice(total)}
              </span>
            </div>

            <Button
              variant="primary"
              style={{ width: '100%' }}
              className="mt-6"
              onClick={onCheckout}
            >
              Continuar compra
            </Button>
          </aside>

          <p className="mt-4 text-center lg:col-start-1 lg:row-start-2 lg:text-left">
            <Link
              to="/productos"
              className="text-cuerpo-boton text-texto-principal inline-flex items-center gap-1 font-semibold underline"
            >
              {/* Wrapper: the icon font stylesheet sets its own `display`, which
                  beats the `hidden` utility, so the hiding happens here. */}
              <span className="hidden lg:inline-flex">
                <Icon name="arrow_back" className="text-base" />
              </span>
              Seguir comprando
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
