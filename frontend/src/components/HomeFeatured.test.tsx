import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import HomeFeatured from './HomeFeatured.tsx';

function renderFeatured() {
  return render(
    <MemoryRouter>
      <HomeFeatured />
    </MemoryRouter>,
  );
}

describe('HomeFeatured', () => {
  it('renders the Destacados header with a Ver todo link', () => {
    renderFeatured();

    expect(
      screen.getByRole('heading', { name: 'Destacados' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver todo/i })).toHaveAttribute(
      'href',
      '/productos',
    );
  });

  it('renders four cards with Novedad badge, name, es-AR price and Agregar button', () => {
    renderFeatured();

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getAllByText('Novedad')).toHaveLength(4);
    expect(screen.getAllByText('$32.000')).toHaveLength(4);
    expect(
      screen.getByText('Auriculares inalámbricos NovaSound'),
    ).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: /agregar .* al carrito/i });
    expect(buttons).toHaveLength(4);
    for (const button of buttons) {
      expect(button).toHaveTextContent('Agregar');
    }
  });

  it('keeps the add buttons at the 44px touch target', () => {
    renderFeatured();

    const section = screen.getByRole('region', { name: 'Destacados' });
    for (const button of within(section).getAllByRole('button')) {
      expect(button.className).toContain('h-11');
    }
  });
});
