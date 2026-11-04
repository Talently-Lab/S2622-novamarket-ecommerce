import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@chakra-ui/react';
import { Link } from 'react-router';
import Icon from './icons/Icon.tsx';
import { SharedInput } from './ui/Input.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { loginSchema } from '../schemas/auth.ts';
import { formatPrice } from '../utils/format.ts';

/**
 * Guest gate for the checkout (Figma `D - Como continuar`, desktop 654:4131 /
 * mobile 236:1325). A guest keeps their cart while logging in, so this screen
 * is shown in place of the review step instead of redirecting to `/login`
 * and losing the checkout context.
 */
export default function CheckoutAuth() {
  const { login } = useAuth();
  const { totalItems, totalAmount } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? 'form');
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      // On success the auth state flips and the checkout renders the review
      // step; the guest cart merges into the server cart on its own.
      await login(result.data.email, result.data.password);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Credenciales inválidas.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex w-full justify-center px-4 pt-6 pb-20 md:px-20 md:pt-12 md:pb-[200px]">
      <div className="flex w-full max-w-[1280px] flex-col gap-6">
        <Link
          to="/carrito"
          className="text-caption text-texto-secundario inline-flex items-center gap-1"
        >
          <Icon name="chevron_backward" className="text-base" />
          Volver a carrito
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-titulo-2 text-texto-principal lg:text-titulo-1 font-bold">
              Ingresá para finalizar tu compra
            </h1>
            <p className="text-cuerpo text-texto-secundario">
              Tu carrito se mantiene mientras ingresás.
            </p>
          </div>

          <div className="bg-fondo-deshabilitado text-caption text-texto-principal inline-flex w-fit items-center gap-4 rounded-md px-4 py-2">
            <span>
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
            <span className="font-semibold">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 lg:max-w-[760px] lg:flex-row lg:items-start">
          <section
            aria-labelledby="checkout-login-title"
            className="border-borde-divisor w-full rounded-lg border p-4"
          >
            <h2
              id="checkout-login-title"
              className="text-titulo-3 text-texto-principal font-bold"
            >
              Ya tengo cuenta
            </h2>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-4 flex flex-col gap-4"
            >
              <SharedInput
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                isInvalid={Boolean(errors.email)}
                errorText={errors.email}
                autoComplete="email"
                isDisabled={pending}
              />
              <SharedInput
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                isInvalid={Boolean(errors.password)}
                errorText={errors.password}
                autoComplete="current-password"
                isDisabled={pending}
                icon={
                  <button
                    type="button"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="text-texto-secundario flex items-center"
                  >
                    <Icon
                      name={showPassword ? 'visibility_off' : 'visibility'}
                      className="text-lg"
                    />
                  </button>
                }
              />
              <Button
                type="submit"
                variant="primary"
                loading={pending}
                style={{ width: '100%', height: '48px' }}
              >
                Ingresar
              </Button>
            </form>
          </section>

          <section
            aria-labelledby="checkout-register-title"
            className="border-borde-divisor w-full rounded-lg border p-4"
          >
            <h2
              id="checkout-register-title"
              className="text-titulo-3 text-texto-principal font-bold"
            >
              ¿Primera vez en NovaMarket?
            </h2>
            <p className="text-cuerpo-chico text-texto-secundario mt-2">
              Creá tu cuenta con nombre, email y contraseña. Vas a poder ver tus
              pedidos cuando quieras.
            </p>
            <Button
              asChild
              variant="secondary"
              className="mt-4"
              style={{ width: '100%', height: '48px' }}
            >
              <Link
                to="/registro"
                state={{ origen: 'checkout', from: '/checkout' }}
              >
                Crear mi cuenta
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}
