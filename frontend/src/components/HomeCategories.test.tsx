import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import HomeCategories from './HomeCategories.tsx';

function renderCategories() {
  return render(
    <MemoryRouter>
      <HomeCategories />
    </MemoryRouter>,
  );
}

describe('HomeCategories', () => {
  it('renders the Categorías heading and four tiles', () => {
    renderCategories();

    expect(
      screen.getByRole('heading', { name: 'Categorías' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('links each tile to its canonical category slug', () => {
    renderCategories();

    const section = screen.getByRole('region', { name: 'Categorías' });
    expect(
      within(section).getByRole('link', { name: /periféricos/i }),
    ).toHaveAttribute('href', '/productos?categoria=perifericos');
    expect(
      within(section).getByRole('link', { name: /accesorios/i }),
    ).toHaveAttribute('href', '/productos?categoria=accesorios');
    expect(
      within(section).getByRole('link', { name: /gadgets/i }),
    ).toHaveAttribute('href', '/productos?categoria=gadgets');
    expect(
      within(section).getByRole('link', { name: /ver todo/i }),
    ).toHaveAttribute('href', '/productos');
  });
});
