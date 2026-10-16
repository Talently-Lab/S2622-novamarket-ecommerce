import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api.ts';
import { getProducts } from '../services/productService.ts';
import type { Product } from '../types/product.ts';
import { system } from '../theme/system.ts';
import ProductsPage from './ProductsPage.tsx';

vi.mock('../services/productService.ts', () => ({
  getProducts: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProducts);

function product(index: number, category = 'accesorios'): Product {
  return {
    id: `mongo-id-${index}`,
    name: `Producto ${index}`,
    description: `Descripcion ${index}`,
    price: 1000 * index,
    stock: 10,
    category,
    imageUrl: `https://images.unsplash.com/photo-123?auto=format&fit=crop&w=600&q=80&index=${index}`,
  };
}

function renderPage() {
  return render(
    <ChakraProvider value={system}>
      <ProductsPage />
    </ChakraProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductsPage', () => {
  it('shows loading skeletons while the catalog is fetched', () => {
    mockedGetProducts.mockReturnValueOnce(new Promise(() => {}));

    renderPage();

    expect(
      screen.getByRole('heading', { name: /todos los productos/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('product-card-skeleton')).not.toHaveLength(0);
  });

  it('renders the breadcrumb with Inicio link and current page mirroring the title', async () => {
    mockedGetProducts.mockResolvedValueOnce([product(1)]);

    renderPage();
    await screen.findByText('Producto 1');

    expect(
      screen.getByRole('navigation', { name: /miga de pan/i }),
    ).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: 'Inicio' });
    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink.className).toContain('text-caption');
    expect(homeLink.className).toContain('text-texto-secundario');
    expect(homeLink.className).toContain('underline');

    const heading = screen.getByRole('heading', {
      name: /todos los productos/i,
    });
    expect(heading.tagName).toBe('H1');
    expect(heading.className).toContain('text-titulo-2');
    expect(heading.className).not.toContain('tracking-tight');

    const current = screen.getByText((_, element) => {
      return (
        element?.tagName === 'SPAN' &&
        element.getAttribute('aria-current') === 'page'
      );
    });
    expect(current).toHaveTextContent(heading.textContent ?? '');
  });

  it('styles the count as Body 16/24 in texto-principal with live region', async () => {
    mockedGetProducts.mockResolvedValueOnce([product(1)]);

    renderPage();
    await screen.findByText('Producto 1');

    const count = screen.getByText('1 producto');
    expect(count.className).toContain('text-cuerpo');
    expect(count.className).toContain('text-texto-principal');
    expect(count).toHaveAttribute('aria-live', 'polite');
  });

  it('renders the populated list with the real count and load-more paging', async () => {
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, index) => product(index + 1)),
    );

    renderPage();

    expect(
      await screen.findByText('Producto 1', undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('10 productos')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(8);

    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);
    expect(
      screen.queryByRole('button', { name: /cargar más/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the empty state when the API returns no products', async () => {
    mockedGetProducts.mockResolvedValueOnce([]);

    renderPage();

    expect(
      await screen.findByText('No hay productos disponibles'),
    ).toBeInTheDocument();
    expect(screen.getByText('0 productos')).toBeInTheDocument();
  });

  it('shows the error state and retries on demand', async () => {
    mockedGetProducts.mockRejectedValueOnce(
      new ApiError('No se pudieron cargar los productos', 500),
    );

    renderPage();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reintentar/i }),
    ).toBeInTheDocument();

    mockedGetProducts.mockResolvedValueOnce([product(1)]);
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
  });

  it('opens the category sheet with ordered radios and Todos checked by default', async () => {
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, index) =>
        product(index + 1, index % 2 === 0 ? 'accesorios' : 'gadgets'),
      ),
    );

    renderPage();
    await screen.findByText('Producto 1');

    const trigger = screen.getByRole('button', { name: 'Categorías' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Categorías' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const radios = within(dialog).getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual([
      '',
      'accesorios',
      'gadgets',
    ]);
    expect(
      within(dialog).getByRole('radio', { name: 'Todos' }),
    ).toBeChecked();
  });

  it('keeps the category pending until the CTA applies it and resets load-more', async () => {
    const catalog = [
      ...Array.from({ length: 5 }, (_, index) =>
        product(index + 1, 'accesorios'),
      ),
      ...Array.from({ length: 9 }, (_, index) =>
        product(index + 101, 'gadgets'),
      ),
      ...Array.from({ length: 2 }, (_, index) =>
        product(index + 201, 'perifericos'),
      ),
    ];
    mockedGetProducts.mockImplementation(async (category?: string) =>
      category
        ? catalog.filter((item) => item.category === category)
        : [...catalog],
    );

    renderPage();
    await screen.findByText('Producto 1');
    expect(screen.getByText('16 productos')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cargar más/i }));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(16);

    const trigger = screen.getByRole('button', { name: 'Categorías' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Categorías' });

    fireEvent.click(
      within(dialog).getByRole('radio', { name: 'Gadgets' }),
    );

    // Pending selection updates the CTA count without fetching or rendering.
    expect(
      within(dialog).getByRole('button', { name: 'Ver 9 productos' }),
    ).toBeInTheDocument();
    expect(mockedGetProducts).not.toHaveBeenCalledWith(
      'gadgets',
      expect.anything(),
    );
    expect(
      screen.getAllByRole('heading', { level: 2, name: /producto \d+/i }),
    ).toHaveLength(16);

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Ver 9 productos' }),
    );

    await waitFor(() =>
      expect(mockedGetProducts).toHaveBeenLastCalledWith(
        'gadgets',
        expect.any(AbortSignal),
      ),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('9 productos')).toBeInTheDocument();
    // Paging resets to the first page instead of keeping the expanded list.
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(8);
    expect(
      screen.getByRole('button', { name: /cargar más/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Gadgets' }),
    ).toBeInTheDocument();
  });

  it('discards the pending category on X, scrim, and Escape', async () => {
    const catalog = [
      product(1, 'accesorios'),
      product(2, 'gadgets'),
      product(3, 'perifericos'),
    ];
    mockedGetProducts.mockImplementation(async (category?: string) =>
      category
        ? catalog.filter((item) => item.category === category)
        : [...catalog],
    );

    renderPage();
    await screen.findByText('Producto 1');
    const callsBefore = mockedGetProducts.mock.calls.length;

    async function openAndPickGadgets() {
      fireEvent.click(screen.getByRole('button', { name: 'Categorías' }));
      const dialog = screen.getByRole('dialog', { name: 'Categorías' });
      fireEvent.click(
        within(dialog).getByRole('radio', { name: 'Gadgets' }),
      );
      return dialog;
    }

    const trigger = screen.getByRole('button', { name: 'Categorías' });

    // X button discards.
    let dialog = await openAndPickGadgets();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Cerrar' }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    // Scrim click discards.
    dialog = await openAndPickGadgets();
    expect(dialog).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Cerrar filtro de categorías' }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Escape discards.
    await openAndPickGadgets();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(mockedGetProducts.mock.calls.length).toBe(callsBefore);
    expect(
      screen.getByRole('heading', { name: /todos los productos/i }),
    ).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('moves focus into the sheet on open and locks body scroll', async () => {
    mockedGetProducts.mockResolvedValueOnce([
      product(1),
      product(2, 'gadgets'),
    ]);

    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.click(screen.getByRole('button', { name: 'Categorías' }));
    const dialog = screen.getByRole('dialog', { name: 'Categorías' });

    expect(
      within(dialog).getByRole('button', { name: 'Cerrar' }),
    ).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('prioritizes the first cards and lazy-loads the rest', async () => {
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 8 }, (_, index) => product(index + 1)),
    );

    renderPage();
    await screen.findByText('Producto 1');

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(8);
    for (const [index, img] of images.entries()) {
      if (index < 4) {
        expect(img).toHaveAttribute('loading', 'eager');
        expect(img.getAttribute('fetchpriority')).toBe('high');
      } else {
        expect(img).toHaveAttribute('loading', 'lazy');
        expect(img.getAttribute('fetchpriority')).toBeNull();
      }
    }
  });

  it('renders the no-match state when the applied filter returns nothing', async () => {
    const catalog = [product(1), product(2), product(3, 'gadgets')];
    mockedGetProducts.mockImplementation(async (category?: string) => {
      if (!category) return [...catalog];
      if (category === 'gadgets') return [];
      return catalog.filter((item) => item.category === category);
    });
    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.click(screen.getByRole('button', { name: 'Categorías' }));
    const dialog = screen.getByRole('dialog', { name: 'Categorías' });
    fireEvent.click(
      within(dialog).getByRole('radio', { name: 'Gadgets' }),
    );
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Ver 1 producto' }),
    );

    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
  });
});
