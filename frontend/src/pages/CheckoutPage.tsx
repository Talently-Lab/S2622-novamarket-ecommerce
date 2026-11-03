import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@chakra-ui/react';
import { Link, Navigate, useNavigate } from 'react-router';
import CheckoutAuth from '../components/CheckoutAuth.tsx';
import Icon from '../components/icons/Icon.tsx';
import { SharedInput } from '../components/ui/Input.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { createOrder } from '../services/orderService.ts';
import type { PlacedOrder } from '../services/orderService.ts';
import { EMPTY_ADDRESS, shippingAddressSchema } from '../schemas/checkout.ts';
import type { ShippingAddress } from '../schemas/checkout.ts';
import type { CartItem } from '../types/cart.ts';
import { formatPrice } from '../utils/format.ts';

/** Router state carried to the confirmation screen after a successful order. */
export interface CheckoutConfirmationState {
  order: PlacedOrder;
  email: string;
}

/** A line the server can no longer serve: its stock dropped below the quantity. */
function isUnavailable(item: CartItem): boolean {
  return typeof item.stock === 'number' && item.quantity > item.stock;
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    totalItems,
    totalAmount,
    loading,
    clearCart,
    removeItem,
    refresh,
  } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShippingAddress, string>>
  >({});
  const [submitError, setSubmitError] = useState('');
  const [pending, setPending] = useState(false);

  // Figma `D - Checkout` (mobile 678:5294): a line that lost its stock is
  // shown, excluded from the total, and removed before continuing.
  const unavailable = items.filter(isUnavailable);
  const available = items.filter((item) => !isUnavailable(item));
  const blockedAmount = unavailable.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const payableAmount = totalAmount - blockedAmount;

  function updateField(field: keyof ShippingAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function readAddress(): ShippingAddress | null {
    const parsed = shippingAddressSchema.safeParse(address);
    if (parsed.success) {
      setErrors({});
      return parsed.data;
    }
    const fieldErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '') as keyof ShippingAddress;
      fieldErrors[field] ??= issue.message;
    }
    setErrors(fieldErrors);
    return null;
  }

  async function placeOrder(destination: ShippingAddress) {
    setSubmitError('');
    setPending(true);

    try {
      const order = await createOrder({
        items: available.map((item) => ({
          productId: item.productId,
          cantidad: item.quantity,
        })),
        total: payableAmount,
        direccionEnvio: destination,
      });
      const state: CheckoutConfirmationState = {
        order,
        email: user?.email ?? '',
      };
      navigate('/checkout/confirmacion', { replace: true, state });
      // The backend does not empty the cart after creating the order.
      void clearCart();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos registrar el pedido.';
      // The stock may have changed while the user was reviewing: re-read the
      // cart so the unavailable state can replace the generic error.
      const fresh = await refresh();
      const hasUnavailable = fresh
        ? fresh.some((item) => isUnavailable(item))
        : false;
      if (!hasUnavailable) setSubmitError(message);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // With an unavailable line the primary action removes it instead.
    if (unavailable.length > 0) return;
    const destination = readAddress();
    if (destination) void placeOrder(destination);
  }

  function handleRetry() {
    const destination = readAddress();
    if (destination) void placeOrder(destination);
  }

  async function handleRemoveUnavailable() {
    setSubmitError('');
    setPending(true);
    try {
      // Sequential: each mutation replaces the cart from the server response.
      for (const item of unavailable) {
        await removeItem(item.productId);
      }
    } finally {
      setPending(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="flex w-full justify-center px-4 pt-6 pb-20 md:px-20 md:pt-12 md:pb-[200px]">
        <p role="status" className="text-cuerpo text-texto-secundario">
          Cargando tu carrito…
        </p>
      </main>
    );
  }

  // Nothing to check out: send the user back to the cart.
  if (items.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  // Guest: show the designed gate instead of bouncing to /login, so the cart
  // and the checkout context survive the sign-in.
  if (!user) {
    return <CheckoutAuth />;
  }

  const hasUnavailable = unavailable.length > 0;
  const unavailableNames = unavailable
    .map((item) => `${item.name}, ${formatPrice(item.unitPrice)},`)
    .join(' ');
  const confirmLabel = pending ? 'Confirmando…' : 'Confirmar pedido';

  return (
    <main className="flex w-full justify-center px-4 pt-6 pb-20 md:px-20 md:pt-12 md:pb-[200px]">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-[1280px] flex-col gap-6"
      >
        <div className="flex flex-col gap-4">
          <Link
            to="/carrito"
            className="text-caption text-texto-secundario inline-flex items-center gap-1"
          >
            <Icon name="chevron_backward" className="text-base" />
            Volver a carrito
          </Link>
          <h1 className="text-titulo-1 text-texto-principal font-bold">
            Revisá tu pedido
          </h1>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex w-full flex-col gap-6 lg:w-[360px] lg:shrink-0">
            <section
              aria-labelledby="checkout-contact-title"
              className="border-borde-divisor rounded-lg border p-4"
            >
              <h2
                id="checkout-contact-title"
                className="text-cuerpo-boton text-texto-principal font-semibold"
              >
                Datos de contacto
              </h2>
              <div className="text-cuerpo-chico text-texto-principal mt-3 flex flex-col gap-1">
                <p>{user?.name ?? ''}</p>
                <p>{user?.email ?? ''}</p>
              </div>
            </section>

            <section
              aria-labelledby="checkout-address-title"
              className="border-borde-divisor flex flex-col gap-4 rounded-lg border p-4"
            >
              <h2
                id="checkout-address-title"
                className="text-cuerpo-boton text-texto-principal font-semibold"
              >
                Dirección de envío
              </h2>

              <SharedInput
                label="Calle y número"
                value={address.calle}
                onChange={(event) => updateField('calle', event.target.value)}
                isInvalid={Boolean(errors.calle)}
                errorText={errors.calle}
                autoComplete="address-line1"
                isDisabled={pending}
              />
              <SharedInput
                label="Ciudad"
                value={address.ciudad}
                onChange={(event) => updateField('ciudad', event.target.value)}
                isInvalid={Boolean(errors.ciudad)}
                errorText={errors.ciudad}
                autoComplete="address-level2"
                isDisabled={pending}
              />
              <SharedInput
                label="Provincia"
                value={address.provincia}
                onChange={(event) =>
                  updateField('provincia', event.target.value)
                }
                isInvalid={Boolean(errors.provincia)}
                errorText={errors.provincia}
                autoComplete="address-level1"
                isDisabled={pending}
              />
              <SharedInput
                label="Código postal"
                value={address.codigoPostal}
                onChange={(event) =>
                  updateField('codigoPostal', event.target.value)
                }
                isInvalid={Boolean(errors.codigoPostal)}
                errorText={errors.codigoPostal}
                autoComplete="postal-code"
                isDisabled={pending}
              />
            </section>
          </div>

          <section
            aria-labelledby="checkout-summary-title"
            className="flex w-full flex-col gap-6"
          >
            <h2
              id="checkout-summary-title"
              className="text-titulo-2 text-texto-principal font-bold"
            >
              Tu pedido ({totalItems})
            </h2>

            {hasUnavailable ? (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-4"
              >
                <p className="text-cuerpo-boton font-semibold text-red-700">
                  Uno producto ya no está disponible
                </p>
                <p className="text-cuerpo-chico mt-1 text-red-700">
                  Hicimos un ajuste en tu pedido. {unavailableNames} no se
                  vuelve a incluir en tu compra. No se realizó ningún cargo.
                </p>
              </div>
            ) : null}

            {submitError ? (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-4"
              >
                <p className="text-cuerpo-boton font-semibold text-red-700">
                  No pudimos confirmar tu pedido
                </p>
                <p className="text-cuerpo-chico mt-1 text-red-700">
                  {submitError} Tu pedido no se registró y no se realizó ningún
                  cargo.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <h3 className="text-titulo-3 text-texto-principal font-bold">
                Productos
              </h3>
              <ul className="divide-borde-divisor divide-y">
                {items.map((item) => {
                  const missing = isUnavailable(item);
                  return (
                    <li
                      key={item.productId}
                      className={`flex items-center gap-3 py-3 ${
                        missing ? 'rounded-md bg-red-50 px-2' : ''
                      }`}
                    >
                      <div className="bg-fondo-deshabilitado flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Icon
                            name="image_not_supported"
                            className="text-texto-secundario text-xl"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-cuerpo text-texto-principal line-clamp-2 font-semibold">
                          {item.name}
                        </p>
                        <p className="text-cuerpo-chico text-texto-secundario">
                          Cantidad: {item.quantity}
                        </p>
                        {missing ? (
                          <span className="text-caption-badge mt-1 inline-flex rounded-full bg-red-200 px-2 py-0.5 font-semibold text-red-700">
                            Sin stock
                          </span>
                        ) : null}
                      </div>
                      <span className="text-precio text-texto-principal font-bold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex w-full flex-col items-end gap-6">
              {/* Figma: the totals card spans the whole summary column. */}
              <div className="border-borde-divisor bg-fondo-superficie w-full rounded-2xl border p-6">
                <div className="text-cuerpo-chico text-texto-secundario flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="text-cuerpo-chico text-texto-secundario mt-2 flex items-center justify-between">
                  <span>Descuentos</span>
                  <span>-{formatPrice(0)}</span>
                </div>
                {hasUnavailable ? (
                  <div className="text-cuerpo-chico mt-2 flex items-center justify-between text-red-700">
                    <span>Producto sin stock</span>
                    <span>-{formatPrice(blockedAmount)}</span>
                  </div>
                ) : null}
                <div className="border-borde-divisor mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-titulo-3 text-texto-principal font-bold">
                    Total
                  </span>
                  <span className="text-precio text-texto-principal font-bold">
                    {formatPrice(payableAmount)}
                  </span>
                </div>
              </div>

              {/* Figma: full width on mobile, a fixed 280px CTA on desktop.
                  The wrapper carries the responsive width because the shared
                  button recipe pins `width: 240px`, which wins over Tailwind
                  utilities; the inline 100% is what beats that recipe. */}
              <div className="flex w-full flex-col gap-3 lg:w-[280px]">
                {hasUnavailable ? (
                  <Button
                    type="button"
                    variant="primary"
                    loading={pending}
                    onClick={() => void handleRemoveUnavailable()}
                    style={{ width: '100%', height: '48px' }}
                  >
                    Quitar y continuar
                  </Button>
                ) : submitError ? (
                  <Button
                    type="button"
                    variant="primary"
                    loading={pending}
                    onClick={handleRetry}
                    style={{ width: '100%', height: '48px' }}
                  >
                    Reintentar
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={pending}
                    style={{ width: '100%', height: '48px' }}
                  >
                    {confirmLabel}
                  </Button>
                )}

                <Button
                  asChild
                  variant="secondary"
                  style={{ width: '100%', height: '48px' }}
                >
                  <Link to="/carrito">Volver al carrito</Link>
                </Button>
              </div>

              <p className="text-cuerpo-chico text-texto-secundario flex items-center gap-2 text-left lg:text-right">
                <Icon name="info" className="text-base" />
                Al confirmar se registra el pedido. No se realiza ningún cobro.
              </p>
            </div>
          </section>
        </div>
      </form>
    </main>
  );
}
