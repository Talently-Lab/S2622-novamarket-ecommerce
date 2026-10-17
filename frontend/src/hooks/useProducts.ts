import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Product } from '../types/product.ts';
import { getProductsFromApi } from '../services/productService.ts';
import { KNOWN_CATEGORY_ORDER } from '../utils/categories.ts';

export interface UseProductsResult {
  products: Product[];
  categories: string[];
  /** Per-category counts plus the unfiltered total, for the filter sheet CTA. */
  counts: Record<string, number>;
  total: number;
  /** Active filter slug from `?categoria=`; '' means no filter. */
  category: string;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * API-backed catalog state (SN-249). The `?categoria=` URL param is the single
 * source of truth: writers update search params, this hook only reads them.
 * Unknown slugs are treated as no filter so bad URLs never crash or empty
 * the catalog — and the bogus param is stripped (replace) once the catalog
 * is known, so the URL never lies about the content. Every category
 * selection re-requests the service; stale
 * responses lose against the latest request id so fast filter changes cannot
 * render outdated results. Categories and counts are captured from unfiltered
 * responses only, so the filter never shrinks to the active filter — plus a
 * one-shot meta fetch so deep links still populate the filter sheet.
 */
export function useProducts(): UseProductsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get('categoria') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  // Becomes true once an unfiltered load resolves (even when empty), so a
  // bogus param is only stripped against known data — never mid-flight.
  const [metaReady, setMetaReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const requestId = useRef(0);

  // A slug is valid when it is a known canonical slug or appears in the
  // loaded catalog — so brand-new data slugs self-correct after the first
  // unfiltered load, while bogus slugs stay unfiltered.
  const category =
    rawCategory !== '' &&
    (KNOWN_CATEGORY_ORDER.includes(rawCategory) ||
      categories.includes(rawCategory))
      ? rawCategory
      : '';

  function captureMeta(items: Product[]) {
    setMetaReady(true);
    setCategories(Array.from(new Set(items.map((item) => item.category))).sort());
    const nextCounts: Record<string, number> = {};
    for (const item of items) {
      nextCounts[item.category] = (nextCounts[item.category] ?? 0) + 1;
    }
    setCounts(nextCounts);
    setTotal(items.length);
  }

  useEffect(() => {
    const controller = new AbortController();
    requestId.current += 1;
    const id = requestId.current;

    getProductsFromApi(category || undefined, controller.signal)
      .then((items) => {
        if (requestId.current !== id || controller.signal.aborted) return;
        setProducts(items);
        if (!category) {
          captureMeta(items);
        }
        // A fresh success clears a previous error (e.g. after the URL
        // changed while the error state was shown).
        setError(null);
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

  const hasFilter = category !== '';
  const metaLoaded = categories.length > 0;

  // Deep-link support: a filtered first load never sees the full catalog,
  // so fetch it once for the filter sheet meta (no loading/error coupling).
  useEffect(() => {
    if (!hasFilter || metaLoaded) return;
    const controller = new AbortController();
    getProductsFromApi(undefined, controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return;
        captureMeta(items);
      })
      .catch(() => {});
    return () => {
      controller.abort();
    };
  }, [hasFilter, metaLoaded, retryToken]);

  // Commerce rule: a slug that matches nothing is a bad URL, not an empty
  // shelf. Show the full catalog and clean the param (replace, so the back
  // button never traps the user on the stripped URL).
  useEffect(() => {
    if (!metaReady || rawCategory === '') return;
    const known =
      KNOWN_CATEGORY_ORDER.includes(rawCategory) ||
      categories.includes(rawCategory);
    if (!known) {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.delete('categoria');
          return next;
        },
        { replace: true },
      );
    }
  }, [metaReady, rawCategory, categories, setSearchParams]);

  function retry() {
    setRetryToken((token) => token + 1);
    setLoading(true);
    setError(null);
  }

  return {
    products,
    categories,
    counts,
    total,
    category,
    loading,
    error,
    retry,
  };
}
