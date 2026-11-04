import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '../types/cart.ts';
import type { Product } from '../types/product.ts';
import { TOKEN_STORAGE_KEY } from '../services/api.ts';
import * as authService from '../services/authService.ts';
import * as cartService from '../services/cartService.ts';
import { AuthProvider } from './AuthContext.tsx';
import { CartProvider, useCart } from './CartContext.tsx';

vi.mock('../services/cartService.ts', () => ({
  getCart: vi.fn(),
  addToCart: vi.fn(),
  setCartItemQuantity: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

vi.mock('../services/authService.ts', () => ({
  me: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const mockedGetCart = vi.mocked(cartService.getCart);
const mockedAddToCart = vi.mocked(cartService.addToCart);
const mockedSetQuantity = vi.mocked(cartService.setCartItemQuantity);
const mockedRemove = vi.mocked(cartService.removeCartItem);
const mockedClear = vi.mocked(cartService.clearCart);
const mockedMe = vi.mocked(authService.me);

const STORAGE_KEY = 'novamarket.cart.v1';
const MONGO_ID = '507f1f77bcf86cd799439011';

const PRODUCT: Product = {
  id: 'p1',
  name: 'Teclado Mecánico',
  description: 'Teclado',
  price: 18500,
  stock: 4,
  category: 'perifericos',
  imageUrl: 'https://example.com/teclado.png',
};

function snapshot(items: CartItem[]) {
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    ),
  };
}

const EMPTY = snapshot([]);

const SERVER_ITEM: CartItem = {
  productId: MONGO_ID,
  name: 'Teclado Mecánico',
  unitPrice: 18500,
  quantity: 2,
  stock: 4,
  imageUrl: 'https://example.com/teclado.png',
};

function renderCart() {
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => (
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    ),
  });
}

function loginAsStoredSession() {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, 'test-token');
  // AuthProvider only restores a session when both halves are present.
  window.localStorage.setItem(
    'novamarket_user',
    JSON.stringify({
      id: 'u1',
      name: 'Ana',
      email: 'ana@example.com',
      role: 'cliente',
    }),
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  mockedMe.mockResolvedValue({
    id: 'u1',
    name: 'Ana',
    email: 'ana@example.com',
    role: 'cliente',
  });
  mockedGetCart.mockResolvedValue(EMPTY);
  mockedAddToCart.mockResolvedValue(EMPTY);
  mockedSetQuantity.mockResolvedValue(EMPTY);
  mockedRemove.mockResolvedValue(EMPTY);
  mockedClear.mockResolvedValue(EMPTY);
});

describe('CartContext — guest cart', () => {
  it('adds a product once per click and persists the cart', async () => {
    const { result } = renderCart();

    await act(async () => {
      await result.current.addItem(PRODUCT);
      await result.current.addItem(PRODUCT);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalAmount).toBe(37000);

    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).toContain('p1'),
    );
  });

  it('rehydrates the cart from localStorage on mount', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          productId: 'p9',
          name: 'Mouse',
          unitPrice: 8000,
          quantity: 3,
        },
      ]),
    );

    const { result } = renderCart();

    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalAmount).toBe(24000);
  });

  it('ignores corrupted storage instead of crashing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');

    const { result } = renderCart();

    expect(result.current.items).toEqual([]);
  });

  it('sets an absolute quantity and drops the line at zero', async () => {
    const { result } = renderCart();

    await act(async () => {
      await result.current.addItem(PRODUCT);
      await result.current.updateQuantity('p1', 3);
    });
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalAmount).toBe(55500);

    await act(async () => {
      await result.current.updateQuantity('p1', 0);
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('removes a line with removeItem and empties the cart with clearCart', async () => {
    const { result } = renderCart();

    await act(async () => {
      await result.current.addItem(PRODUCT);
      await result.current.removeItem('p1');
    });
    expect(result.current.items).toHaveLength(0);

    await act(async () => {
      await result.current.addItem(PRODUCT);
      await result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('never calls the API without a session', async () => {
    const { result } = renderCart();

    await act(async () => {
      await result.current.addItem(PRODUCT);
    });

    expect(mockedAddToCart).not.toHaveBeenCalled();
    expect(mockedGetCart).not.toHaveBeenCalled();
  });
});

describe('CartContext — server cart', () => {
  it('merges the guest cart into the server cart on login and drops the local copy', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { productId: MONGO_ID, name: 'Teclado', unitPrice: 18500, quantity: 2 },
      ]),
    );
    loginAsStoredSession();
    mockedGetCart.mockResolvedValue(snapshot([SERVER_ITEM]));

    const { result } = renderCart();

    await waitFor(() => expect(result.current.items).toEqual([SERVER_ITEM]));
    expect(mockedAddToCart).toHaveBeenCalledWith(MONGO_ID, 2);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('skips guest lines whose id is not a Mongo id', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { productId: 'local-1', name: 'Borrador', unitPrice: 100, quantity: 1 },
      ]),
    );
    loginAsStoredSession();

    renderCart();

    await waitFor(() => expect(mockedGetCart).toHaveBeenCalled());
    expect(mockedAddToCart).not.toHaveBeenCalled();
  });

  it('keeps the guest cart when the merge fails on the network', async () => {
    const guestLine = {
      productId: MONGO_ID,
      name: 'Teclado',
      unitPrice: 18500,
      quantity: 2,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([guestLine]));
    loginAsStoredSession();
    mockedAddToCart.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    renderCart();

    await waitFor(() => expect(mockedGetCart).toHaveBeenCalled());
    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).toContain(MONGO_ID),
    );
  });

  it('adds through the API and adopts the returned cart', async () => {
    loginAsStoredSession();
    mockedAddToCart.mockResolvedValue(snapshot([SERVER_ITEM]));

    const { result } = renderCart();
    await waitFor(() => expect(mockedGetCart).toHaveBeenCalled());

    let added = false;
    await act(async () => {
      added = await result.current.addItem({ ...PRODUCT, id: MONGO_ID });
    });

    expect(added).toBe(true);
    expect(mockedAddToCart).toHaveBeenCalledWith(MONGO_ID, 1);
    expect(result.current.items).toEqual([SERVER_ITEM]);
    expect(result.current.totalItems).toBe(2);
  });

  it('reports a stock conflict without changing the cart', async () => {
    loginAsStoredSession();
    mockedAddToCart.mockRejectedValue(
      new Error('Stock insuficiente para Teclado. Disponibles: 1'),
    );

    const { result } = renderCart();
    await waitFor(() => expect(mockedGetCart).toHaveBeenCalled());

    let added = true;
    await act(async () => {
      added = await result.current.addItem({ ...PRODUCT, id: MONGO_ID });
    });

    expect(added).toBe(false);
    expect(result.current.error).toBe(
      'Stock insuficiente para Teclado. Disponibles: 1',
    );
    expect(result.current.items).toEqual([]);

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('uses PATCH for a quantity and DELETE for zero', async () => {
    loginAsStoredSession();
    const { result } = renderCart();
    await waitFor(() => expect(mockedGetCart).toHaveBeenCalled());

    await act(async () => {
      await result.current.updateQuantity(MONGO_ID, 3);
    });
    expect(mockedSetQuantity).toHaveBeenCalledWith(MONGO_ID, 3);

    await act(async () => {
      await result.current.updateQuantity(MONGO_ID, 0);
    });
    expect(mockedRemove).toHaveBeenCalledWith(MONGO_ID);
  });

  it('removes and clears through the API', async () => {
    loginAsStoredSession();
    const { result } = renderCart();
    await waitFor(() => expect(mockedGetCart).toHaveBeenCalled());

    await act(async () => {
      await result.current.removeItem(MONGO_ID);
    });
    expect(mockedRemove).toHaveBeenCalledWith(MONGO_ID);

    await act(async () => {
      await result.current.clearCart();
    });
    expect(mockedClear).toHaveBeenCalled();
  });
});
