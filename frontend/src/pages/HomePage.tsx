import { useCallback, useEffect, useRef, useState } from 'react';
import HomeBanner from '../components/HomeBanner.tsx';
import HomeCategories from '../components/HomeCategories.tsx';
import HomeFeatured from '../components/HomeFeatured.tsx';
import InitialLoader from '../components/InitialLoader.tsx';

// Mini-deploy home: hero banner + categories + featured row.
// Grid per Figma `D - Home`: a 1440 frame with a 1280 content column and 80px
// side margins. The banner is full-bleed so its gradient reaches the edge,
// while its own content sits on the same 1280 column as the navbar.
//
// The Figma `D-Loader` overlay stays up until both home fetches settle; the
// children mount immediately underneath so their requests start right away.
// A load that outlives 7s (cold/dormant Render start) earns the split curtain
// exit; anything faster unmounts instantly.
const SLOW_LOAD_MS = 7_000;

export default function HomePage() {
  const [ready, setReady] = useState({ categories: false, featured: false });
  const [exiting, setExiting] = useState(false);
  // Refs keep the settle moment synchronous: the mark that completes both
  // sides decides whether the slow-load split exit starts, and later
  // idempotent re-marks can never re-trigger it after the loader is gone.
  const readyRef = useRef(ready);
  const slowRef = useRef(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    },
    [],
  );

  const mark = useCallback((side: 'categories' | 'featured') => {
    if (readyRef.current[side]) return;
    readyRef.current = { ...readyRef.current, [side]: true };
    setReady(readyRef.current);
    if (readyRef.current.categories && readyRef.current.featured) {
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      // Batched with the setReady above, so the loader never unmounts for a
      // frame before the exit animation takes over.
      if (slowRef.current) setExiting(true);
    }
  }, []);

  const markCategories = useCallback(() => mark('categories'), [mark]);
  const markFeatured = useCallback(() => mark('featured'), [mark]);

  // Arm the slow-load threshold once, measured from mount; `mark` clears it
  // when both fetches settle early so a fast load never flags slow.
  useEffect(() => {
    slowTimerRef.current = setTimeout(() => {
      slowRef.current = true;
    }, SLOW_LOAD_MS);
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  const hideExit = useCallback(() => setExiting(false), []);
  const loading = !ready.categories || !ready.featured;

  return (
    <>
      {loading || exiting ? (
        <InitialLoader
          exit={exiting ? 'split' : undefined}
          onExited={hideExit}
        />
      ) : null}
      <div className="flex flex-col gap-6 pb-20 md:gap-12 md:pb-[200px]">
        <HomeBanner />
        <div className="flex w-full justify-center px-4 md:px-20">
          <div className="flex w-full max-w-[1280px] flex-col gap-6 md:gap-12">
            <HomeCategories onSettled={markCategories} />
            <HomeFeatured onSettled={markFeatured} />
          </div>
        </div>
      </div>
    </>
  );
}
