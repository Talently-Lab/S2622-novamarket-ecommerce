import { describe, expect, it } from 'vitest';
import {
  buildImageSrcSet,
  RESPONSIVE_IMAGE_WIDTHS,
} from './responsiveImage.ts';

const BASE_URL =
  'https://images.unsplash.com/photo-123?auto=format&fit=crop&w=600&q=80';

describe('buildImageSrcSet', () => {
  it('replaces w per width while preserving the other params', () => {
    const srcSet = buildImageSrcSet(BASE_URL);

    expect(srcSet).toBeDefined();
    const entries = srcSet!.split(', ');
    expect(entries).toHaveLength(RESPONSIVE_IMAGE_WIDTHS.length);
    for (const [index, width] of RESPONSIVE_IMAGE_WIDTHS.entries()) {
      const parsed = new URL(entries[index].replace(` ${width}w`, ''));
      expect(entries[index].endsWith(` ${width}w`)).toBe(true);
      expect(parsed.searchParams.get('w')).toBe(String(width));
      expect(parsed.searchParams.get('auto')).toBe('format');
      expect(parsed.searchParams.get('fit')).toBe('crop');
      expect(parsed.searchParams.get('q')).toBe('80');
    }
  });

  it('respects a custom widths list', () => {
    expect(buildImageSrcSet(BASE_URL, [200, 400])).toBe(
      'https://images.unsplash.com/photo-123?auto=format&fit=crop&w=200&q=80 200w, ' +
        'https://images.unsplash.com/photo-123?auto=format&fit=crop&w=400&q=80 400w',
    );
  });

  it('returns undefined when the URL has no w param', () => {
    expect(
      buildImageSrcSet('https://placehold.co/600x400/png?text=Test'),
    ).toBeUndefined();
  });

  it('returns undefined for an unparsable URL', () => {
    expect(buildImageSrcSet('not a url')).toBeUndefined();
  });
});
