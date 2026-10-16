import { ApiError, apiFetch } from './api.ts';
import type { Product } from '../types/product.ts';
import { products as mockProducts } from '../mocks/products.ts';

/** Backend product DTO (Mongo + Spanish field names, observed contract). */
export interface BackendProductDto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagenUrl: string;
}

type ProductsResponse = {
  ok: boolean;
  message: string | null;
  data: BackendProductDto[] | null;
};

function isBackendProductDto(value: unknown): value is BackendProductDto {
  if (typeof value !== 'object' || value === null) return false;
  const dto = value as Record<string, unknown>;
  return (
    typeof dto._id === 'string' &&
    typeof dto.nombre === 'string' &&
    typeof dto.descripcion === 'string' &&
    typeof dto.precio === 'number' &&
    typeof dto.stock === 'number' &&
    typeof dto.categoria === 'string' &&
    typeof dto.imagenUrl === 'string'
  );
}

function mapProductDto(dto: BackendProductDto): Product {
  return {
    id: dto._id,
    name: dto.nombre,
    description: dto.descripcion,
    price: dto.precio,
    stock: dto.stock,
    category: dto.categoria,
    imageUrl: dto.imagenUrl,
  };
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
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
 * `data: null` means an empty result (never falls back to mocks).
 * `categoria` is sent as a query param and re-applied client-side,
 * because the current backend ignores the query. Malformed payloads
 * throw ApiError instead of resolving as success.
 */
export async function getProductsFromApi(
  category?: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  const path =
    category && category.length > 0
      ? `/products?categoria=${encodeURIComponent(category)}`
      : '/products';
  const response = await apiFetch<ProductsResponse>(path, { signal });
  if (
    typeof response !== 'object' ||
    response === null ||
    !('data' in response)
  ) {
    throw new ApiError('Invalid products response');
  }
  const { data } = response;
  if (data === null) return [];
  if (!Array.isArray(data) || !data.every(isBackendProductDto)) {
    throw new ApiError('Invalid products response');
  }
  const mapped = data.map(mapProductDto);
  if (category && category.length > 0) {
    return mapped.filter((product) => product.category === category);
  }
  return mapped;
}
