import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminOrdersPage from './AdminOrdersPage.tsx';
import * as orderService from '../../services/orderService.ts';
import type { Order } from '../../services/orderService.ts';

vi.mock('../../services/orderService.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof orderService>()),
  getAllOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

const getAllOrders = vi.mocked(orderService.getAllOrders);
const updateOrderStatus = vi.mocked(orderService.updateOrderStatus);

function makeOrder(overrides: Partial<Order> & { id: string }): Order {
  return {
    code: `#${overrides.id.toUpperCase()}`,
    date: '01/10/2026',
    customer: { name: 'Julián Pérez', email: 'julian@email.com' },
    address: 'Calle 1, CABA, Buenos Aires (1000)',
    items: [
      { id: 'i1', name: 'Teclado K380', quantity: 1, priceAtPurchase: 5000 },
    ],
    total: 5000,
    status: 'pendiente',
    ...overrides,
  };
}

const ORDERS = [
  makeOrder({ id: 'a1' }),
  makeOrder({
    id: 'b2',
    customer: { name: 'Carla Gomez', email: 'carla@email.com' },
    items: [
      { id: 'i2', name: 'Mouse G305', quantity: 2, priceAtPurchase: 3000 },
    ],
    total: 6000,
    status: 'enviado',
  }),
];

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
  beforeEach(() => {
    vi.resetAllMocks();
    getAllOrders.mockResolvedValue(ORDERS);
  });

  it('muestra "Cargando" y luego la tabla con los pedidos de getAllOrders()', async () => {
    stubMatchMedia(true);
    render(<AdminOrdersPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando pedidos');
    expect(
      await screen.findByRole('columnheader', { name: 'Estado' }),
    ).toBeInTheDocument();
    expect(getAllOrders).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Carla Gomez')).toBeInTheDocument();
  });

  it('en desktop muestra el detalle del más nuevo con el precio histórico', async () => {
    stubMatchMedia(true);
    render(<AdminOrdersPage />);

    expect(
      await screen.findByRole('heading', { name: '#A1' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 x Teclado K380')).toBeInTheDocument();
    expect(screen.getByText('julian@email.com')).toBeInTheDocument();
  });

  it('en desktop cambia el detalle al seleccionar otro pedido', async () => {
    stubMatchMedia(true);
    render(<AdminOrdersPage />);
    await screen.findByRole('heading', { name: '#A1' });

    fireEvent.click(screen.getByRole('button', { name: 'Ver pedido #B2' }));

    expect(screen.getByRole('heading', { name: '#B2' })).toBeInTheDocument();
    expect(screen.getByText('2 x Mouse G305')).toBeInTheDocument();
  });

  it('cambia el estado desde la tabla y refleja el pedido actualizado', async () => {
    stubMatchMedia(true);
    updateOrderStatus.mockResolvedValue({ ...ORDERS[0], status: 'pagado' });
    render(<AdminOrdersPage />);

    const select = await screen.findByLabelText('Estado del pedido #A1');
    fireEvent.change(select, { target: { value: 'pagado' } });

    expect(updateOrderStatus).toHaveBeenCalledWith('a1', 'pagado');
    await waitFor(() =>
      expect(screen.getByLabelText('Estado del pedido #A1')).toHaveValue(
        'pagado',
      ),
    );
  });

  it('muestra un error y deja el estado anterior si falla la actualización', async () => {
    stubMatchMedia(true);
    updateOrderStatus.mockRejectedValue(new Error('boom'));
    render(<AdminOrdersPage />);

    const select = await screen.findByLabelText('Estado del pedido #A1');
    fireEvent.change(select, { target: { value: 'entregado' } });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo actualizar el estado del pedido #A1',
    );
    expect(screen.getByLabelText('Estado del pedido #A1')).toHaveValue(
      'pendiente',
    );
  });

  it('muestra un error si getAllOrders() falla', async () => {
    stubMatchMedia(true);
    getAllOrders.mockRejectedValue(new Error('boom'));
    render(<AdminOrdersPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los pedidos',
    );
  });

  it('en mobile muestra solo la lista hasta seleccionar un pedido', async () => {
    stubMatchMedia(false);
    render(<AdminOrdersPage />);

    expect(await screen.findByText('#A1')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Pedidos' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('julian@email.com')).toBeNull();
  });

  it('en mobile abre el detalle con el selector de estado y vuelve con el link', async () => {
    stubMatchMedia(false);
    render(<AdminOrdersPage />);
    await screen.findByText('#B2');

    fireEvent.click(screen.getByRole('button', { name: 'Ver pedido #B2' }));

    expect(screen.getByText('carla@email.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado del pedido #B2')).toHaveValue(
      'enviado',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pedidos' }));

    expect(
      screen.getByRole('heading', { name: 'Pedidos' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('carla@email.com')).toBeNull();
  });
});
