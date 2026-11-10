import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext.tsx';
import { CartProvider } from '../context/CartContext.tsx';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetCategories.mockResolvedValue(MOCK_CATEGORIES);
  mockedGetProducts.mockResolvedValue(MOCK_PRODUCTS);
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
});
