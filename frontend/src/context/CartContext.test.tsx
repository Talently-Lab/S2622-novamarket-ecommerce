import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '../types/product.ts';
import { CartProvider, useCart } from './CartContext.tsx';

const STORAGE_KEY = 'novamarket.cart.v1';

const PRODUCT: Product = {
  id: 'p1',
  name: 'Teclado Mecánico',
  description: 'Teclado',
  price: 18500,
  stock: 4,
  category: 'perifericos',
  imageUrl: 'https://example.com/teclado.png',
};

function renderCart() {
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
  });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('CartContext', () => {
  it('adds a product once per click and persists the cart', async () => {
    const { result } = renderCart();

    act(() => result.current.addItem(PRODUCT));
    act(() => result.current.addItem(PRODUCT));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.count).toBe(2);
    expect(result.current.subtotal).toBe(37000);

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

    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(24000);
  });

  it('ignores corrupted storage instead of crashing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');

    const { result } = renderCart();

    expect(result.current.items).toEqual([]);
  });

  it('decrements to zero by removing the line, and clears on demand', () => {
    const { result } = renderCart();

    act(() => result.current.addItem(PRODUCT));
    act(() => result.current.increment('p1'));
    expect(result.current.items[0].quantity).toBe(2);

    act(() => result.current.decrement('p1'));
    expect(result.current.items[0].quantity).toBe(1);

    act(() => result.current.decrement('p1'));
    expect(result.current.items).toHaveLength(0);

    act(() => result.current.addItem(PRODUCT));
    act(() => result.current.remove('p1'));
    expect(result.current.count).toBe(0);

    act(() => result.current.addItem(PRODUCT));
    act(() => result.current.clear());
    expect(result.current.items).toHaveLength(0);
  });
});
