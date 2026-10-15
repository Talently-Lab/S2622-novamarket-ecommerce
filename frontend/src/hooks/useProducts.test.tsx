import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api.ts';
import { getProducts } from '../services/productService.ts';
import { useProducts } from './useProducts.ts';
import type { Product } from '../types/product.ts';

vi.mock('../services/productService.ts', () => ({
  getProducts: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProducts);

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'mongo-id-1',
    name: 'Auriculares NovaSound X1',
    description: 'Auriculares inalambricos over-ear',
    price: 45999.9,
    stock: 24,
    category: 'accesorios',
    imageUrl: 'https://example.com/x1.png',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useProducts', () => {
  it('loads products and derives sorted categories', async () => {
    mockedGetProducts.mockResolvedValueOnce([
      product({ id: '1', category: 'gadgets' }),
      product({ id: '2', category: 'accesorios' }),
    ]);

    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(2);
    expect(result.current.categories).toEqual(['accesorios', 'gadgets']);
    expect(result.current.error).toBeNull();
  });

  it('re-requests the service when the category changes', async () => {
    mockedGetProducts.mockResolvedValue([]);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setCategory('gadgets');
    });

    await waitFor(() =>
      expect(mockedGetProducts).toHaveBeenCalledWith(
        'gadgets',
        expect.any(AbortSignal),
      ),
    );
  });

  it('exposes the error and recovers through retry', async () => {
    mockedGetProducts.mockRejectedValueOnce(
      new ApiError('No se pudieron cargar los productos', 500),
    );
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No se pudieron cargar los productos');

    mockedGetProducts.mockResolvedValueOnce([product()]);
    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });

  it('drops stale responses so fast filter changes cannot win late', async () => {
    let resolveFirst!: (value: Product[]) => void;
    const first = new Promise<Product[]>((resolve) => {
      resolveFirst = resolve;
    });
    mockedGetProducts.mockReturnValueOnce(first);
    mockedGetProducts.mockResolvedValueOnce([product({ id: 'second' })]);

    const { result } = renderHook(() => useProducts());
    act(() => {
      result.current.setCategory('gadgets');
    });

    await waitFor(() => expect(mockedGetProducts).toHaveBeenCalledTimes(2));
    act(() => {
      resolveFirst([product({ id: 'stale' })]);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products.map((item) => item.id)).toEqual(['second']);
  });
});
