import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { system } from '../theme/system.ts';
import CheckoutConfirmationPage from './CheckoutConfirmationPage.tsx';

const STATE = {
  email: 'ana@example.com',
  order: {
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
  },
};

function renderPage(
  initialEntries: Parameters<typeof MemoryRouter>[0]['initialEntries'],
) {
  return render(
    <ChakraProvider value={system}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/checkout/confirmacion"
            element={<CheckoutConfirmationPage />}
          />
          <Route path="/" element={<p>inicio</p>} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe('CheckoutConfirmationPage', () => {
  it('shows the order number, contact, item count and total', () => {
    renderPage([{ pathname: '/checkout/confirmacion', state: STATE }]);

    expect(
      screen.getByRole('heading', { name: '¡Pedido confirmado!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Número de pedido #NM-4390AB')).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$10.000')).toBeInTheDocument();
  });

  it('sends the user home when opened without an order in state', () => {
    renderPage(['/checkout/confirmacion']);

    expect(screen.getByText('inicio')).toBeInTheDocument();
  });
});
