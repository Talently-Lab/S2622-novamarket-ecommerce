import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';
import { loginSchema } from '../schemas/auth.ts';

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

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
      const loggedUser = await login(email, password);
      navigate(loggedUser.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Credenciales inválidas.',
      );
    } finally {
      setPending(false);
    }
  }

  const disabled = pending || authLoading;

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center bg-fondo-superficie px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-titulo-2 font-bold text-texto-principal">
            Ingresá a tu cuenta
          </h1>
          <p className="mt-2 text-cuerpo text-texto-secundario">
            Tu cuenta se mantiene
          </p>
        </div>

        {formError ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {formError}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-caption font-semibold text-texto-principal"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              disabled={disabled}
              className={`w-full rounded-md border px-3 py-2 text-cuerpo focus:outline-none ${
                errors.email
                  ? 'border-red-500'
                  : 'border-borde-divisor focus:border-borde-foco'
              }`}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-caption font-semibold text-texto-principal"
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              disabled={disabled}
              className={`w-full rounded-md border px-3 py-2 text-cuerpo focus:outline-none ${
                errors.password
                  ? 'border-red-500'
                  : 'border-borde-divisor focus:border-borde-foco'
              }`}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-md bg-accion-acento py-3 text-cuerpo-boton font-semibold text-texto-sobre-accion transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>

        <div className="text-center text-caption text-texto-secundario">
          <p>
            ¿No tenés cuenta?{' '}
            <Link
              to="/registro"
              state={{ origen: 'login' }}
              className="font-semibold text-accion-primaria hover:underline"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}