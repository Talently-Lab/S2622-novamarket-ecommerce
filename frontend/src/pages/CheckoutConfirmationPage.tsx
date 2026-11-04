import { Button } from '@chakra-ui/react';
import { Link, Navigate, useLocation } from 'react-router';
import Icon from '../components/icons/Icon.tsx';
import type { CheckoutConfirmationState } from './CheckoutPage.tsx';
import { formatPrice } from '../utils/format.ts';

/**
 * Post-checkout confirmation (Figma `D - Confirmación`). The order arrives in
 * the router state from the checkout POST: the backend has no single-order
 * endpoint that returns data (`GET /orders/:id` responds `data: null`), so a
 * direct visit without state has nothing truthful to show.
 */
export default function CheckoutConfirmationPage() {
  const location = useLocation();
  const state = location.state as CheckoutConfirmationState | null;

  if (!state?.order) {
    return <Navigate to="/" replace />;
  }

  const { order, email } = state;

  return (
    <main className="flex w-full justify-center px-4 pt-6 pb-20 md:px-20 md:pt-12 md:pb-[200px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-6">
        <div className="bg-fondo-exito mt-8 flex h-16 w-16 items-center justify-center rounded-full">
          <Icon name="check" className="text-texto-sobre-exito text-3xl" />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-titulo-2 text-texto-principal font-bold">
            ¡Pedido confirmado!
          </h1>
          <p className="text-cuerpo text-texto-secundario">
            Número de pedido #{order.code}
          </p>
        </div>

        <div className="border-borde-divisor w-full max-w-[560px] rounded-lg border p-4">
          <dl className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-cuerpo-chico text-texto-secundario">
                Productos
              </dt>
              <dd className="text-cuerpo-chico text-texto-principal">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-cuerpo-chico text-texto-secundario">
                Contacto
              </dt>
              <dd className="text-cuerpo-chico text-texto-principal">
                {email}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-cuerpo-chico text-texto-secundario">Total</dt>
              <dd className="text-cuerpo-chico text-texto-principal font-semibold">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        <Button
          variant="primary"
          asChild
          style={{ width: '280px', maxWidth: '100%', height: '48px' }}
        >
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
