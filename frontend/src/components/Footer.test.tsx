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

  it('omits the checkout-demo disclosure', () => {
    renderFooter();

    expect(screen.getByRole('contentinfo')).not.toHaveTextContent(
      'Sitio de demostración: el checkout es simulado, no se realizan cobros.',
    );
  });

  it('uses the desktop wordmark style in the mobile footer', () => {
    renderFooter();

    const wordmarks = screen.getAllByRole('heading', { name: 'NovaMarket' });
    expect(wordmarks).toHaveLength(2);
    expect(wordmarks[0].className).toBe(wordmarks[1].className);
  });

  it('removes the desktop gap and top border before the final footer row', () => {
    renderFooter();

    const footer = screen.getByRole('contentinfo');
    const content = footer.firstElementChild as HTMLElement;
    const finalRow = screen.getByText('© 2026 NovaMarket').parentElement;

    expect(content).toHaveClass('md:gap-0');
    expect(content).not.toHaveClass('md:gap-6');
    expect(finalRow).not.toHaveClass('border-t');
  });
});
