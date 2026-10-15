import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '../types/product.ts';
import { getProducts } from '../services/productService.ts';

export interface UseProductsResult {
  products: Product[];
  categories: string[];
  category: string;
  setCategory: (category: string) => void;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * API-backed catalog state (SN-249). Every category selection
 * re-requests the service; stale responses lose against the latest
 * request id so fast filter changes cannot render outdated results.
 * Categories are captured from unfiltered responses only, so the
 * dropdown never shrinks to the active filter.
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategoryState] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    requestId.current += 1;
    const id = requestId.current;

    getProducts(category || undefined, controller.signal)
      .then((items) => {
        if (requestId.current !== id || controller.signal.aborted) return;
        setProducts(items);
        if (!category) {
          setCategories(
            Array.from(new Set(items.map((item) => item.category))).sort(),
          );
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (requestId.current !== id || controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los productos',
        );
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [category, retryToken]);

  const setCategory = useCallback((next: string) => {
    setCategoryState(next);
    setLoading(true);
    setError(null);
  }, []);

  const retry = useCallback(() => {
    setRetryToken((token) => token + 1);
    setLoading(true);
    setError(null);
  }, []);

  return {
    products,
    categories,
    category,
    setCategory,
    loading,
    error,
    retry,
  };
}
