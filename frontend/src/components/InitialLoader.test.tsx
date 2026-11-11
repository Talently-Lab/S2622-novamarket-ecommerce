import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InitialLoader from './InitialLoader.tsx';

describe('InitialLoader', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('covers the viewport as a status region on the structure background', () => {
    render(<InitialLoader />);

    const loader = screen.getByTestId('initial-loader');
    expect(loader).toHaveAttribute('role', 'status');
    // Full-screen opaque overlay above the static navbar (no z-index of its
    // own). The background now lives on the two curtain panels so they can
    // slide apart on exit.
    expect(loader).toHaveClass('fixed', 'inset-0', 'z-50', 'overflow-hidden');
    // Figma D-Loader: vertical stack, children centered, gap 32 (gap-8).
    expect(screen.getByTestId('loader-content')).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'gap-8',
    );
    expect(screen.getByTestId('loader-panel-top')).toHaveClass(
      'bg-fondo-estructura',
    );
    expect(screen.getByTestId('loader-panel-bottom')).toHaveClass(
      'bg-fondo-estructura',
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

  it('stays static without an exit prop', async () => {
    const onExited = vi.fn();
    render(<InitialLoader onExited={onExited} />);

    const loader = screen.getByTestId('initial-loader');
    expect(loader).not.toHaveAttribute('data-exit');
    expect(screen.getByTestId('loader-track')).toHaveClass('w-[200px]');
    expect(screen.getByTestId('loader-track')).not.toHaveStyle({
      width: '100%',
    });
    // Static state keeps the copy fully visible.
    expect(screen.getByText('NovaMarket')).not.toHaveClass('opacity-0');
    expect(screen.getByText('Cargando tu tienda…')).not.toHaveClass(
      'opacity-0',
    );

    await new Promise((resolve) => setTimeout(resolve, 900));
    expect(onExited).not.toHaveBeenCalled();
  });

  it('rotates the caption through patience messages as the wait stretches', () => {
    vi.useFakeTimers();
    render(<InitialLoader />);

    // 0–3s: the Figma copy holds; the next line waits in the wings.
    expect(screen.getByText('Cargando tu tienda…')).toHaveClass('opacity-100');
    expect(screen.getByText('Bajando los productos de la nube...')).toHaveClass(
      'opacity-0',
    );
    expect(
      screen.getByText('Bajando los productos de la nube...'),
    ).toHaveAttribute('aria-hidden', 'true');

    // 3–7s: the first patience line crossfades in over the old one.
    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.getByText('Cargando tu tienda…')).toHaveClass('opacity-0');
    expect(screen.getByText('Bajando los productos de la nube...')).toHaveClass(
      'opacity-100',
      'transition-opacity',
      'duration-300',
    );

    // 7–11s.
    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(
      screen.getByText('Estamos despertando los motores...'),
    ).toHaveClass('opacity-100');

    // 11–15s.
    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(
      screen.getByText('Estas cosas pasan por ahorrar en el servidor...'),
    ).toHaveClass('opacity-100');

    // +15s: the last line stays put.
    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(
      screen.getByText('Un poco de paciencia, lo bueno está por llegar.'),
    ).toHaveClass('opacity-100');
    expect(
      screen.getByText('Estas cosas pasan por ahorrar en el servidor...'),
    ).toHaveClass('opacity-0');
  });


  it('splits into two curtain panels and reports when the exit finished', async () => {
    const onExited = vi.fn();
    render(<InitialLoader exit="split" onExited={onExited} />);

    const loader = screen.getByTestId('initial-loader');
    expect(loader).toHaveAttribute('data-exit', 'split');

    // The accent segment fades out and the light track stretches into the
    // seam line that partitions the two panels.
    expect(screen.getByTestId('loader-segment')).toHaveClass(
      'opacity-0',
      'animate-none',
    );
    expect(screen.getByTestId('loader-track')).toHaveStyle({
      width: '100%',
      opacity: '0',
    });

    // The wordmark and caption fade individually. The content wrapper must
    // NOT fade as a group: its opacity would hide the stretched seam track
    // before the curtain finishes parting.
    expect(screen.getByTestId('loader-content')).not.toHaveClass('opacity-0');
    expect(screen.getByText('NovaMarket')).toHaveClass(
      'opacity-0',
      'transition-opacity',
      'duration-300',
    );
    expect(screen.getByText('Cargando tu tienda…')).toHaveClass(
      'opacity-0',
      'transition-opacity',
      'duration-300',
    );

    // Curtain reveal: the panels hold closed while the track stretches
    // and fades (delayed slide), then part — top upward, bottom downward.
    expect(screen.getByTestId('loader-panel-top')).toHaveClass(
      'delay-1000',
      'transition-transform',
    );
    expect(screen.getByTestId('loader-panel-bottom')).toHaveClass(
      'delay-1000',
      'transition-transform',
    );
    expect(screen.getByTestId('loader-panel-top')).toHaveStyle({
      transform: 'translateY(-100%)',
    });
    expect(screen.getByTestId('loader-panel-bottom')).toHaveStyle({
      transform: 'translateY(100%)',
    });

    await waitFor(() => expect(onExited).toHaveBeenCalledTimes(1), {
      timeout: 4000,
    });
  });
});
