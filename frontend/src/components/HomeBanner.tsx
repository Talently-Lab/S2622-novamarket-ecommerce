import { Link } from 'react-router';
import bannerImage from '../assets/banner/banner.png';

/**
 * Home hero: real Banner.png artwork with the value proposition placed on
 * the empty left third of the image.
 *
 * Mobile stacks the copy above the artwork inside the same card (the 2:1
 * artwork is too short to overlay without colliding with the products);
 * from `md` up the copy overlays the image.
 */
export default function HomeBanner() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative overflow-hidden rounded-xl bg-fondo-superficie"
    >
      <div className="relative z-10 flex flex-col items-start gap-3 px-6 py-8 md:absolute md:inset-y-0 md:left-0 md:max-w-[42%] md:justify-center md:px-12 md:py-0">
        <h1
          id="home-hero-title"
          className="text-display font-bold text-texto-principal"
        >
          Potenciá tu setup
        </h1>
        <p className="max-w-md text-cuerpo text-texto-secundario">
          Periféricos, accesorios y gadgets al alcance de tu mano.
        </p>
        <Link
          to="/productos"
          className="mt-1 flex h-12 items-center justify-center rounded-md bg-accion-primaria px-6 text-cuerpo-boton font-semibold text-texto-sobre-accion hover:bg-accion-primaria-hover"
        >
          Ver productos
        </Link>
      </div>
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
