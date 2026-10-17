import { ApiError, apiFetch } from './api.ts';
import type { Product } from '../types/product.ts';

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

/**
 * Write payload for the admin product form, using the English domain names
 * of `Product`. Kept free of schema imports so the service layer stays
 * independent of the form validation layer.
 */
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

/** Request body for the write endpoints: the DTO minus its server-assigned id. */
export type BackendProductInputDto = Omit<BackendProductDto, '_id'>;

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

/**
 * Reverse of `mapProductDto`: turns a domain form value into the Spanish
 * backend body shape the write endpoints expect.
 */
export function mapProductInput(input: ProductInput): BackendProductInputDto {
  return {
    nombre: input.name,
    descripcion: input.description,
    precio: input.price,
    stock: input.stock,
    categoria: input.category,
    imagenUrl: input.imageUrl,
  };
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
 * Page size used to pull the catalog. Deliberately far larger than the whole
 * catalog so a single request usually returns everything; the page loop is
 * the guard against silent truncation if the catalog ever grows past this.
 */
const CATALOG_PAGE_SIZE = 100;

/**
 * Fetch the whole catalog from GET /api/products.
 * The backend paginates: rows live in `data.products` and `data.totalProducts`
 * carries the count for the current filters. Pages are requested with a large
 * `limit` until every row is collected, so a default-limited response can
 * never silently truncate the catalog. `data: null` means an empty result
 * (never falls back to mocks). `category` is sent as a query param and the
 * server filters it. Malformed payloads throw ApiError instead of resolving
 * as success.
 */
export async function getProductsFromApi(
  category?: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  const rows: BackendProductDto[] = [];

  for (let page = 1; ; page += 1) {
    const params = new URLSearchParams();
    params.set('limit', String(CATALOG_PAGE_SIZE));
    params.set('page', String(page));
    if (category && category.length > 0) {
      params.set('category', category);
    }

    const response = await apiFetch<ProductsResponse>(
      `/products?${params.toString()}`,
      { signal },
    );
    if (
      typeof response !== 'object' ||
      response === null ||
      !('data' in response)
    ) {
      throw new ApiError('Invalid products response');
    }
    if (response.data === null) {
      break;
    }

    const pageRows = readProductsPage(response.data);
    rows.push(...pageRows);

    // An empty page means the server has no more rows, even when
    // `totalProducts` claims otherwise — stop instead of looping forever.
    if (pageRows.length === 0) {
      break;
    }

    const { totalProducts } = response.data;
    // No usable total: trust the first page as the whole result rather than
    // looping blindly.
    if (!Number.isFinite(totalProducts)) {
      break;
    }
    if (rows.length >= totalProducts) {
      break;
    }
  }

  return rows.map(mapProductDto);
}

/**
 * Reads the flat product object out of a single-product payload and maps it
 * to the domain type. Shared by every endpoint that returns one product:
 * GET/POST/PUT `/products/:id`. A missing or malformed `data` is a contract
 * violation and throws instead of resolving as success.
 */
function readProductResponse(response: unknown): Product {
  const data =
    typeof response === 'object' && response !== null && 'data' in response
      ? (response as { data: unknown }).data
      : undefined;
  if (!isBackendProductDto(data)) {
    throw new ApiError('Invalid product response');
  }
  return mapProductDto(data);
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
  return readProductResponse(response);
}

/*
 * Week-6 API writes (POST/PUT/DELETE /products).
 *
 * These are the REAL mutations, ready to be wired in once the backend lands
 * them. Today the deployed backend product write endpoints are stubs that
 * return `successResponse(res, null, null, 200)`, so `data` is `null` and
 * calling these throws `ApiError('Invalid product response')`. That is
 * expected: the admin UI does NOT call them yet — it goes through the local
 * driver in `adminProductService` (see that file for the swap notes).
 */

/** Create a product via POST /api/products and map the created row to domain. */
export async function createProduct(input: ProductInput): Promise<Product> {
  const response = await apiFetch<ProductResponse>('/products', {
    method: 'POST',
    body: mapProductInput(input),
  });
  return readProductResponse(response);
}

/** Update a product via PUT /api/products/:id and map the row to domain. */
export async function updateProduct(
  id: string | number,
  input: ProductInput,
): Promise<Product> {
  const response = await apiFetch<ProductResponse>(
    `/products/${encodeURIComponent(String(id))}`,
    { method: 'PUT', body: mapProductInput(input) },
  );
  return readProductResponse(response);
}

/** Delete a product via DELETE /api/products/:id. The backend returns no body. */
export async function deleteProduct(id: string | number): Promise<void> {
  await apiFetch<unknown>(`/products/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  });
}
