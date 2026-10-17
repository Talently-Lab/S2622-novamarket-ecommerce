/**
 * Admin orders fixture (SN-251).
 *
 * There is no orders API yet — `backend/src/routes/productRoutes.js` is the
 * only catalog-facing router and order management is not in the Week-5 scope.
 * The design (pics-admin/pedidos-izq.jpg, pedidos-der.jpg) shows a fixed list,
 * so it is reproduced here as static data. Swap this module for a real
 * `orderService` when the backend lands the endpoints; the page does not
 * change.
 *
 * The design's mockups disagree with each other on the customer names for
 * NM-0001..NM-0006 (the mobile list mixes them up and repeats `#NM-0006`
 * twice). This file keeps ONE consistent dataset, the one the desktop detail
 * panel can back up.
 */
export interface OrderItem {
  id: string;
  quantity: number;
  name: string;
  unitPrice: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  date: string;
  customer: OrderCustomer;
  items: OrderItem[];
  total: number;
}

export const ADMIN_ORDERS: Order[] = [
  {
    id: '#NM-0006',
    date: '01/10',
    customer: {
      name: 'Julián Pérez',
      email: 'julian@email.com',
      phone: '11 2345 6789',
    },
    items: [
      {
        id: 'it-0006-1',
        quantity: 1,
        name: 'Mouse inalámbrico G305',
        unitPrice: 38900,
      },
      {
        id: 'it-0006-2',
        quantity: 1,
        name: 'Teclado bluetooth K380',
        unitPrice: 42500,
      },
      { id: 'it-0006-3', quantity: 1, name: 'Mouse pad XL', unitPrice: 21000 },
    ],
    total: 102400,
  },
  {
    id: '#NM-0005',
    date: '30/09',
    customer: {
      name: 'Tomás Ruiz',
      email: 'tomas@email.com',
      phone: '11 3456 7890',
    },
    items: [
      {
        id: 'it-0005-1',
        quantity: 1,
        name: 'Teclado bluetooth K380',
        unitPrice: 54900,
      },
    ],
    total: 54900,
  },
  {
    id: '#NM-0004',
    date: '30/09',
    customer: {
      name: 'Carla Gomez',
      email: 'carla@email.com',
      phone: '11 4567 8901',
    },
    items: [
      {
        id: 'it-0004-1',
        quantity: 1,
        name: 'Mouse inalámbrico G305',
        unitPrice: 38900,
      },
      { id: 'it-0004-2', quantity: 1, name: 'Mouse pad XL', unitPrice: 21500 },
    ],
    total: 60400,
  },
  {
    id: '#NM-0003',
    date: '29/09',
    customer: {
      name: 'Matías Lopez',
      email: 'matias@email.com',
      phone: '11 5678 9012',
    },
    items: [
      { id: 'it-0003-1', quantity: 1, name: 'Mouse pad XL', unitPrice: 21000 },
    ],
    total: 21000,
  },
  {
    id: '#NM-0002',
    date: '28/09',
    customer: {
      name: 'Lucía Fernández',
      email: 'lucia@email.com',
      phone: '11 6789 0123',
    },
    items: [
      {
        id: 'it-0002-1',
        quantity: 1,
        name: 'Mouse inalámbrico G305',
        unitPrice: 38900,
      },
      {
        id: 'it-0002-2',
        quantity: 1,
        name: 'Teclado bluetooth K380',
        unitPrice: 42500,
      },
      { id: 'it-0002-3', quantity: 1, name: 'Mouse pad XL', unitPrice: 21000 },
      {
        id: 'it-0002-4',
        quantity: 1,
        name: 'Auriculares NovaSound X1',
        unitPrice: 45900,
      },
    ],
    total: 148300,
  },
  {
    id: '#NM-0001',
    date: '27/09',
    customer: {
      name: 'Sofía Díaz',
      email: 'sofia@email.com',
      phone: '11 7890 1234',
    },
    items: [
      {
        id: 'it-0001-1',
        quantity: 1,
        name: 'Mouse inalámbrico G305',
        unitPrice: 38900,
      },
    ],
    total: 38900,
  },
];
