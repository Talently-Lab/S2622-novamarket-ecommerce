import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomeBanner from './HomeBanner.tsx';

describe('HomeBanner', () => {
  it('renders the hero artwork with a descriptive Spanish alt', () => {
    render(<HomeBanner />);

    const img = screen.getByRole('img', {
      name: /teclado, auriculares, parlante/i,
    });
    expect(img).toHaveAttribute('src', expect.stringContaining('banner'));
  });

  it('exposes a labelled section with the home heading', () => {
    render(<HomeBanner />);

    expect(
      screen.getByRole('heading', {
        name: /novamarket: tecnología y accesorios/i,
      }),
    ).toBeInTheDocument();
  });
});
