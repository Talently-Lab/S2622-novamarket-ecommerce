import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Figma `D-Loader` (860-4709): full-screen splash shown while the home's
 * first data fetch runs (a cold Render start can take seconds). The accent
 * segment slides across the track on a seamless loop; Figma captures it as a
 * static snapshot at X=120.46.
 *
 * When the parent passes `exit="split"` (only after a slow load), the loader
 * plays a sequential curtain reveal: the accent fades while the light track
 * stretches into a full-width seam across the still-closed structure
 * background, then the two panels slide apart (top up, bottom down) before
 * `onExited` reports the finish. The slide is delayed so the seam is drawn
 * over dark before any page content is revealed — a light hairline would be
 * invisible over the revealed page.
 *
 * If the wait continues, the caption rotates through escalating patience
 * messages at 3s, 7s, 11s, and 15s, crossfading each line.
 */
// Track stretch (700ms) + seam fade (300ms) + delayed panel slide
// (1000ms delay + 700ms) + 50ms settle margin.
const EXIT_DURATION_MS = 1750;
const CAPTION_MESSAGES = [
  'Cargando tu tienda…',
  'Bajando los productos de la nube...',
  'Estamos despertando los motores...',
  'Estas cosas pasan por ahorrar en el servidor...',
  'Un poco de paciencia, lo bueno está por llegar.',
];
const CAPTION_SWAP_MS = [3_000, 7_000, 11_000, 15_000];

type Props = {
  exit?: 'split';
  onExited?: () => void;
};

export default function InitialLoader({ exit, onExited }: Props) {
  const [seamY, setSeamY] = useState<string | null>(null);
  const [captionIndex, setCaptionIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const onExitedRef = useRef(onExited);
  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  const splitting = exit === 'split';

  useEffect(() => {
    if (!splitting) return;
    const timer = setTimeout(
      () => onExitedRef.current?.(),
      EXIT_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [splitting]);

  useEffect(() => {
    const timers = CAPTION_SWAP_MS.map((delay, index) =>
      setTimeout(() => setCaptionIndex(index + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Measure before the first painted exit frame so the seam lands on the
  // bar's center and the panels never render from a 50% boundary.
  useLayoutEffect(() => {
    if (!splitting) return;
    const rect = trackRef.current?.getBoundingClientRect();
    setSeamY(
      rect && rect.height > 0 ? `${rect.top + rect.height / 2}px` : '50%',
    );
  }, [splitting]);

  return (
    <div
      data-testid="initial-loader"
      role="status"
      data-exit={splitting ? 'split' : undefined}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Curtain panels: the structure background lives here so the pair can
          slide apart on exit, splitting exactly at the measured seam. */}
      <div
        data-testid="loader-panel-top"
        className={`absolute inset-x-0 top-0 bg-fondo-estructura transition-transform duration-700 ease-in-out ${
          splitting ? 'delay-1000' : ''
        }`}
        style={{
          height: seamY ?? '50%',
          transform: splitting ? 'translateY(-100%)' : undefined,
        }}
      />
      <div
        data-testid="loader-panel-bottom"
        className={`absolute inset-x-0 bottom-0 bg-fondo-estructura transition-transform duration-700 ease-in-out ${
          splitting ? 'delay-1000' : ''
        }`}
        style={{
          top: seamY ?? '50%',
          transform: splitting ? 'translateY(100%)' : undefined,
        }}
      />
      {/* Content fades piecewise on exit: the wrapper stays opaque so the
          stretching seam track remains visible while the curtains part. */}
      <div
        data-testid="loader-content"
        className="absolute inset-0 flex flex-col items-center justify-center gap-8"
      >
        <span
          className={`text-display font-bold tracking-[-0.4px] text-texto-sobre-estructura transition-opacity duration-300 ${
            splitting ? 'opacity-0' : ''
          }`}
        >
          NovaMarket
        </span>
        <div
          ref={trackRef}
          data-testid="loader-track"
          className={`h-1 w-[200px] overflow-hidden rounded-[2px] bg-borde-divisor-estructura ${
            splitting ? 'loader-exit-track' : ''
          }`}
          style={
            splitting
              ? { width: '100%', opacity: 0 }
              : undefined
          }
        >
          <div
            data-testid="loader-segment"
            className={`h-1 w-[80px] rounded-[2px] bg-accion-acento ${
              splitting ? 'animate-none opacity-0 transition-opacity duration-200' : 'animate-loader-slide'
            }`}
          />
        </div>
        <div data-testid="loader-caption" className="grid w-full text-center">
          {CAPTION_MESSAGES.map((message, index) => (
            <span
              key={message}
              aria-hidden={index !== captionIndex}
              className={`col-start-1 row-start-1 text-cuerpo-chico text-texto-sobre-estructura-sec transition-opacity duration-300 ${
                index === captionIndex && !splitting
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            >
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
