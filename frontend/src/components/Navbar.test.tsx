import { fireEvent, render, screen, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext.tsx';
import { getProducts } from '../services/productService.ts';
import { system } from '../theme/system.ts';
import ProductsPage from '../pages/ProductsPage.tsx';
import Navbar from './Navbar.tsx';

vi.mock('../services/productService.ts', () => ({
  getProducts: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProducts);

function renderNavbar(props: { count?: number } = {}, initialEntry = '/') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Navbar count={props.count} />
        <Routes>
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/productos" element={<p>Catálogo</p>} />
          <Route path="/login" element={<p>Iniciar sesión</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Navbar', () => {
  it('shows the NovaMarket brand on mobile and desktop bars', () => {
    renderNavbar();

    const brandLinks = screen.getAllByRole('link', { name: 'NovaMarket' });
    expect(brandLinks).toHaveLength(2);
    for (const link of brandLinks) {
      expect(link).toHaveAttribute('href', '/');
    }
  });

  it('renders real search inputs with the Figma placeholder', () => {
    renderNavbar();

    expect(screen.getAllByPlaceholderText('Buscar productos')).toHaveLength(2);
    expect(screen.getAllByLabelText('Buscar productos')[0].tagName).toBe(
      'INPUT',
    );
  });

  it('navigates to /productos when the search is submitted', async () => {
    renderNavbar();

    fireEvent.submit(screen.getAllByRole('search')[0]);

    expect(await screen.findByText('Catálogo')).toBeInTheDocument();
  });

  it('shows Ingresar for visitors and navigates to /login', async () => {
    renderNavbar();

    const loginLink = await screen.findByRole('link', { name: /ingresar/i });
    expect(loginLink).toHaveAttribute('href', '/login');

    fireEvent.click(loginLink);
    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('shows the real categories with Todos as a link', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Todos' })).toHaveAttribute(
      'href',
      '/productos',
    );
    expect(screen.getByRole('link', { name: 'Periféricos' })).toHaveAttribute(
      'href',
      '/productos?categoria=perifericos',
    );
    expect(screen.getByRole('link', { name: 'Accesorios' })).toHaveAttribute(
      'href',
      '/productos?categoria=accesorios',
    );
    expect(screen.getByRole('link', { name: 'Gadgets' })).toHaveAttribute(
      'href',
      '/productos?categoria=gadgets',
    );
    for (const stale of ['Audio', 'Ofertas', 'Gadges']) {
      expect(screen.queryByRole('link', { name: stale })).toBeNull();
    }
  });

  it('marks the selected category with the orange underline', () => {
    renderNavbar({}, '/productos?categoria=gadgets');

    const bar = screen.getByRole('navigation', { name: 'Categorías' });
    const selected = within(bar).getByRole('link', { name: 'Gadgets' });
    expect(selected.className).toContain('underline');
    expect(selected.className).toContain('decoration-accion-acento');

    for (const name of ['Todos', 'Periféricos', 'Accesorios']) {
      const link = within(bar).getByRole('link', { name });
      expect(link.className).not.toContain('decoration-accion-acento');
    }
  });

  it('marks Todos when no categoria param is present', () => {
    renderNavbar({}, '/productos');

    const bar = screen.getByRole('navigation', { name: 'Categorías' });
    const todos = within(bar).getByRole('link', { name: 'Todos' });
    expect(todos.className).toContain('underline');
    expect(todos.className).toContain('decoration-accion-acento');
  });

  it('navigates with params and filters the catalog', async () => {
    mockedGetProducts.mockImplementation(async (category?: string) => {
      if (category === 'accesorios') {
        return [
          {
            id: 'mongo-id-1',
            name: 'Producto 1',
            description: 'Descripcion 1',
            price: 1000,
            stock: 10,
            category: 'accesorios',
            imageUrl:
              'https://images.unsplash.com/photo-123?auto=format&fit=crop&w=600&q=80',
          },
        ];
      }
      return [];
    });

    render(
      <MemoryRouter initialEntries={['/productos']}>
        <AuthProvider>
          <ChakraProvider value={system}>
            <Navbar />
            <Routes>
              <Route path="/productos" element={<ProductsPage />} />
            </Routes>
          </ChakraProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const bar = screen.getByRole('navigation', { name: 'Categorías' });
    fireEvent.click(within(bar).getByRole('link', { name: 'Accesorios' }));

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Accesorios' }),
    ).toBeInTheDocument();
    expect(mockedGetProducts).toHaveBeenCalledWith(
      'accesorios',
      expect.any(AbortSignal),
    );
  });

  it('shows the default cart badge count from Figma', () => {
    renderNavbar();

    expect(
      screen.getAllByLabelText('2 productos en el carrito'),
    ).toHaveLength(2);
  });

  it('accepts a dynamic cart count', () => {
    renderNavbar({ count: 5 });

    expect(
      screen.getAllByLabelText('5 productos en el carrito'),
    ).toHaveLength(2);
  });

  it('toggles the mobile menu drawer', async () => {
    renderNavbar();

    const menuButton = screen.getByRole('button', { name: /menú/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(
      await screen.findByRole('navigation', { name: 'Menú principal' }),
    ).toBeInTheDocument();
  });
});
