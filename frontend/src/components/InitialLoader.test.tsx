import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InitialLoader from './InitialLoader.tsx';

describe('InitialLoader', () => {
  it('covers the viewport as a status region on the structure background', () => {
    render(<InitialLoader />);

    const loader = screen.getByTestId('initial-loader');
    expect(loader).toHaveAttribute('role', 'status');
    // Full-screen opaque overlay above the static navbar (no z-index of its own).
    expect(loader).toHaveClass(
      'fixed',
      'inset-0',
      'z-50',
      'bg-fondo-estructura',
    );
    // Figma D-Loader: vertical stack, children centered, gap 32 (gap-8).
    expect(loader).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'gap-8',
    );
  });

  it('shows the Figma D-Loader copy', () => {
    render(<InitialLoader />);

    expect(screen.getByText('NovaMarket')).toBeInTheDocument();
    expect(screen.getByText('Cargando tu tienda…')).toBeInTheDocument();
  });

  it('uses the Display Bold 40/48 wordmark and 14/20 caption styles', () => {
    render(<InitialLoader />);

    expect(screen.getByText('NovaMarket')).toHaveClass(
      'text-display',
      'font-bold',
      'tracking-[-0.4px]',
    );
    expect(screen.getByText('Cargando tu tienda…')).toHaveClass(
      'text-cuerpo-chico',
    );
  });

  it('renders the 200x4 track with the sliding 80x4 accent segment', () => {
    render(<InitialLoader />);

    const track = screen.getByTestId('loader-track');
    expect(track).toHaveClass(
      'h-1',
      'w-[200px]',
      'rounded-[2px]',
      'bg-borde-divisor-estructura',
    );

    const segment = screen.getByTestId('loader-segment');
    expect(segment).toHaveClass(
      'h-1',
      'w-[80px]',
      'rounded-[2px]',
      'bg-accion-acento',
      'animate-loader-slide',
    );
    expect(track).toContainElement(segment);
  });
});
