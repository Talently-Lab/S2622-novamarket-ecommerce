import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL, ApiError, apiFetch, TOKEN_STORAGE_KEY } from './api.ts';

const fetchMock = vi.fn();

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function lastFetchArgs(): [string, RequestInit | undefined] {
  return fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [
    string,
    RequestInit | undefined,
  ];
}

function lastFetchHeaders(): Headers {
  const [, init] = lastFetchArgs();
  return new Headers(init?.headers);
}

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch (SN-99 interceptor del token)', () => {
  it('con token en localStorage sale con header Authorization: Bearer <token>', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'test-token');
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch('/auth/me');

    const [url] = lastFetchArgs();
    expect(url).toBe(`${API_BASE_URL}/auth/me`);
    expect(lastFetchHeaders().get('Authorization')).toBe('Bearer test-token');
  });

  it('sin token sale SIN header Authorization', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch('/auth/login', {
      method: 'POST',
      body: { email: 'ana@example.com', password: 'ClaveSegura1' },
    });

    expect(lastFetchHeaders().get('Authorization')).toBeNull();
  });

  it('con body objeto y sin Content-Type serializa a JSON', async () => {
    const body = { email: 'ana@example.com', password: 'ClaveSegura1' };
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch('/auth/login', { method: 'POST', body });

    const [, init] = lastFetchArgs();
    expect(lastFetchHeaders().get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe(JSON.stringify(body));
  });

  it('respuesta 401 con {message} rechaza con ApiError del backend y status 401', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Token inválido' }, 401));

    const error = await apiFetch('/auth/me').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba un ApiError');
    }
    expect(error.message).toBe('Token inválido');
    expect(error.status).toBe(401);
  });

  it('respuesta no-JSON exitosa resuelve el texto plano', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('servidor ok', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    const result = await apiFetch<string>('/health');

    expect(result).toBe('servidor ok');
  });

  it('respeta VITE_API_URL en la URL construida', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch('/auth/me');

    const expectedBase = (
      (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'
    ).replace(/\/+$/, '');
    expect(API_BASE_URL).toBe(expectedBase);
    const [url] = lastFetchArgs();
    expect(url).toBe(`${expectedBase}/auth/me`);
  });
});
