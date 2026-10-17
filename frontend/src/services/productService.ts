import { ApiError, apiFetch } from './api.ts';
import type { Product } from '../types/product.ts';
import { products as mockProducts } from '../mocks/products.ts';

/**
 * Backend product DTO (Mongo + Spanish field names, observed contract).
 * `descripcion` and `imagenUrl` are optional: the backend model does not
 * mark them `required`, so a payload missing either one must still be
 * accepted instead of invalidating the whole page.
 */
export interface BackendProductDto {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl?: string;
}

/**
 * `GET /api/products` returns a page: `data.products` holds the rows and
 * `data.totalProducts` the count for the current filters.
 */
type ProductsResponse = {
  ok: boolean;
  message: string | null;
  data: { products: BackendProductDto[]; totalProducts: number } | null;
};

/** `GET /api/products/:id` returns the product flat inside `data`. */
type ProductResponse = {
  ok: boolean;
  message: string | null;
  data: BackendProductDto | null;
};

function isBackendProductDto(value: unknown): value is BackendProductDto {
  if (typeof value !== 'object' || value === null) return false;
  const dto = value as Record<string, unknown>;
  return (
    typeof dto._id === 'string' &&
    typeof dto.nombre === 'string' &&
    typeof dto.precio === 'number' &&
    typeof dto.stock === 'number' &&
    typeof dto.categoria === 'string'
  );
}

function mapProductDto(dto: BackendProductDto): Product {
  return {
    id: dto._id,
    name: dto.nombre,
    description: dto.descripcion ?? '',
    price: dto.precio,
    stock: dto.stock,
    category: dto.categoria,
    imageUrl: dto.imagenUrl ?? '',
  };
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
}

/**
 * Reads `data.products` out of a page payload. Anything else — a missing
 * `products` key, a non-array, or a malformed row — is a contract
 * violation and throws instead of resolving as success.
 */
function readProductsPage(data: unknown): BackendProductDto[] {
  const products =
    typeof data === 'object' && data !== null && 'products' in data
      ? (data as { products: unknown }).products
      : undefined;
  if (!Array.isArray(products) || !products.every(isBackendProductDto)) {
    throw new ApiError('Invalid products response');
  }
  return products;
}

/**
 * Temporary active catalog source: user-provided CSV fixture (T1a).
 * No API request is made; `category` is filtered locally.
 * Switch back to getProductsFromApi once the backend catalog is live.
 */
export async function getProducts(
  category?: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  throwIfAborted(signal);
  if (category && category.length > 0) {
    return mockProducts.filter((product) => product.category === category);
  }
  return [...mockProducts];
}

/**
 * Fetch the catalog from GET /api/products.
 * The backend paginates: rows live in `data.products`. `data: null` means
 * an empty result (never falls back to mocks).
 * `category` is sent as a query param and re-applied client-side as a
 * safety net — the server-side filter has not been verified yet. Malformed
 * payloads throw ApiError instead of resolving as success.
 */
export async function getProductsFromApi(
  category?: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  const path =
    category && category.length > 0
      ? `/products?category=${encodeURIComponent(category)}`
      : '/products';
  const response = await apiFetch<ProductsResponse>(path, { signal });
  if (
    typeof response !== 'object' ||
    response === null ||
    !('data' in response)
  ) {
    throw new ApiError('Invalid products response');
  }
  if (response.data === null) return [];
  const mapped = readProductsPage(response.data).map(mapProductDto);
  if (category && category.length > 0) {
    return mapped.filter((product) => product.category === category);
  }
  return mapped;
}

/**
 * Fetch a single product from GET /api/products/:id.
 * Here `data` is the product object itself, not a `products` page.
 * A missing product surfaces as the ApiError thrown by `apiFetch` (404).
 */
export async function getProductById(
  id: string,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await apiFetch<ProductResponse>(
    `/products/${encodeURIComponent(id)}`,
    { signal },
  );
  if (
    typeof response !== 'object' ||
    response === null ||
    !('data' in response) ||
    !isBackendProductDto(response.data)
  ) {
    throw new ApiError('Invalid product response');
  }
  return mapProductDto(response.data);
}
