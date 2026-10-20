import { describe, expect, it } from 'vitest';
import { formatPrice } from './format.ts';

describe('formatPrice', () => {
  it('uses the es-AR grouping and drops decimals', () => {
    expect(formatPrice(38900)).toBe('$38.900');
    expect(formatPrice(1000)).toBe('$1.000');
    expect(formatPrice(0)).toBe('$0');
  });

  it('rounds fractional prices to whole pesos', () => {
    expect(formatPrice(45999.9)).toBe('$46.000');
  });
});
