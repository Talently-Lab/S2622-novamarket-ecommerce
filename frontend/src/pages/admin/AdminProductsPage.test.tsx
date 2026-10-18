import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminProductsPage from './AdminProductsPage.tsx';
import {
  deleteAdminProduct,
  listAdminProducts,
} from '../../services/adminProductService.ts';
import { getProductCategories } from '../../services/formdataService.ts';
import { system } from '../../theme/system.ts';
import type { Product } from '../../types/product.ts';

vi.mock('../../services/adminProductService.ts', () => ({
  listAdminProducts: vi.fn(),
  deleteAdminProduct: vi.fn(),
}));

vi.mock('../../services/formdataService.ts', () => ({
  getProductCategories: vi.fn(),
}));

const mockedList = vi.mocked(listAdminProducts);
const mockedDelete = vi.mocked(deleteAdminProduct);
const mockedCategories = vi.mocked(getProductCategories);

function product(index: number, category = 'accesorios'): Product {
  return {
    id: `mongo-id-${index}`,
    name: `Producto ${index}`,
    description: `Descripcion ${index}`,
    price: 1000 * index,
    stock: 10,
    category,
    imageUrl: `https://example.com/producto-${index}.png`,
  };
}

function stubMatchMedia(isDesktop: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
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

function EditProbe() {
  const { id } = useParams();
  return <p>Editando {id}</p>;
}

function renderPage(initialEntry = '/admin/productos') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ChakraProvider value={system}>
        <Routes>
          <Route path="/admin/productos" element={<AdminProductsPage />} />
          <Route
            path="/admin/productos/nuevo"
            element={<p>Formulario nuevo</p>}
          />
          <Route
            path="/admin/productos/:id/editar"
            element={<EditProbe />}
          />
        </Routes>
      </ChakraProvider>
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
  // jsdom has no matchMedia: default every test to the mobile layout.
  stubMatchMedia(false);
});

describe('AdminProductsPage', () => {
  it('renders the catalog as stacked rows on mobile', async () => {
    mockedList.mockResolvedValueOnce([product(1), product(2)]);

    renderPage();

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
    expect(screen.getAllByText('Accesorios · Stock: 10 u.')).toHaveLength(2);
    expect(screen.getByText('$1.000')).toBeInTheDocument();
    expect(screen.getByText('$2.000')).toBeInTheDocument();
  });

  it('renders the desktop table with one page of 8 and the shown count', async () => {
    stubMatchMedia(true);
    mockedList.mockResolvedValueOnce(
      Array.from({ length: 20 }, (_, index) => product(index + 1)),
    );

    renderPage();

    expect(
      await screen.findByRole('columnheader', { name: 'Producto' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Mostrando 8 de 20')).toBeInTheDocument();
    expect(screen.getByText('Producto 1')).toBeInTheDocument();
    expect(screen.queryByText('Producto 9')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Página 2' }));

    expect(await screen.findByText('Producto 9')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 16 de 20')).toBeInTheDocument();
  });

  it('filters by name from the search box', async () => {
    mockedList.mockResolvedValueOnce([product(1), product(2)]);

    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre'), {
      target: { value: 'Producto 2' },
    });

    expect(screen.queryByText('Producto 1')).toBeNull();
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
  });

  it('shows the no-match state when the filters exclude everything', async () => {
    mockedList.mockResolvedValueOnce([product(1)]);

    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre'), {
      target: { value: 'inexistente' },
    });

    expect(
      screen.getByText('No encontramos productos con esos filtros.'),
    ).toBeInTheDocument();
  });

  it('filters by category on desktop', async () => {
    stubMatchMedia(true);
    mockedList.mockResolvedValueOnce([
      product(1, 'accesorios'),
      product(2, 'gadgets'),
    ]);

    renderPage();
    await screen.findByText('Producto 1');
    await screen.findByRole('option', { name: 'Gadgets' });

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'gadgets' },
    });

    expect(screen.queryByText('Producto 1')).toBeNull();
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
  });

  it('deletes a product only after the confirmation', async () => {
    mockedList.mockResolvedValueOnce([product(1), product(2)]);
    mockedDelete.mockResolvedValueOnce(undefined);

    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Producto 1' }));

    const dialog = await screen.findByRole('dialog', {
      name: 'Eliminar producto',
    });
    expect(dialog.textContent).toContain('Producto 1');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith('mongo-id-1'),
    );
    await waitFor(() => expect(screen.queryByText('Producto 1')).toBeNull());
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
  });

  it('keeps the product when the confirmation is cancelled', async () => {
    mockedList.mockResolvedValueOnce([product(1)]);

    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Producto 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockedDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Producto 1')).toBeInTheDocument();
  });

  it('opens the create form from the header action', async () => {
    mockedList.mockResolvedValueOnce([]);

    renderPage();
    await screen.findByText('Todavía no hay productos cargados.');

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo' }));

    expect(screen.getByText('Formulario nuevo')).toBeInTheDocument();
  });

  it('opens the edit form for a row', async () => {
    mockedList.mockResolvedValueOnce([product(1)]);

    renderPage();
    await screen.findByText('Producto 1');

    fireEvent.click(screen.getByRole('button', { name: 'Editar Producto 1' }));

    expect(screen.getByText('Editando mongo-id-1')).toBeInTheDocument();
  });

  it('shows the error state and retries on demand', async () => {
    mockedList
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValueOnce([product(1)]);

    renderPage();

    expect(
      await screen.findByText('No pudimos cargar los productos.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Producto 1')).toBeInTheDocument();
  });
});
