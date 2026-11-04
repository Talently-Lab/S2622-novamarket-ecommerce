import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../types/cart.ts';
import type { Product } from '../types/product.ts';
import { ApiError, TOKEN_STORAGE_KEY } from '../services/api.ts';
import * as cartService from '../services/cartService.ts';
import { useAuth } from './AuthContext.tsx';

/**
 * Cart state with two backends:
 *
 * - Guest: `localStorage` is the source of truth, so browsing and adding
 *   products works without an account.
 * - Authenticated: the server cart (`/api/cart`) is the source of truth. On
 *   login the guest lines are merged into it (quantities sum, as the backend
 *   does), then the local copy is dropped.
 *
 * The storage key is versioned so a future shape change can be discarded
 * instead of crashing on stale data.
 */
const GUEST_STORAGE_KEY = 'novamarket.cart.v1';

/** Where the current cart lives: the local guest copy or the server. */
type CartMode = 'guest' | 'server';

/** Mongo ObjectIds are the only ids the server cart accepts. */
const MONGO_ID = /^[0-9a-fA-F]{24}$/;

export interface CartContextValue {
  items: CartItem[];
  /** Total units in the cart (sum of quantities), for the navbar badge. */
  totalItems: number;
  /** Sum of `unitPrice * quantity` across every line. */
  totalAmount: number;
  /** True while the server cart is being fetched for an authenticated user. */
  loading: boolean;
  /** Last cart failure (stock conflict, network) so the UI can report it. */
  error: string | null;
  /** Resolves true when the mutation was applied. */
  addItem: (product: Product) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  /** Sets an absolute quantity. Zero or less drops the line. */
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
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
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    // A corrupted entry is not worth a crash: start from an empty cart.
    return [];
  }
}

function writeStoredCart(items: CartItem[]): void {
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode / quota: keep the in-memory cart working.
  }
}

function clearStoredCart(): void {
  try {
    window.localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // Nothing to clean up.
  }
}

/** True when the session already has a token, even if AuthProvider is still restoring it. */
function hasStoredSession(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY));
}

function addLine(current: CartItem[], product: Product): CartItem[] {
  const productId = String(product.id);
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
}

function setLineQuantity(
  current: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  // A non-finite or zero-and-below quantity means "delete this line"; the
  // cart never keeps an empty row around.
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return current.filter((item) => item.productId !== productId);
  }
  return current.map((item) =>
    item.productId === productId ? { ...item, quantity } : item,
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'No pudimos actualizar el carrito';
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, loading: authLoading } = useAuth();

  // A restored session starts from the server cart, never from a stale guest
  // copy: that avoids a flash of local lines that are about to be merged.
  const [mode, setMode] = useState<CartMode>(() =>
    hasStoredSession() ? 'server' : 'guest',
  );
  const [items, setItems] = useState<CartItem[]>(() =>
    hasStoredSession() ? [] : readStoredCart(),
  );
  const [loading, setLoading] = useState(hasStoredSession);
  const [error, setError] = useState<string | null>(null);

  // Shared so StrictMode's double effect never merges the same guest cart twice.
  const mergePromise = useRef<Promise<void> | null>(null);

  // Switching between guest and authenticated state is a render-time
  // adjustment (no effect, no cascading render): once the session resolves,
  // the cart source changes with it.
  if (!authLoading) {
    const nextMode: CartMode = token ? 'server' : 'guest';
    if (nextMode !== mode) {
      setMode(nextMode);
      setItems(nextMode === 'guest' ? readStoredCart() : []);
      setLoading(nextMode === 'server');
    }
  }

  const isServerMode = mode === 'server';

  useEffect(() => {
    if (authLoading || mode !== 'server') return;
    let cancelled = false;

    async function syncServerCart() {
      // Best effort: a stock conflict on one line must not drop the rest.
      const guestItems = readStoredCart();
      if (guestItems.length > 0 && !mergePromise.current) {
        mergePromise.current = (async () => {
          let networkFailure = false;
          for (const item of guestItems) {
            if (!MONGO_ID.test(item.productId)) continue;
            try {
              await cartService.addToCart(item.productId, item.quantity);
            } catch (err) {
              // An ApiError means the server answered (stock, inactive
              // product): retrying cannot help. Anything else is the network,
              // so the local copy is kept for the next login.
              if (!(err instanceof ApiError)) networkFailure = true;
            }
          }
          if (!networkFailure) clearStoredCart();
        })();
      }
      if (mergePromise.current) await mergePromise.current;

      try {
        const cart = await cartService.getCart();
        if (cancelled) return;
        setItems(cart.items);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void syncServerCart();
    return () => {
      cancelled = true;
    };
  }, [mode, authLoading]);

  // Guests persist locally; the server already owns the authenticated cart.
  // Skipped while the session is still restoring: writing the empty initial
  // state would erase the guest cart before it is merged.
  useEffect(() => {
    if (authLoading || isServerMode) return;
    writeStoredCart(items);
  }, [items, authLoading, isServerMode]);

  const runServerMutation = useCallback(
    async (
      operation: () => Promise<cartService.CartSnapshot>,
    ): Promise<boolean> => {
      try {
        const cart = await operation();
        setItems(cart.items);
        setError(null);
        return true;
      } catch (err) {
        setError(errorMessage(err));
        return false;
      }
    },
    [],
  );

  const addItem = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!isServerMode) {
        setItems((current) => addLine(current, product));
        return true;
      }
      return runServerMutation(() =>
        cartService.addToCart(String(product.id), 1),
      );
    },
    [isServerMode, runServerMutation],
  );

  const removeItem = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!isServerMode) {
        setItems((current) =>
          current.filter((item) => item.productId !== productId),
        );
        return true;
      }
      return runServerMutation(() => cartService.removeCartItem(productId));
    },
    [isServerMode, runServerMutation],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      if (!isServerMode) {
        setItems((current) => setLineQuantity(current, productId, quantity));
        return true;
      }
      // PATCH requires cantidad >= 1, so an absolute zero is a delete.
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return runServerMutation(() => cartService.removeCartItem(productId));
      }
      return runServerMutation(() =>
        cartService.setCartItemQuantity(productId, quantity),
      );
    },
    [isServerMode, runServerMutation],
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!isServerMode) {
      setItems([]);
      return true;
    }
    return runServerMutation(() => cartService.clearCart());
  }, [isServerMode, runServerMutation]);

  const clearError = useCallback(() => setError(null), []);

  // Recomputed only when the line array changes: React never re-adds the
  // cart on unrelated renders (e.g. navbar badge updates).
  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    return {
      items,
      totalItems,
      totalAmount,
      loading,
      error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearError,
    };
  }, [
    items,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearError,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
