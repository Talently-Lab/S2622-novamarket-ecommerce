import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLayout from './AdminLayout.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

vi.mock('../../context/AuthContext.tsx', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../context/AuthContext.tsx')>();
  return { ...actual, useAuth: vi.fn() };
});

const mockedUseAuth = vi.mocked(useAuth);
const logout = vi.fn();

function stubMatchMedia(isDesktop: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    // Only the desktop query is expected here; reduced motion never matches.
    matches: query.includes('prefers-reduced-motion') ? false : isDesktop,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function renderAdmin(initialPath = '/admin/productos') {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="productos" element={<p>Sección productos</p>} />
          <Route path="pedidos" element={<p>Sección pedidos</p>} />
        </Route>
        <Route path="/" element={<p>Tienda</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseAuth.mockReturnValue({
    user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
    token: 'fake-token',
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout,
  });
  // jsdom has no matchMedia: default every test to the mobile layout.
  stubMatchMedia(false);
});

describe('AdminLayout', () => {
  it('renders a single navigation landmark (never sidebar and tabs together)', () => {
    stubMatchMedia(false);
    renderAdmin();

    expect(
      screen.getAllByRole('navigation', { name: /secciones de administración/i }),
    ).toHaveLength(1);
  });

  it('on mobile shows the brand, the tabs and Salir, and hides Ver tienda', () => {
    stubMatchMedia(false);
    renderAdmin();

    expect(screen.getByText('NovaMarket')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Productos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver tienda' })).toBeNull();
  });

  it('marks the current section link as the active page', () => {
    stubMatchMedia(false);
    renderAdmin('/admin/pedidos');

    expect(screen.getByRole('link', { name: 'Pedidos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Productos' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navigates between sections through the tabs', () => {
    stubMatchMedia(false);
    renderAdmin();

    fireEvent.click(screen.getByRole('link', { name: 'Pedidos' }));

    expect(screen.getByText('Sección pedidos')).toBeInTheDocument();
  });

  it('on desktop shows the sidebar with Ver tienda and Salir instead of tabs', () => {
    stubMatchMedia(true);
    renderAdmin();

    expect(screen.getByRole('link', { name: 'Ver tienda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Productos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument();
  });

  it('logs out and returns to the storefront when Salir is pressed', () => {
    stubMatchMedia(false);
    renderAdmin();

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Tienda')).toBeInTheDocument();
  });
});
