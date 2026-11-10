/**
 * Figma `D-Loader` (860-4709): full-screen splash shown while the home's
 * first data fetch runs (a cold Render start can take seconds). The accent
 * segment slides across the track on a seamless loop; Figma captures it as a
 * static snapshot at X=120.46.
 */
export default function InitialLoader() {
  return (
    <div
      data-testid="initial-loader"
      role="status"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-fondo-estructura"
    >
      <span className="text-display font-bold tracking-[-0.4px] text-texto-sobre-estructura">
        NovaMarket
      </span>
      <div
        data-testid="loader-track"
        className="h-1 w-[200px] overflow-hidden rounded-[2px] bg-borde-divisor-estructura"
      >
        <div
          data-testid="loader-segment"
          className="animate-loader-slide h-1 w-[80px] rounded-[2px] bg-accion-acento"
        />
      </div>
      <span className="text-cuerpo-chico text-texto-sobre-estructura-sec">
        Cargando tu tienda…
      </span>
    </div>
  );
}
