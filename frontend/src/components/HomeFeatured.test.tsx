import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProductsFromApi } from '../services/productService.ts';
import type { Product } from '../types/product.ts';
import HomeFeatured from './HomeFeatured.tsx';

vi.mock('../services/productService.ts', () => ({
  getProductsFromApi: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProductsFromApi);

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Auriculares Bluetooth NovaSound X1',
    description: 'Auriculares inalámbricos',
    price: 45999,
    stock: 24,
    category: 'accesorios',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  },
  {
    id: 2,
    name: 'Mouse Gamer NovaTech RGB 7200DPI',
    description: 'Mouse óptico para gaming',
    price: 18500,
    stock: 40,
    category: 'perifericos',
    imageUrl: 'https://images.unsplash.com/photo-1613141412501-9012977f1969',
  },
  {
    id: 3,
    name: 'Teclado Mecánico NovaKey TKL',
    description: 'Teclado mecánico reducido',
    price: 52300,
    stock: 18,
    category: 'perifericos',
    imageUrl: 'https://images.unsplash.com/photo-1585314614250-d213876625e1',
  },
  {
    id: 6,
    name: 'Smartwatch NovaFit Pulse',
    description: 'Reloj inteligente',
    price: 68900,
    stock: 15,
    category: 'gadgets',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
  },
];

function renderFeatured() {
  return render(
    <MemoryRouter>
      <HomeFeatured />
    </MemoryRouter>,
  );
}

describe('HomeFeatured', () => {
  beforeEach(() => {
    mockedGetProducts.mockResolvedValue(MOCK_PRODUCTS);
  });

  it('renders the Destacados header with a Ver todo link', async () => {
    renderFeatured();

    expect(
      await screen.findByRole('heading', { name: 'Destacados' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver todo/i })).toHaveAttribute(
      'href',
      '/productos',
    );
  });

  it('shows card skeletons while the catalog is loading', () => {
    mockedGetProducts.mockReturnValueOnce(new Promise<Product[]>(() => {}));

    renderFeatured();

    expect(
      screen.getByRole('heading', { name: 'Destacados' }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('product-card-skeleton')).toHaveLength(4);
  });

  it('renders the featured products with Novedad badge, name, es-AR price, image and Agregar button', async () => {
    renderFeatured();

    expect(await screen.findAllByRole('listitem')).toHaveLength(4);
    expect(screen.getAllByText('Novedad')).toHaveLength(4);

    for (const product of MOCK_PRODUCTS) {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      const image = screen.getByRole('img', { name: product.name });
      expect(image).toHaveAttribute('src', product.imageUrl);
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('decoding', 'async');
    }

    expect(screen.getByText('$45.999')).toBeInTheDocument();
    expect(screen.getByText('$18.500')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', {
      name: /agregar .* al carrito/i,
    });
    expect(buttons).toHaveLength(4);
    for (const button of buttons) {
      expect(button).toHaveTextContent('Agregar');
    }
  });

  it('shows the accessible fallback when an image fails to load', async () => {
    renderFeatured();

    const image = await screen.findByRole('img', {
      name: MOCK_PRODUCTS[0].name,
    });
    fireEvent.error(image);

    expect(
      screen.getByRole('img', { name: MOCK_PRODUCTS[0].name }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: MOCK_PRODUCTS[1].name }),
    ).toBeInTheDocument();
  });

  it('links each featured card image and title to its product detail page', async () => {
    renderFeatured();

    await screen.findAllByRole('listitem');
    for (const product of MOCK_PRODUCTS) {
      const link = screen.getByRole('link', { name: product.name });
      expect(link).toHaveAttribute('href', `/productos/${product.id}`);
      expect(
        within(link).getByRole('img', { name: product.name }),
      ).toBeInTheDocument();
    }
  });

  it('keeps the add buttons at the 44px touch target', async () => {
    renderFeatured();

    const section = await screen.findByRole('region', { name: 'Destacados' });
    for (const button of within(section).getAllByRole('button')) {
      expect(button.className).toContain('h-11');
    }
  });

  it('hides the section when the catalog fails to load', async () => {
    mockedGetProducts.mockRejectedValueOnce(new Error('network error'));
    renderFeatured();

    await waitFor(() => expect(mockedGetProducts).toHaveBeenCalled());
    expect(
      screen.queryByRole('heading', { name: 'Destacados' }),
    ).not.toBeInTheDocument();
  });
});
