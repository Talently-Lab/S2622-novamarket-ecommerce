import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api.ts';
import { getProductsFromApi, type ProductInput } from './productService.ts';
import type { Product } from '../types/product.ts';
import {
  ADMIN_PRODUCTS_STORAGE_KEY,
  createAdminProduct,
  deleteAdminProduct,
  listAdminProducts,
  resetAdminProducts,
  updateAdminProduct,
} from './adminProductService.ts';

vi.mock('./productService.ts', () => ({
  getProductsFromApi: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProductsFromApi);

/** A domain product as it would come back from the real read API. */
function apiProduct(index: number): Product {
  return {
    id: `mongo-id-${index}`,
    name: `Producto ${index}`,
    description: `Descripcion ${index}`,
    price: 1000 * index,
    stock: 10,
    category: 'accesorios',
    imageUrl: `https://example.com/producto-${index}.png`,
  };
}

/** A valid form value on its way to the write layer (domain field names). */
function input(overrides: Partial<ProductInput> = {}): ProductInput {
  return {
    name: 'Teclado NovaType K7',
    description: 'Teclado mecánico 75%',
    price: 45999.9,
    stock: 24,
    category: 'perifericos',
    imageUrl: 'https://example.com/k7.png',
    ...overrides,
  };
}

/** Parse the persisted admin list straight out of localStorage. */
function storedProducts(): Product[] {
  const raw = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
  return raw === null ? [] : (JSON.parse(raw) as Product[]);
}

beforeEach(() => {
  // Reset implementations too, so a test that forgets to stub the API can
  // never inherit a previous test's resolved value.
  vi.resetAllMocks();
  localStorage.clear();
  resetAdminProducts();
});

describe('adminProductService', () => {
  it('seeds from the read API on first use and persists the result', async () => {
    mockedGetProducts.mockResolvedValueOnce([apiProduct(1), apiProduct(2)]);

    const products = await listAdminProducts();

    expect(products).toEqual([apiProduct(1), apiProduct(2)]);
    expect(mockedGetProducts).toHaveBeenCalledTimes(1);
    expect(storedProducts()).toEqual([apiProduct(1), apiProduct(2)]);
  });

  it('fetches the catalog only once across concurrent first reads', async () => {
    mockedGetProducts.mockResolvedValue([apiProduct(1)]);

    const [first, second] = await Promise.all([
      listAdminProducts(),
      listAdminProducts(),
    ]);

    expect(first).toEqual(second);
    expect(mockedGetProducts).toHaveBeenCalledTimes(1);
  });

  it('reads a valid stored list without touching the API', async () => {
    const stored = [apiProduct(7)];
    localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(stored));
    mockedGetProducts.mockRejectedValue(new Error('the API must not be called'));

    const products = await listAdminProducts();

    expect(products).toEqual(stored);
    expect(mockedGetProducts).not.toHaveBeenCalled();
  });

  it('re-seeds from the API when the stored value is corrupt', async () => {
    localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, '{not valid json');
    mockedGetProducts.mockResolvedValueOnce([apiProduct(3)]);

    const products = await listAdminProducts();

    expect(products).toEqual([apiProduct(3)]);
    expect(mockedGetProducts).toHaveBeenCalledTimes(1);
    expect(storedProducts()).toEqual([apiProduct(3)]);
  });

  it('propagates a seed failure and persists nothing (no fake fallback)', async () => {
    mockedGetProducts.mockRejectedValueOnce(new ApiError('catálogo caído'));

    await expect(listAdminProducts()).rejects.toBeInstanceOf(ApiError);
    expect(localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY)).toBeNull();
  });

  it('creates a product with a non-Mongo id and persists it', async () => {
    mockedGetProducts.mockResolvedValueOnce([]);

    const created = await createAdminProduct(input());

    // The local- prefix can never be a 24-hex Mongo ObjectId.
    expect(String(created.id)).toMatch(/^local-/);
    expect(String(created.id)).not.toMatch(/^[0-9a-f]{24}$/i);
    expect(created).toMatchObject({
      name: 'Teclado NovaType K7',
      price: 45999.9,
      stock: 24,
      category: 'perifericos',
    });

    const list = await listAdminProducts();
    expect(list).toContainEqual(created);
    expect(storedProducts()).toContainEqual(created);
  });

  it('gives every locally created product a distinct id', async () => {
    mockedGetProducts.mockResolvedValueOnce([]);

    const first = await createAdminProduct(input());
    const second = await createAdminProduct(input());

    expect(first.id).not.toBe(second.id);
  });

  it('updates a product by id and persists the change', async () => {
    mockedGetProducts.mockResolvedValueOnce([apiProduct(1)]);

    const updated = await updateAdminProduct(
      'mongo-id-1',
      input({ name: 'Renombrado' }),
    );

    expect(updated).toMatchObject({ id: 'mongo-id-1', name: 'Renombrado' });
    expect(storedProducts()).toEqual([updated]);
  });

  it('throws when updating an unknown id', async () => {
    mockedGetProducts.mockResolvedValueOnce([apiProduct(1)]);

    await expect(updateAdminProduct('missing', input())).rejects.toThrow(
      /not found/i,
    );
  });

  it('deletes a product by id and persists the removal', async () => {
    mockedGetProducts.mockResolvedValueOnce([apiProduct(1), apiProduct(2)]);

    await deleteAdminProduct('mongo-id-1');

    const list = await listAdminProducts();
    expect(list.map((product) => product.id)).toEqual(['mongo-id-2']);
    expect(storedProducts().map((product) => product.id)).toEqual([
      'mongo-id-2',
    ]);
  });

  it('deletes idempotently, mirroring a REST DELETE', async () => {
    mockedGetProducts.mockResolvedValueOnce([apiProduct(1)]);

    await deleteAdminProduct('never-existed');

    expect(storedProducts()).toEqual([apiProduct(1)]);
  });

  it('resetAdminProducts clears the cache and the stored list', async () => {
    mockedGetProducts.mockResolvedValueOnce([apiProduct(1)]);
    await listAdminProducts();

    resetAdminProducts();

    expect(localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY)).toBeNull();

    mockedGetProducts.mockResolvedValueOnce([apiProduct(2)]);
    expect(await listAdminProducts()).toEqual([apiProduct(2)]);
  });
});
