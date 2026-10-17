import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api.ts';
import { getProductById, getProducts, getProductsFromApi } from './productService.ts';
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
  return { ok: true, message: 'Productos encontrados', data };
}

/** A `GET /api/products` page payload, as the backend shapes it. */
function page(products: unknown[]) {
  return envelope({ products, totalProducts: products.length });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('productService.getProductsFromApi', () => {
  it('unwraps data.products and maps the backend DTO to Product', async () => {
    mockedApiFetch.mockResolvedValueOnce(page([backendDto()]));

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

  it('reads an empty page as an empty result', async () => {
    mockedApiFetch.mockResolvedValueOnce(page([]));

    const products = await getProductsFromApi();

    expect(products).toEqual([]);
  });

  it('treats data:null as an empty result without falling back to mocks', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope(null));

    const products = await getProductsFromApi();

    expect(products).toEqual([]);
  });

  it('sends category as query param and re-filters client-side', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      page([
        backendDto({ _id: 'a', categoria: 'accesorios' }),
        backendDto({ _id: 'b', categoria: 'gadgets' }),
      ]),
    );

    const products = await getProductsFromApi('accesorios');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/products?category=accesorios',
      { signal: undefined },
    );
    expect(products.map((product) => product.id)).toEqual(['a']);
  });

  it('accepts DTOs without descripcion or imagenUrl', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      page([
        {
          _id: 'minimal-1',
          nombre: 'Producto minimo',
          precio: 1000,
          stock: 1,
          categoria: 'gadgets',
        },
      ]),
    );

    const [product] = await getProductsFromApi();

    expect(product.description).toBe('');
    expect(product.imageUrl).toBe('');
  });

  it('throws ApiError when the page payload has no products array', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope({ bogus: true }));

    const error = await getProductsFromApi().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
  });

  it('throws ApiError when any DTO is malformed', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      page([backendDto(), backendDto({ _id: 'bad', precio: 'free' })]),
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

describe('productService.getProductById', () => {
  it('maps the flat product payload to Product', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope(backendDto()));

    const product = await getProductById('mongo-id-1');

    expect(mockedApiFetch).toHaveBeenCalledWith('/products/mongo-id-1', {
      signal: undefined,
    });
    expect(product).toEqual({
      id: 'mongo-id-1',
      name: 'Auriculares NovaSound X1',
      description: 'Auriculares inalambricos over-ear',
      price: 45999.9,
      stock: 24,
      category: 'accesorios',
      imageUrl: 'https://example.com/x1.png',
    });
  });

  it('throws ApiError when data is not a product', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope(null));

    const error = await getProductById('missing').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
  });

  it('propagates the 404 ApiError', async () => {
    mockedApiFetch.mockRejectedValueOnce(
      new ApiError('Producto no encontrado', 404),
    );

    const error = await getProductById('missing').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
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
