import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api.ts';
import { login, me, register } from './authService.ts';

vi.mock('./api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api.ts')>();
  return { ...actual, apiFetch: vi.fn() };
});

const mockedApiFetch = vi.mocked(apiFetch);

const backendClientUser = {
  _id: 'abc123',
  nombre: 'Ana Pérez',
  email: 'ana@example.com',
  rol: 'client',
  carrito: { items: [], fechaCreacion: null, fechaActualizacion: null },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  __v: 0,
};

const backendAdminUser = {
  ...backendClientUser,
  _id: 'admin1',
  nombre: 'Admin',
  email: 'admin@example.com',
  rol: 'admin',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService', () => {
  it('login posts credentials and maps backend user to frontend User', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      message: 'Login exitoso',
      data: { token: 'jwt-token', user: backendClientUser },
    });

    const result = await login('ana@example.com', 'ClaveSegura1');

    expect(mockedApiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'ana@example.com', password: 'ClaveSegura1' },
    });
    expect(result).toEqual({
      token: 'jwt-token',
      user: {
        id: 'abc123',
        name: 'Ana Pérez',
        email: 'ana@example.com',
        role: 'cliente',
      },
    });
    expect('password' in result.user).toBe(false);
  });

  it('login propagates ApiError on invalid credentials (401)', async () => {
    mockedApiFetch.mockRejectedValueOnce(
      new ApiError('Credenciales inválidas', 401),
    );

    const error = await login('ana@example.com', 'wrong').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
  });

  it('register sends nombre and maps rol client to cliente', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      message: 'Usuario registrado correctamente',
      data: { token: 'jwt-token', user: backendClientUser },
    });

    const result = await register(
      'Ana Pérez',
      'ana@example.com',
      'ClaveSegura1',
    );

    expect(mockedApiFetch).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: {
        nombre: 'Ana Pérez',
        email: 'ana@example.com',
        password: 'ClaveSegura1',
      },
    });
    expect(result.user.role).toBe('cliente');
    expect(result.token).toBe('jwt-token');
  });

  it('register propagates ApiError when the email is taken (400)', async () => {
    mockedApiFetch.mockRejectedValueOnce(
      new ApiError('El email ya está registrado', 400),
    );

    const error = await register('Ana', 'ana@example.com', 'ClaveSegura1').catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
  });

  it('me fetches the session and maps an admin user', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      message: 'Operación exitosa',
      data: backendAdminUser,
    });

    const user = await me();

    expect(mockedApiFetch).toHaveBeenCalledWith('/auth/me');
    expect(user).toEqual({
      id: 'admin1',
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin',
    });
  });

  it('me throws ApiError when the backend returns no user', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      ok: true,
      message: null,
      data: null,
    });

    const error = await me().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
  });
});
