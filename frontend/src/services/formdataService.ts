import { ApiError, apiFetch } from './api.ts';

/**
 * A product category as the backend exposes it. `value` is what must be sent
 * back (`category` query param / product payload); `label` is what the design
 * shows.
 */
export interface CategoryOption {
  value: string;
  label: string;
}

type CategoriesResponse = {
  ok: boolean;
  message: string | null;
  data: CategoryOption[] | null;
};

function isCategoryOption(value: unknown): value is CategoryOption {
  if (typeof value !== 'object' || value === null) return false;
  const option = value as Record<string, unknown>;
  return typeof option.value === 'string' && typeof option.label === 'string';
}

/**
 * Product categories from the backend enum:
 * `GET /api/formdata/products` → `getMongooseEnumOptions(Product.schema, 'categoria')`.
 * Public endpoint (no auth). The backend owns both the values and the label
 * text, so both are consumed as-is — it is the single source of truth for
 * which categories exist and how they are spelled.
 */
export async function getProductCategories(
  signal?: AbortSignal,
): Promise<CategoryOption[]> {
  const response = await apiFetch<CategoriesResponse>('/formdata/products', {
    signal,
  });
  if (
    typeof response !== 'object' ||
    response === null ||
    !('data' in response) ||
    !Array.isArray(response.data) ||
    !response.data.every(isCategoryOption)
  ) {
    throw new ApiError('Invalid categories response');
  }
  return response.data;
}
