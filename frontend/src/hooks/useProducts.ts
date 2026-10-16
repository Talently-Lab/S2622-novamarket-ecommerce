import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '../types/product.ts';
import { getProducts } from '../services/productService.ts';

export interface UseProductsResult {
  products: Product[];
  categories: string[];
  /** Per-category counts plus the unfiltered total, for the filter sheet CTA. */
  counts: Record<string, number>;
  total: number;
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
 * Categories and counts are captured from unfiltered responses only, so the
 * filter never shrinks to the active filter.
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
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
          const nextCounts: Record<string, number> = {};
          for (const item of items) {
            nextCounts[item.category] = (nextCounts[item.category] ?? 0) + 1;
          }
          setCounts(nextCounts);
          setTotal(items.length);
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
    counts,
    total,
    category,
    setCategory,
    loading,
    error,
    retry,
  };
}
