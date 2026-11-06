import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductFormPage from './ProductFormPage.tsx';
import { ApiError } from '../../services/api.ts';
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../../services/productService.ts';
import { getProductCategories } from '../../services/formdataService.ts';
import { ImageUploadError, uploadProductImage } from '../../services/cloudinaryService.ts';
import { system } from '../../theme/system.ts';
import type { Product } from '../../types/product.ts';

vi.mock('../../services/productService.ts', () => ({
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

// Keep the real file validation; only the network call is stubbed.
vi.mock('../../services/cloudinaryService.ts', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../services/cloudinaryService.ts')
    >();
  return { ...actual, uploadProductImage: vi.fn() };
});

vi.mock('../../services/formdataService.ts', () => ({
  getProductCategories: vi.fn(),
}));

const mockedGetById = vi.mocked(getProductById);
const mockedCreate = vi.mocked(createProduct);
const mockedUpdate = vi.mocked(updateProduct);
const mockedCategories = vi.mocked(getProductCategories);
const mockedUpload = vi.mocked(uploadProductImage);

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
    mockedGetById.mockResolvedValueOnce(saved);
    mockedUpdate.mockResolvedValueOnce(saved);
    renderForm('/admin/productos/mongo-id-1/editar');

    expect(
      await screen.findByRole('heading', { name: 'Editar producto' }),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Producto 1')).toBeInTheDocument();
    expect(mockedGetById).toHaveBeenCalledWith(
      'mongo-id-1',
      expect.anything(),
    );

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
    mockedGetById.mockRejectedValueOnce(new ApiError('Not found', 404));
    renderForm('/admin/productos/nope/editar');

    expect(
      await screen.findByText('No encontramos ese producto.'),
    ).toBeInTheDocument();
  });

  it('treats an id rejected by the API as a missing product', async () => {
    mockedGetById.mockRejectedValueOnce(new ApiError('Invalid id', 400));
    renderForm('/admin/productos/local-1700000000000/editar');

    expect(
      await screen.findByText('No encontramos ese producto.'),
    ).toBeInTheDocument();
  });

  it('keeps the form open and explains a rejected save', async () => {
    mockedCreate.mockRejectedValueOnce(new ApiError('Forbidden', 403));
    renderForm();

    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(
      await screen.findByText('No tenés permisos para esta acción.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Nuevo producto' }),
    ).toBeInTheDocument();
  });

  it('uploads the picked image and saves the returned URL', async () => {
    mockedUpload.mockResolvedValueOnce(
      'https://res.cloudinary.com/demo-cloud/image/upload/v1/foto.png',
    );
    mockedCreate.mockResolvedValueOnce(saved);
    renderForm();

    await fillValidForm();
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/subir imagen/i), {
      target: { files: [file] },
    });

    expect(mockedUpload).toHaveBeenCalledWith(file);
    // The preview must end on the persisted URL, never a blob: URL.
    expect(await screen.findByAltText('Vista previa del producto')).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/demo-cloud/image/upload/v1/foto.png',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/foto.png',
        }),
      ),
    );
  });

  it('reports an upload failure and saves the product without an image', async () => {
    mockedUpload.mockRejectedValueOnce(
      new ImageUploadError('No pudimos subir la imagen. Intentá de nuevo.'),
    );
    mockedCreate.mockResolvedValueOnce(saved);
    renderForm();

    await fillValidForm();
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/subir imagen/i), {
      target: { files: [file] },
    });

    expect(
      await screen.findByText('No pudimos subir la imagen. Intentá de nuevo.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: '' }),
      ),
    );
  });

  it('rejects a file with an unsupported type before uploading', async () => {
    renderForm();

    const pdf = new File(['x'], 'ficha.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/subir imagen/i), {
      target: { files: [pdf] },
    });

    expect(
      await screen.findByText('La imagen debe ser JPG, PNG o WEBP.'),
    ).toBeInTheDocument();
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it('blocks saving while the image is still uploading', async () => {
    let resolveUpload: (url: string) => void = () => {};
    mockedUpload.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveUpload = resolve;
        }),
    );
    renderForm();

    await fillValidForm();
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/subir imagen/i), {
      target: { files: [file] },
    });

    expect(await screen.findByText('Subiendo imagen…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar producto' })).toBeDisabled();

    resolveUpload('https://res.cloudinary.com/demo-cloud/image/upload/v1/foto.png');

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Guardar producto' }),
      ).toBeEnabled(),
    );
  });

  it('returns to the list from Cancelar without saving', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('Lista de productos')).toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
