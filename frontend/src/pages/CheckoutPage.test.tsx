import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { system } from '../theme/system.ts';
import CheckoutPage from './CheckoutPage.tsx';

const mocks = vi.hoisted(() => {
  const clearCart = vi.fn();
  return {
    clearCart,
    createOrder: vi.fn(),
    user: null as null | {
      id: string;
      name: string;
      email: string;
      role: string;
    },
    cart: {
      items: [
        {
          productId: 'p1',
          name: 'Teclado Mecánico',
          unitPrice: 5000,
          quantity: 2,
          imageUrl: '',
        },
      ],
      totalItems: 2,
      totalAmount: 10000,
      loading: false,
      clearCart,
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

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = {
    id: 'u1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    role: 'cliente',
  };
  mocks.clearCart.mockResolvedValue(true);
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
    await waitFor(() => expect(mocks.clearCart).toHaveBeenCalled());
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

  it('shows the backend message when the order is rejected', async () => {
    mocks.createOrder.mockRejectedValueOnce(
      new Error('Stock insuficiente para Teclado Mecánico. Disponibles: 1'),
    );
    renderPage();
    fillAddress();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Stock insuficiente para Teclado Mecánico. Disponibles: 1',
    );
    expect(mocks.clearCart).not.toHaveBeenCalled();
  });
});
