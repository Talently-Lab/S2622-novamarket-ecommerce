import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api.ts';
import { getProductsFromApi } from '../services/productService.ts';
import { useProducts } from './useProducts.ts';
import type { Product } from '../types/product.ts';

vi.mock('../services/productService.ts', () => ({
  getProductsFromApi: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProductsFromApi);

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

type SetParams = (next: Record<string, string>) => void;

function Probe({ onParams }: { onParams: (setParams: SetParams) => void }) {
  const [, setSearchParams] = useSearchParams();
  onParams(setSearchParams as unknown as SetParams);
  return null;
}

function LocationProbe({ onSearch }: { onSearch: (search: string) => void }) {
  const [searchParams] = useSearchParams();
  onSearch(searchParams.toString());
  return null;
}

function wrapper(initialEntry: string, onParams?: (setParams: SetParams) => void) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        {onParams ? <Probe onParams={onParams} /> : null}
        {children}
      </MemoryRouter>
    );
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

    const { result } = renderHook(() => useProducts(), {
      wrapper: wrapper('/productos'),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(2);
    expect(result.current.categories).toEqual(['accesorios', 'gadgets']);
    expect(result.current.category).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('reads the categoria URL param as the filter', async () => {
    mockedGetProducts.mockImplementation(async (category?: string) =>
      category ? [product({ category })] : [product()],
    );

    const { result } = renderHook(() => useProducts(), {
      wrapper: wrapper('/productos?categoria=gadgets'),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.category).toBe('gadgets');
    expect(mockedGetProducts).toHaveBeenCalledWith(
      'gadgets',
      expect.any(AbortSignal),
    );
  });

  it('treats an unknown categoria slug as no filter', async () => {
    mockedGetProducts.mockResolvedValue([]);

    const { result } = renderHook(() => useProducts(), {
      wrapper: wrapper('/productos?categoria=bogus'),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.category).toBe('');
    expect(mockedGetProducts).toHaveBeenCalledWith(
      undefined,
      expect.any(AbortSignal),
    );
  });

  it('strips a bogus categoria param once the catalog is known', async () => {
    mockedGetProducts.mockResolvedValue([product()]);

    let lastSearch = 'untouched';
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <MemoryRouter initialEntries={['/productos?categoria=mecanica']}>
          <LocationProbe onSearch={(search) => (lastSearch = search)} />
          {children}
        </MemoryRouter>
      );
    }

    const { result } = renderHook(() => useProducts(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Full catalog shown, and the lying param is gone (replaced, not pushed).
    expect(result.current.products).toHaveLength(1);
    expect(result.current.category).toBe('');
    await waitFor(() => expect(lastSearch).toBe(''));
  });

  it('re-requests the service when the categoria param changes', async () => {
    mockedGetProducts.mockResolvedValue([]);
    let setParams!: SetParams;
    const { result } = renderHook(() => useProducts(), {
      wrapper: wrapper('/productos', (set) => {
        setParams = set;
      }),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      setParams({ categoria: 'gadgets' });
    });

    await waitFor(() =>
      expect(mockedGetProducts).toHaveBeenCalledWith(
        'gadgets',
        expect.any(AbortSignal),
      ),
    );
    expect(result.current.category).toBe('gadgets');
  });

  it('exposes the error and recovers through retry', async () => {
    mockedGetProducts.mockRejectedValueOnce(
      new ApiError('No se pudieron cargar los productos', 500),
    );
    const { result } = renderHook(() => useProducts(), {
      wrapper: wrapper('/productos'),
    });

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
    mockedGetProducts.mockResolvedValue([product({ id: 'second' })]);

    let setParams!: SetParams;
    const { result } = renderHook(() => useProducts(), {
      wrapper: wrapper('/productos', (set) => {
        setParams = set;
      }),
    });
    act(() => {
      setParams({ categoria: 'gadgets' });
    });

    await waitFor(() =>
      expect(mockedGetProducts).toHaveBeenCalledWith(
        'gadgets',
        expect.any(AbortSignal),
      ),
    );
    act(() => {
      resolveFirst([product({ id: 'stale' })]);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products.map((item) => item.id)).toEqual(['second']);
  });
});
