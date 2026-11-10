import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext.tsx';
import { CartProvider } from '../context/CartContext.tsx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProductsFromApi } from '../services/productService.ts';
import { getProductCategories } from '../services/formdataService.ts';
import type { Product } from '../types/product.ts';
import HomePage from './HomePage.tsx';

vi.mock('../services/productService.ts', () => ({
  getProductsFromApi: vi.fn(),
}));
vi.mock('../services/formdataService.ts', () => ({
  getProductCategories: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProductsFromApi);
const mockedGetCategories = vi.mocked(getProductCategories);

const MOCK_CATEGORIES = [
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'perifericos', label: 'Perifericos' },
  { value: 'gadgets', label: 'Gadgets' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Teclado Mecánico',
    description: 'Teclado mecánico de prueba',
    price: 89999,
    stock: 10,
    imageUrl: 'https://img.test/teclado.jpg',
    category: 'perifericos',
  },
];

function renderHome() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetCategories.mockResolvedValue(MOCK_CATEGORIES);
  mockedGetProducts.mockResolvedValue(MOCK_PRODUCTS);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('HomePage initial loader', () => {
  it('shows the full-screen loader while the home data is still loading', () => {
    // Both home fetches hang, as on a cold Render start.
    mockedGetCategories.mockReturnValue(new Promise(() => {}));
    mockedGetProducts.mockReturnValue(new Promise(() => {}));

    renderHome();

    expect(screen.getByTestId('initial-loader')).toBeInTheDocument();
    expect(screen.getByText('Cargando tu tienda…')).toBeInTheDocument();
  });

  it('hides the loader once both home fetches settle', async () => {
    renderHome();

    expect(screen.getByTestId('initial-loader')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByTestId('initial-loader')).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByRole('region', { name: 'Categorías' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Destacados' }),
    ).toBeInTheDocument();
  });

  it('hides the loader when a home fetch fails', async () => {
    mockedGetCategories.mockRejectedValue(new Error('network down'));

    renderHome();

    await waitFor(() =>
      expect(screen.queryByTestId('initial-loader')).not.toBeInTheDocument(),
    );
  });

  it('splits the loader open only when the load outlives the 7s threshold', async () => {
    vi.useFakeTimers();
    const categories = deferred<typeof MOCK_CATEGORIES>();
    const products = deferred<typeof MOCK_PRODUCTS>();
    mockedGetCategories.mockReturnValue(categories.promise);
    mockedGetProducts.mockReturnValue(products.promise);

    renderHome();
    expect(screen.getByTestId('initial-loader')).toBeInTheDocument();

    // Still pending past the slow-load threshold (cold Render start).
    await act(async () => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getByTestId('initial-loader')).toBeInTheDocument();
    expect(screen.getByTestId('initial-loader')).not.toHaveAttribute(
      'data-exit',
    );

    // Data settles after the threshold → the curtain exit starts.
    await act(async () => {
      categories.resolve(MOCK_CATEGORIES);
      products.resolve(MOCK_PRODUCTS);
    });
    expect(screen.getByTestId('initial-loader')).toHaveAttribute(
      'data-exit',
      'split',
    );

    // The exit animation reports back and the loader unmounts
    // (stretch 700 + fade 300 + delayed slide 1000+700, +margin = 1750).
    await act(async () => {
      vi.advanceTimersByTime(1750);
    });
    expect(screen.queryByTestId('initial-loader')).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Categorías' }),
    ).toBeInTheDocument();
  });

  it('hides the loader instantly when the load finishes within 7s', async () => {
    vi.useFakeTimers();

    renderHome();
    expect(screen.getByTestId('initial-loader')).toBeInTheDocument();

    // Settles before the threshold → immediate unmount, no split exit.
    await act(async () => {});
    expect(screen.queryByTestId('initial-loader')).not.toBeInTheDocument();

    // Crossing the threshold afterwards must never resurrect the loader.
    await act(async () => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.queryByTestId('initial-loader')).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Categorías' }),
    ).toBeInTheDocument();
  });
});
