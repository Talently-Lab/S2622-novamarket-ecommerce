import { useCallback, useState } from 'react';
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
export default function HomePage() {
  const [ready, setReady] = useState({ categories: false, featured: false });
  // Idempotent: children may report the same side more than once (effect
  // re-runs on identity drift) without triggering a render loop.
  const markCategories = useCallback(
    () =>
      setReady((current) =>
        current.categories ? current : { ...current, categories: true },
      ),
    [],
  );
  const markFeatured = useCallback(
    () =>
      setReady((current) =>
        current.featured ? current : { ...current, featured: true },
      ),
    [],
  );
  const loading = !ready.categories || !ready.featured;

  return (
    <>
      {loading ? <InitialLoader /> : null}
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
