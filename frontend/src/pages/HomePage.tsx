import HomeBanner from '../components/HomeBanner.tsx';
import HomeCategories from '../components/HomeCategories.tsx';
import HomeFeatured from '../components/HomeFeatured.tsx';

// Mini-deploy home: hero banner + categories + featured row.
// Grid per Figma `D - Home`: a 1440 frame with a 1280 content column and 80px
// side margins. The banner is full-bleed so its gradient reaches the edge,
// while its own content sits on the same 1280 column as the navbar.
export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 pb-20 md:gap-12 md:pb-[200px]">
      <HomeBanner />
      <div className="flex w-full justify-center px-4 md:px-20">
        <div className="flex w-full max-w-[1280px] flex-col gap-6 md:gap-12">
          <HomeCategories />
          <HomeFeatured />
        </div>
      </div>
    </div>
  );
}
