import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';
import { registerSchema } from '../schemas/auth.ts';

export default function RegisterPage() {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

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
      const newUser = await register(name, email, password);
      navigate(newUser.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No pudimos crear la cuenta.',
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
            Crear cuenta
          </h1>
          <p className="mt-2 text-cuerpo text-texto-secundario">
            Para ver tus pedidos cuando quieras
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
              htmlFor="register-name"
              className="mb-1 block text-caption font-semibold text-texto-principal"
            >
              Nombre y apellido
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre Apellido"
              disabled={disabled}
              className={`w-full rounded-md border px-3 py-2 text-cuerpo focus:outline-none ${
                errors.name
                  ? 'border-red-500'
                  : 'border-borde-divisor focus:border-borde-foco'
              }`}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-1 block text-caption font-semibold text-texto-principal"
            >
              Email
            </label>
            <input
              id="register-email"
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
              htmlFor="register-password"
              className="mb-1 block text-caption font-semibold text-texto-principal"
            >
              Contraseña
            </label>
            <input
              id="register-password"
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
            <p className="mt-1 text-xs text-texto-secundario">
              Mínimo 8 caracteres, con mayúscula, minúscula y número
            </p>
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="register-confirm"
              className="mb-1 block text-caption font-semibold text-texto-principal"
            >
              Confirmar contraseña
            </label>
            <input
              id="register-confirm"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              disabled={disabled}
              className={`w-full rounded-md border px-3 py-2 text-cuerpo focus:outline-none ${
                errors.confirmPassword
                  ? 'border-red-500'
                  : 'border-borde-divisor focus:border-borde-foco'
              }`}
            />
            {errors.confirmPassword ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-md bg-accion-acento py-3 text-cuerpo-boton font-semibold text-texto-sobre-accion transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="text-center text-caption text-texto-secundario">
          <p>
            ¿Ya tenés cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-accion-primaria hover:underline"
            >
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
