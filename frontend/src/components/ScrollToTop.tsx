import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Resets the viewport to the top on every route change (React Router
// preserves scroll position otherwise). Instant jump on purpose: no smooth
// scrolling, so it never fights reduced-motion preferences.
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}
