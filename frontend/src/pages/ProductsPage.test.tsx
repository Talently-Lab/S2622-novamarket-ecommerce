import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api.ts';
import { getProducts } from '../services/productService.ts';
import type { Product } from '../types/product.ts';
import { system } from '../theme/system.ts';
import ProductsPage from './ProductsPage.tsx';

vi.mock('../services/productService.ts', () => ({
  getProducts: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProducts);

function product(index: number, category = 'accesorios'): Product {
  return {
    id: `mongo-id-${index}`,
    name: `Producto ${index}`,
    description: `Descripcion ${index}`,
    price: 1000 * index,
    stock: 10,
    category,
    imageUrl: `https://example.com/${index}.png`,
  };
}

function renderPage() {
  return render(
    <ChakraProvider value={system}>
      <ProductsPage />
    </ChakraProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductsPage', () => {
  it('shows loading skeletons while the catalog is fetched', () => {
    mockedGetProducts.mockReturnValueOnce(new Promise(() => {}));

    renderPage();

    expect(
      screen.getByRole('heading', { name: /todos los productos/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('product-card-skeleton')).not.toHaveLength(0);
  });

  it('renders the populated list with the real count and load-more paging', async () => {
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, index) => product(index + 1)),
    );

    renderPage();

    expect(
      await screen.findByText('Producto 1', undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('10 productos')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(8);

    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);
    expect(
      screen.queryByRole('button', { name: /cargar más/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the empty state when the API returns no products', async () => {
    mockedGetProducts.mockResolvedValueOnce([]);

    renderPage();

    expect(
      await screen.findByText('No hay productos disponibles'),
    ).toBeInTheDocument();
    expect(screen.getByText('0 productos')).toBeInTheDocument();
  });

  it('shows the error state and retries on demand', async () => {
    mockedGetProducts.mockRejectedValueOnce(
      new ApiError('No se pudieron cargar los productos', 500),
    );

    renderPage();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reintentar/i }),
    ).toBeInTheDocument();

    mockedGetProducts.mockResolvedValueOnce([product(1)]);
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
  });

  it('filters by category and resets load-more on filter change', async () => {
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, index) =>
        product(index + 1, index % 2 === 0 ? 'accesorios' : 'gadgets'),
      ),
    );

    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);

    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, index) =>
        product(index + 1, 'gadgets'),
      ),
    );
    fireEvent.change(screen.getByLabelText(/categorías/i), {
      target: { value: 'gadgets' },
    });

    await waitFor(() =>
      expect(mockedGetProducts).toHaveBeenLastCalledWith(
        'gadgets',
        expect.any(AbortSignal),
      ),
    );
    await screen.findByText('10 productos');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(8);
  });

  it('renders the no-match state when the filter returns nothing', async () => {
    mockedGetProducts.mockResolvedValueOnce([
      product(1),
      product(2, 'gadgets'),
    ]);
    renderPage();
    await screen.findByText('Producto 1');

    mockedGetProducts.mockResolvedValueOnce([]);
    fireEvent.change(screen.getByLabelText(/categorías/i), {
      target: { value: 'gadgets' },
    });

    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
  });
});
