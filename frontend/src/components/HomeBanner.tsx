import { Link } from 'react-router';
import bannerImage from '../assets/banner/banner.png';

/**
 * Home hero: real Banner.png artwork with the value proposition.
 *
 * Mobile puts the artwork on top and the copy below inside the same card,
 * matching the image-over-text pattern used by the rest of the home
 * (categories and featured). From `md` up the copy overlays the empty left
 * third of the artwork.
 */
export default function HomeBanner() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative overflow-hidden rounded-xl bg-fondo-superficie"
    >
      <img
        src={bannerImage}
        alt="Teclado, auriculares, parlante, batería externa, mouse y audífonos inalámbricos sobre pedestales claros"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="aspect-[2/1] w-full object-cover"
      />
      <div className="flex flex-col items-start gap-3 p-6 md:absolute md:inset-y-0 md:left-0 md:max-w-[42%] md:justify-center md:px-12 md:py-0">
        <h1
          id="home-hero-title"
          className="text-titulo-1 font-bold text-texto-principal md:text-display"
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
    </section>
  );
}
