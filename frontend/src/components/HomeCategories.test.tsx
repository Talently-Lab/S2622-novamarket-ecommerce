import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomeCategories from './HomeCategories.tsx';
import { getProductCategories } from '../services/formdataService.ts';

vi.mock('../services/formdataService.ts', () => ({
  getProductCategories: vi.fn(),
}));

const mockedCategories = vi.mocked(getProductCategories);

function renderCategories() {
  return render(
    <MemoryRouter>
      <HomeCategories />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCategories.mockResolvedValue([
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'perifericos', label: 'Perifericos' },
    { value: 'gadgets', label: 'Gadgets' },
  ]);
});

describe('HomeCategories', () => {
  it('renders an accessible category section without a separate title', async () => {
    renderCategories();

    expect(screen.queryByRole('heading', { name: 'Categorías' })).toBeNull();
    expect(
      screen.getByRole('region', { name: 'Categorías' }),
    ).toBeInTheDocument();
    // Three backend options + "Ver todo". findAllByRole would resolve with the
    // single "Ver todo" tile, so wait for the full set instead.
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')).toHaveLength(4),
    );
  });

  it('uses a four-column desktop grid that can fill the home content column', async () => {
    renderCategories();

    const section = screen.getByRole('region', { name: 'Categorías' });
    const list = await within(section).findByRole('list');

    expect(list.className).toContain('xl:grid-cols-4');
    expect(list.className).toContain('md:gap-6');
  });

  it('links each tile to the slug the backend exposes', async () => {
    renderCategories();

    const section = screen.getByRole('region', { name: 'Categorías' });
    expect(
      await within(section).findByRole('link', { name: /perifericos/i }),
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
