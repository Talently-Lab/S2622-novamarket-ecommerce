import { describe, expect, it } from 'vitest';
import redirects from '../../public/_redirects?raw';

describe('SPA fallback deployment config', () => {
  it('ships exactly one non-forced Netlify rewrite to index.html', () => {
    const rules = redirects
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    expect(rules).toHaveLength(1);

    const [rule] = rules;
    expect(rule).not.toContain('!');
    expect(rule.split(/\s+/)).toEqual(['/*', '/index.html', '200']);
  });
});
