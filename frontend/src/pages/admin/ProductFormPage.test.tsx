import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductFormPage from './ProductFormPage.tsx';
import {
  createAdminProduct,
  listAdminProducts,
  updateAdminProduct,
} from '../../services/adminProductService.ts';
import { getProductCategories } from '../../services/formdataService.ts';
import { system } from '../../theme/system.ts';
import type { Product } from '../../types/product.ts';

vi.mock('../../services/adminProductService.ts', () => ({
  listAdminProducts: vi.fn(),
  createAdminProduct: vi.fn(),
  updateAdminProduct: vi.fn(),
}));

vi.mock('../../services/formdataService.ts', () => ({
  getProductCategories: vi.fn(),
}));

const mockedList = vi.mocked(listAdminProducts);
const mockedCreate = vi.mocked(createAdminProduct);
const mockedUpdate = vi.mocked(updateAdminProduct);
const mockedCategories = vi.mocked(getProductCategories);

const saved: Product = {
  id: 'mongo-id-1',
  name: 'Producto 1',
  description: 'Descripcion 1',
  price: 1000,
  stock: 10,
  category: 'accesorios',
  imageUrl: '',
};

function renderForm(initialEntry = '/admin/productos/nuevo') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ChakraProvider value={system}>
        <Routes>
          <Route path="/admin/productos" element={<p>Lista de productos</p>} />
          <Route path="/admin/productos/nuevo" element={<ProductFormPage />} />
          <Route
            path="/admin/productos/:id/editar"
            element={<ProductFormPage />}
          />
        </Routes>
      </ChakraProvider>
    </MemoryRouter>,
  );
}

async function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Nombre'), {
    target: { value: 'Teclado NovaType K7' },
  });
  // The category options come from the backend request.
  await screen.findByRole('option', { name: 'Perifericos' });
  fireEvent.change(screen.getByLabelText('Categoría'), {
    target: { value: 'perifericos' },
  });
  fireEvent.change(screen.getByLabelText('Precio'), {
    target: { value: '45999' },
  });
  fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '7' } });
  fireEvent.change(screen.getByLabelText('Descripción'), {
    target: { value: 'Teclado mecánico 75%' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedCategories.mockResolvedValue([
    { value: 'perifericos', label: 'Perifericos' },
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'gadgets', label: 'Gadgets' },
  ]);
  URL.createObjectURL = vi.fn(() => 'blob:http://localhost/preview');
  URL.revokeObjectURL = vi.fn();
});

describe('ProductFormPage', () => {
  it('renders the create form with the design fields', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { name: 'Nuevo producto' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio')).toBeInTheDocument();
    expect(screen.getByLabelText('Stock')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText(/specs clave/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subir imagen/i)).toBeInTheDocument();
  });

  it('reports the Spanish validation messages and does not save', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(
      screen.getByText('Seleccioná una categoría'),
    ).toBeInTheDocument();
    expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('creates the product with the parsed values and returns to the list', async () => {
    mockedCreate.mockResolvedValueOnce(saved);
    renderForm();

    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith({
        name: 'Teclado NovaType K7',
        description: 'Teclado mecánico 75%',
        price: 45999,
        stock: 7,
        category: 'perifericos',
        imageUrl: '',
      }),
    );
    expect(await screen.findByText('Lista de productos')).toBeInTheDocument();
  });

  it('keeps the Specs clave input inert: it is never part of the payload', async () => {
    mockedCreate.mockResolvedValueOnce(saved);
    renderForm();

    await fillValidForm();
    fireEvent.change(screen.getByLabelText(/specs clave/i), {
      target: { value: 'inalámbrico, RGB' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    await waitFor(() => expect(mockedCreate).toHaveBeenCalledTimes(1));
    const payload = mockedCreate.mock.calls[0][0];
    expect(Object.keys(payload).sort()).toEqual([
      'category',
      'description',
      'imageUrl',
      'name',
      'price',
      'stock',
    ]);
  });

  it('loads and updates the product in edit mode', async () => {
    mockedList.mockResolvedValueOnce([saved]);
    mockedUpdate.mockResolvedValueOnce(saved);
    renderForm('/admin/productos/mongo-id-1/editar');

    expect(
      await screen.findByRole('heading', { name: 'Editar producto' }),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Producto 1')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Renombrado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith('mongo-id-1', {
        name: 'Renombrado',
        description: 'Descripcion 1',
        price: 1000,
        stock: 10,
        category: 'accesorios',
        imageUrl: '',
      }),
    );
  });

  it('shows a not-found message for an unknown id', async () => {
    mockedList.mockResolvedValueOnce([saved]);
    renderForm('/admin/productos/nope/editar');

    expect(
      await screen.findByText('No encontramos ese producto.'),
    ).toBeInTheDocument();
  });

  it('previews the picked image and saves it as a string', async () => {
    mockedCreate.mockResolvedValueOnce(saved);
    renderForm();

    await fillValidForm();
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/subir imagen/i), {
      target: { files: [file] },
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(
      screen.getByAltText('Vista previa del producto'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'blob:http://localhost/preview' }),
      ),
    );
  });

  it('returns to the list from Cancelar without saving', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('Lista de productos')).toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
