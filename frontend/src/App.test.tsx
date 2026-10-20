import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

function catalogProducts() {
  return Array.from({ length: 20 }, (_, index) => ({
    _id: `mongo-id-${index + 1}`,
    nombre: `Producto ${index + 1}`,
    descripcion: `Descripcion ${index + 1}`,
    precio: 1000 * (index + 1),
    stock: 10,
    categoria: 'accesorios',
    imagenUrl: `https://example.com/product-${index + 1}.png`,
  }));
}

beforeEach(() => {
  const products = catalogProducts();
  // URL-aware stub: the app now asks two endpoints (catalog + formdata
  // categories), so a stub that ignores its argument would answer the wrong
  // shape to one of them.
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      // `/products/:id` returns the product object itself, not a page.
      const detailId = url.match(/\/products\/([^/?]+)$/)?.[1];
      const detailProduct = detailId
        ? products.find((product) => product._id === detailId)
        : undefined;
      const body = url.includes('/formdata/products')
        ? {
            ok: true,
            message: 'Categorías de productos',
            data: [
              { value: 'accesorios', label: 'Accesorios' },
              { value: 'perifericos', label: 'Perifericos' },
              { value: 'gadgets', label: 'Gadgets' },
            ],
          }
        : detailProduct
          ? {
              ok: true,
              message: 'Producto encontrado',
              data: detailProduct,
            }
          : {
              ok: true,
              message: 'Productos encontrados',
              data: { products, totalProducts: products.length },
            };
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => body,
      };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NovaMarket landing page', () => {
  it('shows the mini-deploy home with banner, categories and featured', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /potenciá tu setup/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /categorías/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /destacados/i }),
    ).toBeInTheDocument();
  });

  it('links the home tiles to the catalog sections', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    // Labels come from the backend, which does not accent "Perifericos".
    const homeTiles = await screen.findAllByRole('link', {
      name: /perifericos/i,
    });
    const homeTile = homeTiles.find((link) =>
      link.getAttribute('href')?.startsWith('/productos?categoria='),
    );
    expect(homeTile).toHaveAttribute(
      'href',
      '/productos?categoria=perifericos',
    );
  });

  it('renders the API-backed product catalog on /productos', async () => {
    render(
      <MemoryRouter initialEntries={['/productos']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /todos los productos/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('20 productos')).toBeInTheDocument();
    expect(await screen.findAllByRole('img')).toHaveLength(10);
  });

  it('renders the product detail page on /productos/:id', async () => {
    render(
      <MemoryRouter initialEntries={['/productos/mongo-id-3']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Producto 3' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Stock disponible: 10 u.')).toBeInTheDocument();
  });
});
