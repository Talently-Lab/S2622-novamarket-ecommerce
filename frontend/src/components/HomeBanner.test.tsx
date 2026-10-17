import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import HomeBanner from './HomeBanner.tsx';

describe('HomeBanner', () => {
  it('renders the hero artwork with a descriptive Spanish alt', () => {
    render(<HomeBanner />, { wrapper: MemoryRouter });

    const img = screen.getByRole('img', {
      name: /teclado, auriculares, parlante/i,
    });
    expect(img).toHaveAttribute('src', expect.stringContaining('banner'));
  });

  it('shows the value proposition as the home heading', () => {
    render(<HomeBanner />, { wrapper: MemoryRouter });

    expect(
      screen.getByRole('heading', { name: /potenciá tu setup/i }),
    ).toBeInTheDocument();
  });

  it('links the call to action to the catalog', () => {
    render(<HomeBanner />, { wrapper: MemoryRouter });

    expect(
      screen.getByRole('link', { name: /ver productos/i }),
    ).toHaveAttribute('href', '/productos');
  });
});
