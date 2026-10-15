import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProductCardSkeleton from './ProductCardSkeleton.tsx';

describe('ProductCardSkeleton', () => {
  it('announces loading with an accessible status label', () => {
    render(<ProductCardSkeleton />);

    const status = screen.getByRole('status', {
      name: 'Cargando producto',
    });
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('Cargando producto');
  });

  it('supports a custom label', () => {
    render(<ProductCardSkeleton label="Cargando catálogo" />);

    expect(
      screen.getByRole('status', { name: 'Cargando catálogo' }),
    ).toBeInTheDocument();
  });

  it('exposes no interactive state', () => {
    render(<ProductCardSkeleton />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
