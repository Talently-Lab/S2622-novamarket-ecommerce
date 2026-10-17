/**
 * Category slugs accepted by the pre-load URL validation in `useProducts`.
 *
 * This is NOT the source of truth for catalog categories. The source of truth
 * is the backend (`GET /api/formdata/products`), consumed through
 * `src/hooks/useCategories.ts`, which owns the values, the labels and their
 * order.
 *
 * This list is only a hint so a deep link such as `?categoria=perifericos` is
 * accepted on the first paint instead of waiting for the unfiltered catalog to
 * arrive. A slug missing here but present in the data still resolves once the
 * catalog loads, so this list going stale is not a defect — at worst it costs
 * one extra request.
 */
export const KNOWN_CATEGORY_SLUGS = ['perifericos', 'accesorios', 'gadgets'];
