import { Link } from 'react-router';
import { CATEGORY_DISPLAY_NAMES } from '../utils/categories.ts';

// Category tiles for the home mini-deploy: the three canonical slugs
// plus a "Ver todo" tile. Slugs stay in sync with categories.ts.
const HOME_CATEGORY_SLUGS = ['perifericos', 'accesorios', 'gadgets'] as const;

export default function HomeCategories() {
  return (
    <section aria-labelledby="home-categories-title">
      <h2
        id="home-categories-title"
        className="text-titulo-3 font-bold text-texto-principal"
      >
        Categorías
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {HOME_CATEGORY_SLUGS.map((slug) => (
          <li key={slug}>
            <Link
              to={`/productos?categoria=${slug}`}
              className="flex min-h-11 flex-col overflow-hidden rounded-lg bg-fondo-superficie"
            >
              <span
                aria-hidden="true"
                className="block aspect-[4/3] w-full bg-fondo-deshabilitado"
              />
              <span className="block px-3 py-2 text-cuerpo-chico font-medium text-texto-secundario">
                {CATEGORY_DISPLAY_NAMES[slug]}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/productos"
            className="flex min-h-11 flex-col overflow-hidden rounded-lg bg-fondo-superficie"
          >
            <span
              aria-hidden="true"
              className="block aspect-[4/3] w-full bg-fondo-deshabilitado"
            />
            <span className="block px-3 py-2 text-cuerpo-chico font-medium text-texto-secundario">
              Ver todo
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
