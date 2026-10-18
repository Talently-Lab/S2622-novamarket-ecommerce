import { useEffect, useState } from 'react';
import { getProductCategories } from '../services/formdataService.ts';
import type { CategoryOption } from '../services/formdataService.ts';

export type CategoriesStatus = 'loading' | 'ready' | 'error';

export interface UseCategoriesResult {
  categories: CategoryOption[];
  status: CategoriesStatus;
  /** Display label for a category value, from the backend options. */
  labelFor: (value: string) => string;
}

/**
 * Mirrors the backend's own label rule (see `getMongooseEnumOptions`:
 * capitalize, `-`/`_` → space). Used only until the request lands — without it
 * the text would flip from "Periféricos" to "Perifericos" once options arrive.
 */
function fallbackLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/[-_]/g, ' ');
}

/**
 * Loads the product categories from `GET /api/formdata/products`.
 * The options are already ordered by the backend enum, so they are used as-is.
 */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [status, setStatus] = useState<CategoriesStatus>('loading');

  useEffect(() => {
    const controller = new AbortController();
    getProductCategories(controller.signal)
      .then((options) => {
        setCategories(options);
        setStatus('ready');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setStatus('error');
      });
    return () => controller.abort();
  }, []);

  function labelFor(value: string): string {
    return (
      categories.find((option) => option.value === value)?.label ??
      fallbackLabel(value)
    );
  }

  return { categories, status, labelFor };
}
