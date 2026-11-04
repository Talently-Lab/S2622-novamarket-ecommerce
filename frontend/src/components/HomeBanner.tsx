import { Link } from 'react-router';
import bannerImage from '../assets/banner/banner-tech.png';

// Figma `D - Home` › `Banner` (desktop 622:4867, mobile 623:4886).
// The gradient is a one-off hero surface, not part of the token palette.
const BANNER_SURFACE =
  'bg-[linear-gradient(180deg,#C9CCD1_0%,#F1F4F5_70%,#E2E0E5_100%)]';

/**
 * Home hero: copy column plus the transparent product shot, per the Figma
 * banner. Both breakpoints share the markup; below md the artwork is
 * absolutely positioned so it overlaps the copy column like the mobile frame,
 * and the two-column row only starts at md.
 */
export default function HomeBanner() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className={`w-full ${BANNER_SURFACE}`}
    >
      <div className="flex w-full justify-center px-4 md:px-20">
        <div className="relative flex h-[200px] w-full max-w-[1280px] items-center md:h-[520px] md:items-end md:justify-center md:gap-[120px] md:py-4">
          <div className="relative z-10 flex w-[181px] flex-col gap-4 md:w-auto md:gap-6 md:pb-16">
            <div className="flex flex-col gap-1 md:gap-4">
              <h1
                id="home-hero-title"
                className="text-titulo-3 md:text-display font-bold text-black"
              >
                Potenciá tu setup
              </h1>
              <p className="text-caption md:text-cuerpo text-black md:w-[247px]">
                Periféricos, accesorios y gadgets al alcance de tu mano.
              </p>
            </div>
            <Link
              to="/productos"
              className="bg-accion-primaria text-cuerpo-boton text-texto-sobre-accion hover:bg-accion-primaria-hover flex h-10 w-fit items-center justify-center rounded-md px-4 font-semibold md:h-12 md:w-[240px]"
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
            className="pointer-events-none absolute top-2 right-0 h-[184px] w-[220px] object-contain md:static md:h-[472px] md:w-[632px] md:shrink-0"
          />
        </div>
      </div>
    </section>
  );
}
