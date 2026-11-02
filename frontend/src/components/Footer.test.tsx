import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import Footer from './Footer.tsx';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('renders the desktop footer columns and their Figma labels', () => {
    renderFooter();

    const navigation = screen.getByRole('navigation', {
      name: 'Secciones del pie de página',
    });

    expect(
      within(navigation).getByRole('heading', { name: 'Categorías' }),
    ).toBeInTheDocument();
    expect(within(navigation).getByText('Periféricos')).toBeInTheDocument();
    expect(within(navigation).getByText('Accesorios')).toBeInTheDocument();
    expect(within(navigation).getByText('Gadgets')).toBeInTheDocument();
    expect(
      within(navigation).getByRole('heading', { name: 'Ayuda' }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByText('Preguntas frecuentes'),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole('heading', { name: 'Mi cuenta' }),
    ).toBeInTheDocument();
    expect(within(navigation).getByText('Mis pedidos')).toBeInTheDocument();
  });

  it('routes category and account links while leaving help and unimplemented orders as text', () => {
    renderFooter();
    const navigation = screen.getByRole('navigation', {
      name: 'Secciones del pie de página',
    });

    expect(
      within(navigation).getByRole('link', { name: 'Periféricos' }),
    ).toHaveAttribute('href', '/productos?categoria=perifericos');
    expect(
      within(navigation).getByRole('link', { name: 'Accesorios' }),
    ).toHaveAttribute('href', '/productos?categoria=accesorios');
    expect(
      within(navigation).getByRole('link', { name: 'Gadgets' }),
    ).toHaveAttribute('href', '/productos?categoria=gadgets');
    expect(
      within(navigation).getByRole('link', { name: 'Ingresar' }),
    ).toHaveAttribute('href', '/login');
    expect(
      within(navigation).getByRole('link', { name: 'Crear cuenta' }),
    ).toHaveAttribute('href', '/registro');
    expect(
      within(navigation).queryByRole('link', { name: 'Cómo comprar' }),
    ).not.toBeInTheDocument();
    expect(
      within(navigation).queryByRole('link', { name: 'Mis pedidos' }),
    ).not.toBeInTheDocument();
  });

  it('uses the Figma mint color and 32px frame for the social icons', () => {
    renderFooter();
    const navigation = screen.getByRole('navigation', {
      name: 'Secciones del pie de página',
    });
    const socials = within(navigation).getByRole('group', {
      name: 'Redes sociales',
    });

    expect(socials).toHaveClass('text-fondo-exito');
    expect(within(socials).getByLabelText('Instagram')).toHaveAttribute(
      'width',
      '32',
    );
    expect(within(socials).getByLabelText('WhatsApp')).toHaveAttribute(
      'height',
      '32',
    );
  });

  it('keeps the checkout-demo disclosure available', () => {
    renderFooter();

    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'Sitio de demostración: el checkout es simulado, no se realizan cobros.',
    );
  });
});
