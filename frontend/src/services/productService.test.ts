import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api.ts';
import { getProductById, getProductsFromApi } from './productService.ts';

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
function page(products: unknown[], totalProducts = products.length) {
  return envelope({ products, totalProducts });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('productService.getProductsFromApi', () => {
  it('unwraps data.products and maps the backend DTO to Product', async () => {
    mockedApiFetch.mockResolvedValueOnce(page([backendDto()]));

    const products = await getProductsFromApi();

    expect(mockedApiFetch).toHaveBeenCalledWith('/products?limit=100&page=1', {
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

  it('sends category as a query param and leaves filtering to the server', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      page([
        backendDto({ _id: 'a', categoria: 'accesorios' }),
        backendDto({ _id: 'b', categoria: 'gadgets' }),
      ]),
    );

    const products = await getProductsFromApi('accesorios');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/products?limit=100&page=1&category=accesorios',
      { signal: undefined },
    );
    // The server is responsible for filtering now, so rows of other
    // categories are no longer dropped client-side.
    expect(products.map((product) => product.id)).toEqual(['a', 'b']);
  });

  it('collects every page until the reported total is reached', async () => {
    mockedApiFetch
      .mockResolvedValueOnce(
        page(
          [backendDto({ _id: 'a' }), backendDto({ _id: 'b' })],
          3,
        ),
      )
      .mockResolvedValueOnce(page([backendDto({ _id: 'c' })]));

    const products = await getProductsFromApi();

    expect(mockedApiFetch).toHaveBeenNthCalledWith(
      1,
      '/products?limit=100&page=1',
      { signal: undefined },
    );
    expect(mockedApiFetch).toHaveBeenNthCalledWith(
      2,
      '/products?limit=100&page=2',
      { signal: undefined },
    );
    expect(mockedApiFetch).toHaveBeenCalledTimes(2);
    expect(products.map((product) => product.id)).toEqual(['a', 'b', 'c']);
  });

  it('stops when a page comes back empty even if totalProducts is larger', async () => {
    mockedApiFetch
      .mockResolvedValueOnce(page([backendDto({ _id: 'a' })], 999))
      .mockResolvedValueOnce(page([], 999));

    const products = await getProductsFromApi();

    expect(mockedApiFetch).toHaveBeenCalledTimes(2);
    expect(products.map((product) => product.id)).toEqual(['a']);
  });

  it('uses the first page alone when totalProducts is not a finite number', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      envelope({
        products: [backendDto({ _id: 'a' })],
        totalProducts: 'many',
      }),
    );

    const products = await getProductsFromApi();

    expect(mockedApiFetch).toHaveBeenCalledTimes(1);
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
