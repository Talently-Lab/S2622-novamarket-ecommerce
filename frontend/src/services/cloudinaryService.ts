/**
 * Browser-side upload to Cloudinary through an unsigned preset.
 *
 * This deliberately bypasses `apiFetch`: that client injects our JWT and JSON
 * headers, while Cloudinary only understands a bare multipart body. The preset
 * fixes the destination folder and generates an unguessable public id, so the
 * returned `secure_url` can be persisted as the product image.
 */

/** Cloudinary upload limits are plan-based; this is our product rule. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type AcceptedType = (typeof ACCEPTED_TYPES)[number];

const UPLOAD_ERROR_MESSAGE = 'No pudimos subir la imagen. Intentá de nuevo.';
const MISSING_CONFIG_MESSAGE =
  'La carga de imágenes no está configurada.';

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

interface CloudinaryResponse {
  secure_url?: unknown;
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

function readConfig(): CloudinaryConfig {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
    | string
    | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
    | string
    | undefined;

  if (!cloudName || !uploadPreset) {
    throw new ImageUploadError(MISSING_CONFIG_MESSAGE);
  }

  return { cloudName, uploadPreset };
}

/** Returns a user-facing message, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type as AcceptedType)) {
    return 'La imagen debe ser JPG, PNG o WEBP.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'La imagen no puede superar los 5 MB.';
  }
  return null;
}

/** Uploads one image and resolves with its persisted public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw new ImageUploadError(invalid);

  const { cloudName, uploadPreset } = readConfig();

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset);

  let response: Response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body },
    );
  } catch {
    throw new ImageUploadError(UPLOAD_ERROR_MESSAGE);
  }

  const payload = (await response
    .json()
    .catch(() => null)) as CloudinaryResponse | null;

  if (!response.ok) throw new ImageUploadError(UPLOAD_ERROR_MESSAGE);

  const secureUrl = payload?.secure_url;
  if (typeof secureUrl !== 'string' || secureUrl === '') {
    throw new ImageUploadError(UPLOAD_ERROR_MESSAGE);
  }

  return secureUrl;
}
