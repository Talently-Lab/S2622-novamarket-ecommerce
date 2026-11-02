import { Link } from 'react-router';
import { useCategories } from '../hooks/useCategories.ts';
import Icon from './icons/Icon.tsx';
import accesoriosImage from '../assets/categories/accesorios.jpg';
import gadgetsImage from '../assets/categories/gadgets.jpg';
import perifericosImage from '../assets/categories/perifericos.jpg';

/**
 * Figma `D - Home` › `Section_categorias` pins one photo per category, but the
 * backend enum (`GET /api/formdata/products`) carries no image. The artwork is
 * mapped here by slug; a category added later renders with the flat
 * placeholder instead of a broken image.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  accesorios: accesoriosImage,
  gadgets: gadgetsImage,
  perifericos: perifericosImage,
};

/**
 * Category tiles for the home. Options and labels come from the backend enum,
 * so a category added on the backend shows up here without a code change.
 * "Ver todo" always comes last.
 *
 * Below md it is a horizontal strip (Figma mobile 110px tiles); from md the
 * tiles are 240px and the row is centred on the content column.
 */
export default function HomeCategories() {
  const { categories } = useCategories();

  return (
    <section aria-labelledby="home-categories-title">
      <h2
        id="home-categories-title"
        className="text-titulo-3 text-texto-principal font-bold"
      >
        Categorías
      </h2>
      <ul className="mt-4 flex [scrollbar-width:none] gap-3 overflow-x-auto md:justify-center md:gap-6 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {categories.map((option) => {
          const image = CATEGORY_IMAGES[option.value];

          return (
            <li key={option.value} className="shrink-0">
              <Link
                to={`/productos?categoria=${option.value}`}
                className="flex w-[110px] flex-col items-center gap-4 md:w-[240px]"
              >
                {image ? (
                  <img
                    src={image}
                    // The label right below already names the category.
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-[110px] w-[110px] rounded-xl object-cover md:h-[240px] md:w-[240px]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="bg-fondo-deshabilitado block h-[110px] w-[110px] rounded-xl md:h-[240px] md:w-[240px]"
                  />
                )}
                <span className="text-cuerpo-boton text-texto-secundario md:text-titulo-3 text-center font-semibold md:font-bold">
                  {option.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <Link
            to="/productos"
            className="flex w-[110px] flex-col items-center gap-4 md:w-[240px]"
          >
            {/* Figma paints "Ver todo" as a flat tile with an outward arrow
                instead of a photo. */}
            <span className="flex h-[110px] w-[110px] items-center justify-center rounded-xl bg-[#EDF0F5] md:h-[240px] md:w-[240px]">
              <Icon
                name="arrow_outward"
                className="text-accion-primaria text-[32px]! md:text-[40px]!"
              />
            </span>
            <span className="text-cuerpo-boton text-texto-secundario md:text-titulo-3 text-center font-semibold md:font-bold">
              Ver todo
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
