import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_IMAGE_BYTES,
  ImageUploadError,
  uploadProductImage,
  validateImageFile,
} from './cloudinaryService.ts';

function makeFile(type = 'image/png', name = 'foto.png') {
  return new File(['x'], name, { type });
}

function withSize(file: File, size: number) {
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'demo-cloud');
  vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', 'novamarket-products');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('validateImageFile', () => {
  it('accepts the formats the form advertises', () => {
    expect(validateImageFile(makeFile('image/jpeg', 'a.jpg'))).toBeNull();
    expect(validateImageFile(makeFile('image/png', 'b.png'))).toBeNull();
    expect(validateImageFile(makeFile('image/webp', 'c.webp'))).toBeNull();
  });

  it('rejects anything that is not an accepted image type', () => {
    expect(validateImageFile(makeFile('image/gif', 'd.gif'))).toBe(
      'La imagen debe ser JPG, PNG o WEBP.',
    );
    expect(validateImageFile(makeFile('application/pdf', 'e.pdf'))).toBe(
      'La imagen debe ser JPG, PNG o WEBP.',
    );
  });

  it('rejects files over the size limit', () => {
    expect(
      validateImageFile(withSize(makeFile(), MAX_IMAGE_BYTES + 1)),
    ).toBe('La imagen no puede superar los 5 MB.');
    expect(validateImageFile(withSize(makeFile(), MAX_IMAGE_BYTES))).toBeNull();
  });
});

describe('uploadProductImage', () => {
  it('posts the file and the unsigned preset to the configured cloud', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/x.png',
          public_id: 'novamarket/products/x',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const file = makeFile();
    const url = await uploadProductImage(file);

    expect(url).toBe(
      'https://res.cloudinary.com/demo-cloud/image/upload/v1/x.png',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe(
      'https://api.cloudinary.com/v1_1/demo-cloud/image/upload',
    );
    expect(init.method).toBe('POST');

    const body = init.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('file')).toBe(file);
    expect(body.get('upload_preset')).toBe('novamarket-products');
  });

  it('does not send the app auth token or a JSON content type', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ secure_url: 'https://cdn/x.png' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await uploadProductImage(makeFile());

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).toBeUndefined();
  });

  it('throws a user-facing message when Cloudinary rejects the upload', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Invalid preset' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(uploadProductImage(makeFile())).rejects.toBeInstanceOf(
      ImageUploadError,
    );
    await expect(uploadProductImage(makeFile())).rejects.toThrow(
      'No pudimos subir la imagen. Intentá de nuevo.',
    );
  });

  it('throws when the network call fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(uploadProductImage(makeFile())).rejects.toThrow(
      'No pudimos subir la imagen. Intentá de nuevo.',
    );
  });

  it('throws when the response has no secure_url', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ public_id: 'x' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(uploadProductImage(makeFile())).rejects.toThrow(
      'No pudimos subir la imagen. Intentá de nuevo.',
    );
  });

  it('fails loudly when the environment is not configured', async () => {
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', '');
    vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', '');

    await expect(uploadProductImage(makeFile())).rejects.toThrow(
      'La carga de imágenes no está configurada.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('validates before touching the network', async () => {
    await expect(
      uploadProductImage(makeFile('image/gif', 'x.gif')),
    ).rejects.toThrow('La imagen debe ser JPG, PNG o WEBP.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
