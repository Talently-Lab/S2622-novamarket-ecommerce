import FeaturedProducts from './FeaturedProducts.tsx';

export default function HomeFeatured({
  onSettled,
}: {
  onSettled?: () => void;
} = {}) {
  return (
    <FeaturedProducts title="Destacados" showSeeAll onSettled={onSettled} />
  );
}
