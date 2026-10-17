import { Link } from 'react-router';
import bannerImage from '../assets/banner/banner.png';

/**
 * Home hero: real Banner.png artwork with the value proposition overlaid on
 * the empty left area of the image, on every breakpoint.
 *
 * Mobile keeps the copy inside the banner too, with a smaller headline and a
 * slightly taller crop so the blurb and CTA fit over the artwork.
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
        className="h-[175px] w-full object-cover md:aspect-[1160/520] md:h-auto"
      />
      {/* Mobile only: soft white fade on the left so the copy stays legible
          over the artwork; desktop's left third is empty already. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fondo-superficie via-fondo-superficie/65 to-transparent md:hidden"
      />
      <div className="absolute inset-0 flex flex-col items-start justify-center gap-1.5 p-4 md:max-w-[42%] md:gap-3 md:px-12">
        <h1
          id="home-hero-title"
          className="text-titulo-2 font-bold text-texto-principal md:text-display"
        >
          Potenciá tu setup
        </h1>
        <p className="max-w-[80%] text-caption text-texto-secundario md:max-w-md md:text-cuerpo">
          Periféricos, accesorios y gadgets al alcance de tu mano.
        </p>
        <Link
          to="/productos"
          className="mt-0.5 flex h-9 items-center justify-center rounded-md bg-accion-primaria px-4 text-cuerpo-chico-label font-semibold text-texto-sobre-accion hover:bg-accion-primaria-hover md:mt-1 md:h-12 md:px-6 md:text-cuerpo-boton"
        >
          Ver productos
        </Link>
      </div>
    </section>
  );
}
