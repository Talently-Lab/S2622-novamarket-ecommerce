/**
 * Shared display formatters.
 *
 * `formatPrice` used to live duplicated in ProductCard and HomeFeatured; the
 * admin table/list needs the same output, so it moved here to keep one
 * implementation of the `es-AR` presentation rules.
 */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}
