import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../types/cart.ts';
import type { Product } from '../types/product.ts';

/**
 * Local cart state, persisted in localStorage. The backend cart (SN-285) is
 * not wired yet, so this is the single source of truth until the service
 * lands: the storage key is versioned so a future shape change can be
 * discarded instead of crashing on stale data.
 */
const STORAGE_KEY = 'novamarket.cart.v1';

export interface CartContextValue {
  items: CartItem[];
  /** Total units in the cart (sum of quantities), for the navbar badge. */
  count: number;
  subtotal: number;
  addItem: (product: Product) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.unitPrice === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
}

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    // A corrupted entry is not worth a crash: start from an empty cart.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private mode / quota: keep the in-memory cart working.
    }
  }, [items]);

  const addItem = useCallback((product: Product) => {
    const productId = String(product.id);
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...current,
        {
          productId,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
          stock: product.stock,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }, []);

  const increment = useCallback((productId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }, []);

  const decrement = useCallback((productId: string) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) return [item];
        return item.quantity > 1
          ? [{ ...item, quantity: item.quantity - 1 }]
          : [];
      }),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    return {
      items,
      count,
      subtotal,
      addItem,
      increment,
      decrement,
      remove,
      clear,
    };
  }, [items, addItem, increment, decrement, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
