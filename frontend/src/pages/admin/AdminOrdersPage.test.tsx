import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminOrdersPage from './AdminOrdersPage.tsx';
import { ADMIN_ORDERS } from '../../data/adminOrders.ts';

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

describe('AdminOrdersPage', () => {
  it('keeps every fixture total equal to the sum of its line items', () => {
    for (const order of ADMIN_ORDERS) {
      const expected = order.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
      expect(order.total).toBe(expected);
    }
  });

  it('on desktop shows the table and the newest order detail by default', () => {
    stubMatchMedia(true);

    render(<AdminOrdersPage />);

    expect(
      screen.getByRole('columnheader', { name: 'Pedido' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '#NM-0006' }),
    ).toBeInTheDocument();
    expect(screen.getByText('julian@email.com')).toBeInTheDocument();
    expect(screen.getByText('1 x Mouse inalámbrico G305')).toBeInTheDocument();
    expect(screen.getByText('11 2345 6789')).toBeInTheDocument();
  });

  it('on desktop swaps the detail when another order is selected', () => {
    stubMatchMedia(true);

    render(<AdminOrdersPage />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver pedido #NM-0003' }),
    );

    expect(
      screen.getByRole('heading', { name: '#NM-0003' }),
    ).toBeInTheDocument();
    expect(screen.getByText('matias@email.com')).toBeInTheDocument();
    expect(screen.queryByText('julian@email.com')).toBeNull();
  });

  it('on mobile shows only the list until an order is selected', () => {
    stubMatchMedia(false);

    render(<AdminOrdersPage />);

    expect(screen.getByRole('heading', { name: 'Pedidos' })).toBeInTheDocument();
    expect(screen.getByText('#NM-0006')).toBeInTheDocument();
    expect(screen.queryByText('julian@email.com')).toBeNull();
  });

  it('on mobile opens the detail and returns with the back link', () => {
    stubMatchMedia(false);

    render(<AdminOrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver pedido #NM-0004' }));

    expect(screen.getByText('carla@email.com')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Productos' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pedidos' }));

    expect(screen.getByRole('heading', { name: 'Pedidos' })).toBeInTheDocument();
    expect(screen.queryByText('carla@email.com')).toBeNull();
  });
});
