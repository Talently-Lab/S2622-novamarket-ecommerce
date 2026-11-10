import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext.tsx';
import { CartProvider } from '../context/CartContext.tsx';
import { TOKEN_STORAGE_KEY } from '../services/api.ts';
import { getProductCategories } from '../services/formdataService.ts';
import { getProductsFromApi } from '../services/productService.ts';
import { system } from '../theme/system.ts';
import ProductsPage from '../pages/ProductsPage.tsx';
import Navbar from './Navbar.tsx';

vi.mock('../services/productService.ts', () => ({
  getProductsFromApi: vi.fn(),
}));

vi.mock('../services/formdataService.ts', () => ({
  getProductCategories: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProductsFromApi);
const mockedCategories = vi.mocked(getProductCategories);

function LocationProbe() {
  const location = useLocation();
  return (
    <p data-testid="location">{`${location.pathname}${location.search}`}</p>
  );
}

function renderNavbar(initialEntry = '/') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <CartProvider>
          <Navbar />
        </CartProvider>
        <Routes>
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/productos" element={<p>Catálogo</p>} />
          <Route path="/login" element={<p>Iniciar sesión</p>} />
        </Routes>
        <LocationProbe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  mockedCategories.mockResolvedValue([
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'perifericos', label: 'Perifericos' },
    { value: 'gadgets', label: 'Gadgets' },
  ]);
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

  it('sends the trimmed search term to the catalog URL', async () => {
    renderNavbar();

    fireEvent.change(screen.getAllByRole('searchbox')[0], {
      target: { value: '  teclado  ' },
    });
    fireEvent.submit(screen.getAllByRole('search')[0]);

    expect(await screen.findByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/productos?buscar=teclado',
    );
  });

  it('clears the search param when the term is emptied', async () => {
    renderNavbar('/productos?buscar=teclado');

    expect(screen.getAllByRole('searchbox')[0]).toHaveValue('teclado');

    fireEvent.change(screen.getAllByRole('searchbox')[0], {
      target: { value: '   ' },
    });
    fireEvent.submit(screen.getAllByRole('search')[0]);

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/productos$/);
  });

  it('shows Ingresar for visitors and navigates to /login', async () => {
    renderNavbar();

    const loginLink = await screen.findByRole('link', { name: /ingresar/i });
    expect(loginLink).toHaveAttribute('href', '/login');

    fireEvent.click(loginLink);
    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('shows the real categories with Todos as a link', async () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Todos' })).toHaveAttribute(
      'href',
      '/productos',
    );
    // Category links arrive with the backend options.
    expect(
      await screen.findByRole('link', { name: 'Perifericos' }),
    ).toHaveAttribute('href', '/productos?categoria=perifericos');
    expect(
      await screen.findByRole('link', { name: 'Accesorios' }),
    ).toHaveAttribute('href', '/productos?categoria=accesorios');
    expect(
      await screen.findByRole('link', { name: 'Gadgets' }),
    ).toHaveAttribute('href', '/productos?categoria=gadgets');
    for (const stale of ['Audio', 'Ofertas', 'Gadges']) {
      expect(screen.queryByRole('link', { name: stale })).toBeNull();
    }
  });

  it('marks the selected category with the orange underline', async () => {
    renderNavbar('/?categoria=gadgets');

    const bar = screen.getByRole('navigation', { name: 'Categorías' });
    const selected = await within(bar).findByRole('link', { name: 'Gadgets' });
    expect(selected.className).toContain('underline');
    expect(selected.className).toContain('decoration-accion-acento');

    for (const name of ['Todos', 'Perifericos', 'Accesorios']) {
      const link = await within(bar).findByRole('link', { name });
      expect(link.className).not.toContain('decoration-accion-acento');
    }
  });

  it('marks Todos when no categoria param is present', () => {
    renderNavbar('/');

    const bar = screen.getByRole('navigation', { name: 'Categorías' });
    const todos = within(bar).getByRole('link', { name: 'Todos' });
    expect(todos.className).toContain('underline');
    expect(todos.className).toContain('decoration-accion-acento');
  });

  it('shows the category bar only on the home page', () => {
    renderNavbar('/productos');
    expect(
      screen.queryByRole('navigation', { name: 'Categorías' }),
    ).not.toBeInTheDocument();

    cleanup();
    renderNavbar('/carrito');
    expect(
      screen.queryByRole('navigation', { name: 'Categorías' }),
    ).not.toBeInTheDocument();

    cleanup();
    renderNavbar('/');
    expect(
      screen.getByRole('navigation', { name: 'Categorías' }),
    ).toBeInTheDocument();
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
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <ChakraProvider value={system}>
            <CartProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={null} />
                <Route path="/productos" element={<ProductsPage />} />
              </Routes>
            </CartProvider>
          </ChakraProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    const bar = screen.getByRole('navigation', { name: 'Categorías' });
    fireEvent.click(
      await within(bar).findByRole('link', { name: 'Accesorios' }),
    );

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Accesorios' }),
    ).toBeInTheDocument();
    expect(mockedGetProducts).toHaveBeenCalledWith(
      'accesorios',
      expect.any(AbortSignal),
      { minPrice: undefined, maxPrice: undefined, sort: undefined },
    );
  });

  it('hides the cart badge while the cart is empty', () => {
    renderNavbar();

    expect(screen.queryByLabelText(/en el carrito/)).not.toBeInTheDocument();
  });

  it('shows the units stored in the persisted cart', () => {
    window.localStorage.setItem(
      'novamarket.cart.v1',
      JSON.stringify([
        { productId: 'p1', name: 'Teclado', unitPrice: 1000, quantity: 3 },
      ]),
    );

    renderNavbar();

    expect(screen.getAllByLabelText('3 productos en el carrito')).toHaveLength(
      2,
    );
  });

  it('uses a logout icon for the desktop sign-out action', async () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, 'test-token');
    window.localStorage.setItem(
      'novamarket_user',
      JSON.stringify({
        id: 'user-1',
        name: 'Mara',
        email: 'mara@example.com',
        role: 'cliente',
      }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            message: 'Sesión activa',
            data: {
              _id: 'user-1',
              nombre: 'Mara',
              email: 'mara@example.com',
              rol: 'cliente',
            },
          }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    try {
      renderNavbar();
      const logout = await screen.findByRole('button', {
        name: 'Cerrar sesión',
      });

      expect(logout).toHaveClass('cursor-pointer');
      expect(within(logout).getByText('logout')).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('toggles the mobile menu drawer', async () => {
    renderNavbar();

    const menuButton = screen.getByRole('button', { name: /menú/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(
      await screen.findByRole('dialog', { name: 'Menú principal' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(
      screen.queryByRole('dialog', { name: 'Menú principal' }),
    ).not.toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders the Figma mobile menu and navigates to a selected category', async () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: /menú/i }));

    const menu = await screen.findByRole('dialog', { name: 'Menú principal' });
    expect(menu).toHaveClass('fixed', 'inset-0', 'md:hidden');
    expect(within(menu).getByText('Ingresá para ver tus pedidos')).toBeInTheDocument();
    expect(
      within(menu).getByRole('link', { name: 'Crear cuenta' }),
    ).toHaveAttribute('href', '/registro');
    expect(within(menu).getByText('Ayuda')).toBeInTheDocument();
    expect(within(menu).getByText('Contacto por WhatsApp')).toBeInTheDocument();

    const categories = within(menu).getByRole('navigation', {
      name: 'Categorías del menú',
    });
    expect(
      within(categories)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/productos',
      '/productos?categoria=perifericos',
      '/productos?categoria=accesorios',
      '/productos?categoria=gadgets',
    ]);
    expect(within(categories).getByRole('link', { name: 'Todos' })).toHaveAttribute(
      'href',
      '/productos',
    );
    expect(
      await within(categories).findByRole('link', { name: 'Accesorios' }),
    ).toHaveAttribute('href', '/productos?categoria=accesorios');

    fireEvent.click(within(categories).getByRole('link', { name: 'Accesorios' }));
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/productos?categoria=accesorios',
    );
    expect(
      screen.queryByRole('dialog', { name: 'Menú principal' }),
    ).not.toBeInTheDocument();
  });

  it('closes the mobile menu on Escape and restores focus to its trigger', async () => {
    renderNavbar();

    const menuButton = screen.getByRole('button', { name: /menú/i });
    fireEvent.click(menuButton);
    const menu = await screen.findByRole('dialog', { name: 'Menú principal' });

    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(
      screen.queryByRole('dialog', { name: 'Menú principal' }),
    ).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });
});
