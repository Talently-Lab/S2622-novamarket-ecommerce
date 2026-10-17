import { Link } from 'react-router';
import { useCategories } from '../hooks/useCategories.ts';

/**
 * Category tiles for the home. The options and their labels come from the
 * backend enum (`GET /api/formdata/products`), so a category added on the
 * backend shows up here without a code change. "Ver todo" always comes last.
 */
export default function HomeCategories() {
  const { categories } = useCategories();

  return (
    <section aria-labelledby="home-categories-title">
      <h2
        id="home-categories-title"
        className="text-titulo-3 font-bold text-texto-principal"
      >
        Categorías
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((option) => (
          <li key={option.value}>
            <Link
              to={`/productos?categoria=${option.value}`}
              className="flex min-h-11 flex-col overflow-hidden rounded-lg bg-fondo-superficie"
            >
              <span
                aria-hidden="true"
                className="block aspect-[4/3] w-full bg-fondo-deshabilitado"
              />
              <span className="block px-3 py-2 text-cuerpo-chico font-medium text-texto-secundario">
                {option.label}
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
