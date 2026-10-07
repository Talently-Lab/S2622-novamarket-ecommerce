import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext.tsx';
import Navbar from './Navbar.tsx';

function renderNavbar(props: { count?: number } = {}) {
  render(
    <MemoryRouter initialEntries={['/']}>
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

  it('shows the Figma categories with Todos as a button', () => {
    renderNavbar();

    expect(
      screen.getByRole('button', { name: 'Todos' }),
    ).toBeInTheDocument();
    for (const category of ['Periféricos', 'Audio', 'Accesorios', 'Ofertas']) {
      expect(
        screen.getByRole('link', { name: category }),
      ).toHaveAttribute('href', '/productos');
    }
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
