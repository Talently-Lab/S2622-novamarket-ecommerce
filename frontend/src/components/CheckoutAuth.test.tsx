import { fireEvent, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { system } from '../theme/system.ts';
import CheckoutAuth from './CheckoutAuth.tsx';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  cart: { totalItems: 3, totalAmount: 79700 },
}));

vi.mock('../context/AuthContext.tsx', () => ({
  useAuth: () => ({ login: mocks.login }),
}));

vi.mock('../context/CartContext.tsx', () => ({
  useCart: () => mocks.cart,
}));

function renderGate() {
  return render(
    <ChakraProvider value={system}>
      <MemoryRouter initialEntries={['/checkout']}>
        <CheckoutAuth />
      </MemoryRouter>
    </ChakraProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.login.mockResolvedValue({ id: 'u1', role: 'cliente' });
});

describe('CheckoutAuth', () => {
  it('renders the Figma gate with the cart summary', () => {
    renderGate();

    expect(
      screen.getByRole('heading', { name: 'Ingresá para finalizar tu compra' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tu carrito se mantiene mientras ingresás.'),
    ).toBeInTheDocument();
    expect(screen.getByText('3 productos')).toBeInTheDocument();
    expect(screen.getByText('$79.700')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Ya tengo cuenta' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '¿Primera vez en NovaMarket?' }),
    ).toBeInTheDocument();
  });

  it('links the register CTA back to the checkout', () => {
    renderGate();

    expect(
      screen.getByRole('link', { name: 'Crear mi cuenta' }),
    ).toHaveAttribute('href', '/registro');
  });

  it('validates the credentials before calling the API', async () => {
    renderGate();

    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(
      await screen.findByText('El email es obligatorio'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La contraseña es obligatoria'),
    ).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('logs the user in with the entered credentials', async () => {
    renderGate();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'ClaveSegura1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(mocks.login).toHaveBeenCalledWith('ana@example.com', 'ClaveSegura1');
  });

  it('shows the backend error when the credentials are rejected', async () => {
    mocks.login.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    renderGate();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'mala' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciales inválidas',
    );
  });
});
