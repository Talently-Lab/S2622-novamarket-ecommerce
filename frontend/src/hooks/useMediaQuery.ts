import { useCallback, useSyncExternalStore } from 'react';

function canMatchMedia(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  );
}

/**
 * Tracks a CSS media query from JavaScript.
 *
 * Reads through `useSyncExternalStore` so a query change re-subscribes without
 * a synchronous `setState` inside an effect. Returns `false` when
 * `matchMedia` is unavailable (test environments, SSR), which keeps the
 * mobile-first markup as the default until a browser reports a match.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!canMatchMedia()) return () => {};

      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (!canMatchMedia()) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
