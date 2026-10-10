import type { Role, User } from '../types/auth.ts';
import { ApiError, apiFetch } from './api.ts';

export interface AuthResult {
  user: User;
  token: string;
}

/** User shape returned by the backend (Mongo + Spanish field names). */
interface BackendUser {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthData {
  token: string;
  user: BackendUser;
}

/**
 * Backend wraps results in `{ ok, message, data }` (see
 * backend/src/helpers/response.helper.js). The bare `{ token, user }`
 * shape is also accepted so the service does not break if the
 * envelope ever changes.
 */
type AuthResponse = {
  ok: boolean;
  message: string;
  data: AuthData | null;
} | AuthData;

type MeResponse = {
  ok: boolean;
  message: string;
  data: BackendUser | { user: BackendUser } | null;
} | BackendUser;

function isBackendUser(value: unknown): value is BackendUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    'nombre' in value &&
    'email' in value
  );
}

function mapRole(rol: string): Role {
  return rol === 'admin' ? 'admin' : 'cliente';
}

function mapUser(raw: BackendUser): User {
  return {
    id: String(raw._id),
    name: raw.nombre,
    email: raw.email,
    role: mapRole(raw.rol),
  };
}

function unwrapAuthData(response: AuthResponse, fallbackMessage: string): AuthData {
  const data =
    response !== null &&
    typeof response === 'object' &&
    'data' in response
      ? response.data
      : (response as AuthData);
  if (!data?.token || !isBackendUser(data.user)) {
    const message =
      typeof response === 'object' && response !== null && 'message' in response
        ? response.message
        : fallbackMessage;
    throw new ApiError(message || fallbackMessage);
  }
  return data;
}

/**
 * Login against POST /api/auth/login.
 * Sends `{ email, password }` and returns only `{ user, token }`
 * (never persists or returns the password).
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const response = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  const data = unwrapAuthData(response, 'Login failed');
  return { user: mapUser(data.user), token: data.token };
}

/**
 * Register against POST /api/auth/register.
 * The backend validates `nombre` (min 2 chars), so the frontend
 * `name` is sent as `nombre`.
 */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const response = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { nombre: name, email, password },
  });
  const data = unwrapAuthData(response, 'Registration failed');
  return { user: mapUser(data.user), token: data.token };
}

/**
 * Restore the session against GET /api/auth/me.
 * The token is injected from localStorage by `apiFetch`, so no
 * parameter is needed (single source of truth).
 */
export async function me(): Promise<User> {
  const response = await apiFetch<MeResponse>('/auth/me');
  const data =
    response !== null && typeof response === 'object' && 'data' in response
      ? response.data
      : (response as BackendUser);
  const raw = isBackendUser(data)
    ? data
    : data !== null &&
        typeof data === 'object' &&
        'user' in data &&
        isBackendUser(data.user)
      ? data.user
      : null;
  if (!raw) {
    const message =
      typeof response === 'object' && response !== null && 'message' in response
        ? response.message
        : null;
    throw new ApiError(message || 'Invalid session', 401);
  }
  return mapUser(raw);
}
