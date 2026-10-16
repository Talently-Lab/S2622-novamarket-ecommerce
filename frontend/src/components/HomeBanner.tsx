import bannerImage from '../assets/banner/banner.png';

// Home hero: real Banner.png artwork full-width, no overlaid text
// (the artwork itself carries no text).
export default function HomeBanner() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="overflow-hidden rounded-xl bg-fondo-superficie"
    >
      <h1 id="home-hero-title" className="sr-only">
        NovaMarket: tecnología y accesorios
      </h1>
      <img
        src={bannerImage}
        alt="Teclado, auriculares, parlante, batería externa, mouse y audífonos inalámbricos sobre pedestales claros"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="aspect-[2/1] w-full object-cover"
      />
    </section>
  );
}
