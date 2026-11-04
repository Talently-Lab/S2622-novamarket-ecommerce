import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { system } from '../theme/system.ts';
import type { CartItem } from '../types/cart.ts';
import CheckoutPage from './CheckoutPage.tsx';

function line(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p1',
    name: 'Teclado Mecánico',
    unitPrice: 5000,
    quantity: 2,
    stock: 5,
    imageUrl: '',
    ...overrides,
  };
}

const mocks = vi.hoisted(() => {
  const cart: {
    items: unknown[];
    totalItems: number;
    totalAmount: number;
    loading: boolean;
    clearCart: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  } = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    clearCart: vi.fn(),
    removeItem: vi.fn(),
    refresh: vi.fn(),
  };
  return {
    cart,
    createOrder: vi.fn(),
    user: null as null | {
      id: string;
      name: string;
      email: string;
      role: string;
    },
  };
});

vi.mock('../context/CartContext.tsx', () => ({
  useCart: () => mocks.cart,
}));

vi.mock('../context/AuthContext.tsx', () => ({
  useAuth: () => ({ user: mocks.user, loading: false, login: vi.fn() }),
}));

vi.mock('../services/orderService.ts', () => ({
  createOrder: mocks.createOrder,
}));

function renderPage() {
  return render(
    <ChakraProvider value={system}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/confirmacion"
            element={<p>pantalla de confirmación</p>}
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );
}

function fillAddress() {
  fireEvent.change(screen.getByLabelText('Calle y número'), {
    target: { value: 'Av. Corrientes 1234' },
  });
  fireEvent.change(screen.getByLabelText('Ciudad'), {
    target: { value: 'CABA' },
  });
  fireEvent.change(screen.getByLabelText('Provincia'), {
    target: { value: 'Buenos Aires' },
  });
  fireEvent.change(screen.getByLabelText('Código postal'), {
    target: { value: '1043' },
  });
}

function setCart(items: CartItem[]) {
  mocks.cart.items = items;
  mocks.cart.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  mocks.cart.totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = {
    id: 'u1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    role: 'cliente',
  };
  setCart([line()]);
  mocks.cart.clearCart.mockResolvedValue(true);
  mocks.cart.removeItem.mockResolvedValue(true);
  mocks.cart.refresh.mockResolvedValue(null);
  mocks.createOrder.mockResolvedValue({
    id: '507f1f77bcf86cd7994390ab',
    code: 'NM-4390AB',
    total: 10000,
    items: [
      {
        productId: 'p1',
        name: 'Teclado Mecánico',
        quantity: 2,
        priceAtPurchase: 5000,
      },
    ],
  });
});

describe('CheckoutPage', () => {
  it('shows the contact data and the order summary', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Revisá tu pedido' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tu pedido (2)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Cantidad: 2')).toBeInTheDocument();
    // Line total, subtotal and total all render the same amount.
    expect(screen.getAllByText('$10.000').length).toBeGreaterThan(0);
  });

  it('does not submit without an address and reports every missing field', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(
      await screen.findByText('Ingresá la calle y el número'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ingresá la ciudad')).toBeInTheDocument();
    expect(screen.getByText('Ingresá la provincia')).toBeInTheDocument();
    expect(screen.getByText('Ingresá el código postal')).toBeInTheDocument();
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it('creates the order, clears the cart and navigates to the confirmation', async () => {
    renderPage();
    fillAddress();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(
      await screen.findByText('pantalla de confirmación'),
    ).toBeInTheDocument();
    expect(mocks.createOrder).toHaveBeenCalledWith({
      items: [{ productId: 'p1', cantidad: 2 }],
      total: 10000,
      direccionEnvio: {
        calle: 'Av. Corrientes 1234',
        ciudad: 'CABA',
        provincia: 'Buenos Aires',
        codigoPostal: '1043',
      },
    });
    await waitFor(() => expect(mocks.cart.clearCart).toHaveBeenCalled());
  });

  it('shows the sign-in gate instead of the review when there is no session', () => {
    mocks.user = null;
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Ingresá para finalizar tu compra' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirmar pedido' }),
    ).not.toBeInTheDocument();
  });

  it('flags a line that lost its stock, excludes it from the total and offers to remove it', async () => {
    setCart([
      line(),
      line({
        productId: 'p2',
        name: 'Teclado NovaKey TKL',
        unitPrice: 1000,
        quantity: 2,
        stock: 1,
      }),
    ]);
    renderPage();

    expect(
      screen.getByText('Uno producto ya no está disponible'),
    ).toBeInTheDocument();
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
    expect(screen.getByText('Producto sin stock')).toBeInTheDocument();
    expect(screen.getByText('-$2.000')).toBeInTheDocument();
    // Subtotal keeps every line; the payable total drops the blocked one.
    expect(screen.getByText('$12.000')).toBeInTheDocument();
    expect(screen.getAllByText('$10.000')).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: 'Confirmar pedido' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Quitar y continuar' }));

    await waitFor(() =>
      expect(mocks.cart.removeItem).toHaveBeenCalledWith('p2'),
    );
    expect(mocks.cart.removeItem).not.toHaveBeenCalledWith('p1');
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it('shows the connection error with a retry action and retries the order', async () => {
    mocks.createOrder.mockRejectedValueOnce(
      new Error('Hubo un problema de conexión con nuestro sistema.'),
    );
    renderPage();
    fillAddress();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(
      await screen.findByText('No pudimos confirmar tu pedido'),
    ).toBeInTheDocument();
    expect(mocks.cart.refresh).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => expect(mocks.createOrder).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByText('pantalla de confirmación'),
    ).toBeInTheDocument();
  });

  it('switches to the stock banner when the refresh finds the line unavailable', async () => {
    mocks.createOrder.mockRejectedValueOnce(
      new Error('Stock insuficiente para Teclado. Disponibles: 1'),
    );
    mocks.cart.refresh.mockImplementationOnce(async () => {
      const fresh = [line({ quantity: 3, stock: 1 })];
      setCart(fresh);
      return fresh;
    });
    renderPage();
    fillAddress();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(
      await screen.findByText('Uno producto ya no está disponible'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No pudimos confirmar tu pedido'),
    ).not.toBeInTheDocument();
  });
});
