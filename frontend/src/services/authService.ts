import type { User } from '../types/auth.ts';
import { ApiError } from './api.ts';

export interface AuthResult {
  user: User;
  token: string;
}

const ADMIN_USER: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
};

const ADMIN_TOKEN = 'fake-jwt-admin';
const CLIENT_TOKEN_PREFIX = 'fake-jwt-cliente.';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function encodeClienteToken(name: string, email: string): string {
  return `${CLIENT_TOKEN_PREFIX}${btoa(JSON.stringify({ name, email }))}`;
}

function decodeClienteToken(token: string): User | null {
  if (!token.startsWith(CLIENT_TOKEN_PREFIX)) return null;
  try {
    const payload = JSON.parse(
      atob(token.slice(CLIENT_TOKEN_PREFIX.length)),
    ) as { name?: string; email?: string };
    if (!payload.name || !payload.email) return null;
    return {
      id: `cliente-${payload.email}`,
      name: payload.name,
      email: payload.email,
      role: 'cliente',
    };
  } catch {
    return null;
  }
}

/**
 * Simulated login.
 * TODO: replace the simulated body with the real endpoint POST /api/auth/login
 * via apiFetch<AuthResult>('/auth/login', { method: 'POST', body: { email, password } }).
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  await delay(300);
  if (email === 'admin@example.com' && password === '123456') {
    return { user: ADMIN_USER, token: ADMIN_TOKEN };
  }
  throw new ApiError('Invalid credentials', 401);
}

/**
 * Simulated registration (always creates a cliente user).
 * TODO: replace the simulated body with the real endpoint POST /api/auth/register
 * via apiFetch<AuthResult>('/auth/register', { method: 'POST', body: { name, email, password } }).
 */
export async function register(
  name: string,
  email: string,
  _password: string,
): Promise<AuthResult> {
  void _password;
  await delay(300);
  const user: User = { id: `cliente-${email}`, name, email, role: 'cliente' };
  return { user, token: encodeClienteToken(name, email) };
}

/**
 * Simulated session restore from a stored token.
 * TODO: replace the simulated body with the real endpoint GET /api/auth/me
 * via apiFetch<User>('/auth/me').
 */
export async function me(token: string): Promise<User> {
  await delay(150);
  if (token === ADMIN_TOKEN) return ADMIN_USER;
  const cliente = decodeClienteToken(token);
  if (cliente) return cliente;
  throw new ApiError('Invalid token', 401);
}
