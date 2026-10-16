import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api.ts';
import { getProducts, getProductsFromApi } from './productService.ts';
import { products as mockProducts } from '../mocks/products.ts';

vi.mock('./api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api.ts')>();
  return { ...actual, apiFetch: vi.fn() };
});

const mockedApiFetch = vi.mocked(apiFetch);

function backendDto(overrides = {}) {
  return {
    _id: 'mongo-id-1',
    nombre: 'Auriculares NovaSound X1',
    descripcion: 'Auriculares inalambricos over-ear',
    precio: 45999.9,
    stock: 24,
    categoria: 'accesorios',
    imagenUrl: 'https://example.com/x1.png',
    ...overrides,
  };
}

function envelope(data: unknown) {
  return { ok: true, message: 'Operación exitosa', data };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('productService.getProductsFromApi', () => {
  it('maps backend DTO fields to the frontend Product shape', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope([backendDto()]));

    const products = await getProductsFromApi();

    expect(mockedApiFetch).toHaveBeenCalledWith('/products', {
      signal: undefined,
    });
    expect(products).toEqual([
      {
        id: 'mongo-id-1',
        name: 'Auriculares NovaSound X1',
        description: 'Auriculares inalambricos over-ear',
        price: 45999.9,
        stock: 24,
        category: 'accesorios',
        imageUrl: 'https://example.com/x1.png',
      },
    ]);
  });

  it('treats data:null as an empty result without falling back to mocks', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope(null));

    const products = await getProductsFromApi();

    expect(products).toEqual([]);
  });

  it('sends categoria as query param and filters client-side', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      envelope([
        backendDto({ _id: 'a', categoria: 'accesorios' }),
        backendDto({ _id: 'b', categoria: 'gadgets' }),
      ]),
    );

    const products = await getProductsFromApi('accesorios');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/products?categoria=accesorios',
      { signal: undefined },
    );
    expect(products.map((product) => product.id)).toEqual(['a']);
  });

  it('throws ApiError on a non-array data payload instead of succeeding', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope({ bogus: true }));

    const error = await getProductsFromApi().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
  });

  it('throws ApiError when any DTO is malformed', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      envelope([backendDto(), backendDto({ _id: 'bad', precio: 'free' })]),
    );

    const error = await getProductsFromApi().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
  });

  it('propagates ApiError from failed HTTP responses', async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError('Server error', 500));

    const error = await getProductsFromApi().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
  });
});

describe('productService.getProducts (temporary CSV source)', () => {
  it('returns the 20 CSV rows without calling fetch', async () => {
    const products = await getProducts();

    expect(mockedApiFetch).not.toHaveBeenCalled();
    expect(products).toHaveLength(20);
    expect(products).toEqual(mockProducts);
  });

  it('filters by category locally without calling fetch', async () => {
    const products = await getProducts('gadgets');

    expect(mockedApiFetch).not.toHaveBeenCalled();
    expect(products.length).toBeGreaterThan(0);
    expect(
      products.every((product) => product.category === 'gadgets'),
    ).toBe(true);
  });

  it('respects an aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();

    const error = await getProducts(undefined, controller.signal).catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(DOMException);
    expect(mockedApiFetch).not.toHaveBeenCalled();
  });
});
