export const RESPONSIVE_IMAGE_WIDTHS = [200, 300, 400, 600, 800];

/**
 * Builds a `srcset` for width-parameterized image URLs (e.g. Unsplash
 * `?auto=format&fit=crop&w=600&q=80`). Returns `undefined` when the URL
 * cannot be parsed or carries no `w` param, so hosts without width
 * transforms never get an invented srcset.
 */
export function buildImageSrcSet(
  url: string,
  widths: readonly number[] = RESPONSIVE_IMAGE_WIDTHS,
): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (!parsed.searchParams.has('w')) return undefined;
  return widths
    .map((width) => {
      const candidate = new URL(parsed.toString());
      candidate.searchParams.set('w', String(width));
      return `${candidate.toString()} ${width}w`;
    })
    .join(', ');
}
