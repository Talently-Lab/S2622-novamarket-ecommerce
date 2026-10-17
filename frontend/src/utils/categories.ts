/**
 * Shared category catalog: slugs are the URL/data contract (`?categoria=<slug>`),
 * display names are UI-only. Canonical order is Todos first, then the known
 * slugs in screenshot order; unknown slugs append in data order so new
 * categories still appear without code changes.
 */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  perifericos: 'Periféricos',
  accesorios: 'Accesorios',
  gadgets: 'Gadgets',
};

export const KNOWN_CATEGORY_ORDER = ['perifericos', 'accesorios', 'gadgets'];

export function getCategoryDisplayName(slug: string): string {
  return CATEGORY_DISPLAY_NAMES[slug] ?? slug;
}

/**
 * Full option list for category controls. `''` means "Todos" and always
 * comes first; known slugs follow in canonical order; unknown slugs append
 * in data order.
 */
export function orderCategoryOptions(categories: string[]): string[] {
  const known = KNOWN_CATEGORY_ORDER.filter((slug) =>
    categories.includes(slug),
  );
  const unknown = categories.filter(
    (slug) => !KNOWN_CATEGORY_ORDER.includes(slug),
  );
  return ['', ...known, ...unknown];
}
