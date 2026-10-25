import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAllOrders, updateOrderStatus } from './orderService.ts';

const dto = {
  _id: '507f1f77bcf86cd799439020',
  userId: { _id: 'u1', nombre: 'Ana Pérez', email: 'ana@example.com' },
  items: [
    {
      _id: 'i1',
      productId: 'p1',
      nombre: 'Teclado',
      cantidad: 2,
      precioHistorico: 5000,
    },
  ],
  total: 10000,
  estado: 'pendiente',
  direccionEnvio: {
    calle: 'Calle 1',
    ciudad: 'CABA',
    provincia: 'Buenos Aires',
    codigoPostal: '1000',
  },
  createdAt: '2026-10-01T12:00:00.000Z',
};

function mockFetch(payload: unknown, status = 200) {
  const fn = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('orderService', () => {
  it('getAllOrders pide GET /orders y mapea el precio histórico', async () => {
    const fetchMock = mockFetch({ ok: true, message: null, data: [dto] });

    const orders = await getAllOrders();

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/orders$/);
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      id: dto._id,
      code: '#439020',
      status: 'pendiente',
      total: 10000,
      customer: { name: 'Ana Pérez', email: 'ana@example.com' },
      items: [{ name: 'Teclado', quantity: 2, priceAtPurchase: 5000 }],
    });
  });

  it('getAllOrders rechaza si la respuesta no es un array válido', async () => {
    mockFetch({ ok: true, message: null, data: { nope: true } });
    await expect(getAllOrders()).rejects.toThrow('Invalid orders response');
  });

  it('updateOrderStatus hace PUT con { estado } y devuelve el pedido', async () => {
    const fetchMock = mockFetch({
      ok: true,
      message: 'ok',
      data: { ...dto, estado: 'enviado' },
    });

    const order = await updateOrderStatus(dto._id, 'enviado');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/orders\/507f1f77bcf86cd799439020\/status$/);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ estado: 'enviado' });
    expect(order.status).toBe('enviado');
  });
});
