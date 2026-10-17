import { getProductsFromApi, type ProductInput } from './productService.ts';
import type { Product } from '../types/product.ts';

/**
 * Local driver for the admin product panel (SN-251).
 *
 * The admin CRUD must actually work in-session for the Week-5 demo, but the
 * deployed backend write endpoints are still stubs (they return `data:null`).
 * This module keeps the catalog in a module-level store, seeds it once from
 * the real read API, and persists every mutation to localStorage, so the UI
 * behaves like a real CRUD without pretending the writes reached the server.
 *
 * Week-6 swap: once `createProduct` / `updateProduct` / `deleteProduct` in
 * `productService` persist real data, replace the bodies below with calls to
 * those functions. The exported names, signatures and domain types are
 * deliberately the same, so the admin page and its components do not change.
 */

/** localStorage key holding the JSON array of admin products. */
export const ADMIN_PRODUCTS_STORAGE_KEY = 'novamarket_admin_products';

/** Prefix that guarantees a client id can never collide with a Mongo 24-hex id. */
const LOCAL_ID_PREFIX = 'local-';

/** In-session store. `null` means "not loaded yet". */
let cachedProducts: Product[] | null = null;

/** Shared in-flight seed so concurrent first reads hit the API only once. */
let seedPromise: Promise<Product[]> | null = null;

let localIdCounter = 0;

/** Narrow an unknown value to a persisted `Product` row. */
function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    (typeof row.id === 'string' || typeof row.id === 'number') &&
    typeof row.name === 'string' &&
    typeof row.description === 'string' &&
    typeof row.price === 'number' &&
    typeof row.stock === 'number' &&
    typeof row.category === 'string' &&
    typeof row.imageUrl === 'string'
  );
}

/** Read a valid stored list, or `null` when the key is missing/corrupt. */
function readStoredProducts(): Product[] | null {
  const raw = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isProduct)) {
      return parsed;
    }
  } catch {
    // Corrupt JSON falls through to a fresh seed instead of crashing the page.
  }
  return null;
}

/** Persist the list and update the in-session cache together. */
function persist(products: Product[]): void {
  cachedProducts = products;
  localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

/**
 * Seeds a non-colliding client id. The `local-` prefix means it can never be
 * a Mongo ObjectId (24 hex chars), so locally-created rows are always
 * distinguishable from server rows.
 */
function nextLocalId(): string {
  localIdCounter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${LOCAL_ID_PREFIX}${Date.now().toString(36)}-${localIdCounter}-${random}`;
}

/**
 * Resolve the current list: cached in-session, else a previously persisted
 * list, else a fresh seed from the real read API (which is then persisted).
 * A failed fetch propagates so the page can show its error state — this
 * driver never falls back to fake data.
 */
async function ensureLoaded(signal?: AbortSignal): Promise<Product[]> {
  if (cachedProducts !== null) {
    return cachedProducts;
  }

  const stored = readStoredProducts();
  if (stored !== null) {
    cachedProducts = stored;
    return stored;
  }

  if (seedPromise === null) {
    seedPromise = getProductsFromApi(undefined, signal)
      .then((products) => {
        persist(products);
        return products;
      })
      .finally(() => {
        seedPromise = null;
      });
  }
  return seedPromise;
}

/** List every admin product, seeding from localStorage or the API on first use. */
export async function listAdminProducts(
  signal?: AbortSignal,
): Promise<Product[]> {
  const products = await ensureLoaded(signal);
  return [...products];
}

/** Create a product locally with a non-colliding client id. */
export async function createAdminProduct(
  input: ProductInput,
): Promise<Product> {
  const products = await ensureLoaded();
  const product: Product = { id: nextLocalId(), ...input };
  persist([...products, product]);
  return product;
}

/** Update a product locally by id. Throws when the id is unknown. */
export async function updateAdminProduct(
  id: string | number,
  input: ProductInput,
): Promise<Product> {
  const products = await ensureLoaded();
  const index = products.findIndex(
    (product) => String(product.id) === String(id),
  );
  if (index === -1) {
    throw new Error(`Product not found: ${String(id)}`);
  }
  const updated: Product = { id: products[index].id, ...input };
  const next = [...products];
  next[index] = updated;
  persist(next);
  return updated;
}

/** Delete a product locally by id. Idempotent, mirroring a REST DELETE. */
export async function deleteAdminProduct(id: string | number): Promise<void> {
  const products = await ensureLoaded();
  persist(products.filter((product) => String(product.id) !== String(id)));
}

/** Drop the in-session cache, any in-flight seed and the persisted list. */
export function resetAdminProducts(): void {
  cachedProducts = null;
  seedPromise = null;
  localStorage.removeItem(ADMIN_PRODUCTS_STORAGE_KEY);
}
