import { describe, expect, it } from 'vitest';
import {
  CATEGORY_DISPLAY_NAMES,
  KNOWN_CATEGORY_ORDER,
  getCategoryDisplayName,
  orderCategoryOptions,
} from './categories.ts';

describe('categories util', () => {
  it('maps the known slugs to their Spanish display names', () => {
    expect(CATEGORY_DISPLAY_NAMES).toEqual({
      perifericos: 'Periféricos',
      accesorios: 'Accesorios',
      gadgets: 'Gadgets',
    });
  });

  it('falls back to the raw slug for unknown categories', () => {
    expect(getCategoryDisplayName('novedades')).toBe('novedades');
    expect(getCategoryDisplayName('gadgets')).toBe('Gadgets');
  });

  it('orders Todos first, known slugs canonically, unknowns in data order', () => {
    expect(
      orderCategoryOptions(['novedades', 'gadgets', 'accesorios', 'ofertas']),
    ).toEqual(['', 'accesorios', 'gadgets', 'novedades', 'ofertas']);
  });

  it('keeps the canonical screenshot order regardless of data order', () => {
    expect(KNOWN_CATEGORY_ORDER.map(getCategoryDisplayName)).toEqual([
      'Periféricos',
      'Accesorios',
      'Gadgets',
    ]);
    expect(
      orderCategoryOptions(['gadgets', 'perifericos', 'accesorios']),
    ).toEqual(['', 'perifericos', 'accesorios', 'gadgets']);
  });
});
