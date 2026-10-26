/**
 * Single entry point for every analytics event in the frontend.
 *
 * TODO: send the event to the real destination (likely Google Analytics) once
 * the analytics provider is defined. No external library is installed yet.
 */
export function trackEvent(
  nombre: string,
  parametros?: Record<string, unknown>,
): void {
  console.log('[evento]', nombre, parametros);
}
