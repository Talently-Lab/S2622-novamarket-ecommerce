import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api.ts';
import { getProductCategories } from './formdataService.ts';

vi.mock('./api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api.ts')>();
  return { ...actual, apiFetch: vi.fn() };
});

const mockedApiFetch = vi.mocked(apiFetch);

function envelope(data: unknown) {
  return { ok: true, message: 'Categorías de productos', data };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('formdataService.getProductCategories', () => {
  it('returns the value/label options exactly as the backend sends them', async () => {
    mockedApiFetch.mockResolvedValueOnce(
      envelope([
        { value: 'accesorios', label: 'Accesorios' },
        { value: 'perifericos', label: 'Perifericos' },
        { value: 'gadgets', label: 'Gadgets' },
      ]),
    );

    const options = await getProductCategories();

    expect(mockedApiFetch).toHaveBeenCalledWith('/formdata/products', {
      signal: undefined,
    });
    expect(options).toEqual([
      { value: 'accesorios', label: 'Accesorios' },
      { value: 'perifericos', label: 'Perifericos' },
      { value: 'gadgets', label: 'Gadgets' },
    ]);
    // The label text belongs to the backend, accents included (or not).
    expect(options[1].label).toBe('Perifericos');
  });

  it('throws ApiError when data is null', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope(null));

    const error = await getProductCategories().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
  });

  it('throws ApiError when an option is missing its label', async () => {
    mockedApiFetch.mockResolvedValueOnce(envelope([{ value: 'gadgets' }]));

    const error = await getProductCategories().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
  });

  it('propagates a failed HTTP response', async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError('Server error', 500));

    const error = await getProductCategories().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
  });
});
