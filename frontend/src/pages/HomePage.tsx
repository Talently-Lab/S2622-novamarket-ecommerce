import HomeBanner from '../components/HomeBanner.tsx';
import HomeCategories from '../components/HomeCategories.tsx';
import HomeFeatured from '../components/HomeFeatured.tsx';

// Mini-deploy home: hero banner + categories + featured row.
export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 bg-fondo-pagina px-4 py-6">
      <HomeBanner />
      <HomeCategories />
      <HomeFeatured />
    </div>
  );
}
