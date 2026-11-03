import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, API_BASE_URL, TOKEN_STORAGE_KEY } from './api.ts';
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} from './cartService.ts';

const fetchMock = vi.fn();

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const CART = {
  items: [
    {
      productId: '507f1f77bcf86cd799439011',
      nombre: 'Auriculares inalámbricos',
      precio: 50,
      imagenUrl: 'https://example.com/auriculares.jpg',
      stock: 12,
      cantidad: 2,
      subtotal: 100,
    },
  ],
  totalUnidades: 2,
  total: 100,
  fechaCreacion: '2026-10-22T14:00:00.000Z',
  fechaActualizacion: '2026-10-22T14:05:00.000Z',
};

function envelope(data: unknown = CART) {
  return { ok: true, message: 'ok', data };
}

function lastFetchArgs(): [string, RequestInit | undefined] {
  return fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [
    string,
    RequestInit | undefined,
  ];
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(TOKEN_STORAGE_KEY, 'test-token');
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cartService', () => {
  it('maps the backend cart into the local display shape', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(envelope()));

    const cart = await getCart();

    expect(cart).toEqual({
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
          name: 'Auriculares inalámbricos',
          unitPrice: 50,
          quantity: 2,
          stock: 12,
          imageUrl: 'https://example.com/auriculares.jpg',
        },
      ],
      totalItems: 2,
      totalAmount: 100,
    });

    const [url, init] = lastFetchArgs();
    expect(url).toBe(`${API_BASE_URL}/cart`);
    expect(init?.method).toBeUndefined();
  });

  it('adds a product with cantidad 1 by default', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(envelope(), 201));

    await addToCart('507f1f77bcf86cd799439011');

    const [url, init] = lastFetchArgs();
    expect(url).toBe(`${API_BASE_URL}/cart`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      productId: '507f1f77bcf86cd799439011',
      cantidad: 1,
    });
  });

  it('patches an absolute quantity and encodes the product id', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(envelope()));

    await setCartItemQuantity('a/b', 3);

    const [url, init] = lastFetchArgs();
    expect(url).toBe(`${API_BASE_URL}/cart/a%2Fb`);
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({ cantidad: 3 });
  });

  it('deletes one line and the whole cart', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(envelope()));

    await removeCartItem('507f1f77bcf86cd799439011');
    expect(lastFetchArgs()[0]).toBe(
      `${API_BASE_URL}/cart/507f1f77bcf86cd799439011`,
    );
    expect(lastFetchArgs()[1]?.method).toBe('DELETE');

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        envelope({
          items: [],
          totalUnidades: 0,
          total: 0,
          fechaCreacion: null,
          fechaActualizacion: null,
        }),
      ),
    );

    const cleared = await clearCart();
    expect(lastFetchArgs()[0]).toBe(`${API_BASE_URL}/cart`);
    expect(lastFetchArgs()[1]?.method).toBe('DELETE');
    expect(cleared).toEqual({ items: [], totalItems: 0, totalAmount: 0 });
  });

  it('throws ApiError on a malformed payload instead of returning an empty cart', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true, data: null }));

    await expect(getCart()).rejects.toBeInstanceOf(ApiError);
  });

  it('propagates the backend message for stock conflicts', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          ok: false,
          message: 'Stock insuficiente para Teclado. Disponibles: 1',
          error: null,
        },
        409,
      ),
    );

    await expect(addToCart('507f1f77bcf86cd799439011')).rejects.toThrow(
      'Stock insuficiente para Teclado. Disponibles: 1',
    );
  });
});
