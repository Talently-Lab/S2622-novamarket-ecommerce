import { useEffect, useRef, useState } from 'react';

/**
 * Short-lived "added" confirmation for a product card CTA: marks one product
 * id, then clears it so the button returns to its idle label. Kept in a hook
 * because both the catalog grid and the featured rows need the same timing.
 */
export function useAddedFeedback(durationMs = 2000) {
  const [addedId, setAddedId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function markAdded(id: string) {
    setAddedId(id);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAddedId(null), durationMs);
  }

  return { addedId, markAdded };
}
