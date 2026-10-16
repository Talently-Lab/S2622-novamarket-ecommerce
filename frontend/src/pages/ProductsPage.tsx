import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import CategoryFilter from '../components/CategoryFilter.tsx';
import ProductCard from '../components/ProductCard.tsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.tsx';
import ProductsEmptyState from '../components/ProductsEmptyState.tsx';
import { useProducts } from '../hooks/useProducts.ts';

const PAGE_SIZE = 8;
const SKELETON_COUNT = 8;
const PRIORITY_COUNT = 4;

// Display names for the real category slugs in MOCK_DATA.csv.
// Unknown slugs fall back to the raw value so new categories still read.
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  accesorios: 'Accesorios',
  perifericos: 'Periféricos',
  gadgets: 'Gadgets',
};

// API-backed catalog (SN-249, Figma 212:1259). Mobile-first grid with
// 2 columns from mobile; "Cargar más" paginates client-side over the
// received set and resets on every filter change. No cart wiring:
// cards render without onAdd by design.
export default function ProductsPage() {
  const {
    products,
    categories,
    counts,
    total,
    category,
    setCategory,
    loading,
    error,
    retry,
  } = useProducts();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function handleCategoryChange(next: string) {
    setCategory(next);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const countLabel =
    products.length === 1 ? '1 producto' : `${products.length} productos`;
  const title = category
    ? (CATEGORY_DISPLAY_NAMES[category] ?? category)
    : 'Todos los productos';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Miga de pan">
        <ol className="flex items-center gap-1">
          <li>
            <a
              href="/"
              className="text-caption text-texto-secundario underline"
            >
              Inicio
            </a>
          </li>
          <li
            aria-hidden="true"
            className="text-caption text-texto-secundario"
          >
            /
          </li>
          <li>
            <span
              aria-current="page"
              className="text-caption text-texto-secundario underline"
            >
              {title}
            </span>
          </li>
        </ol>
      </nav>
      <div className="mt-4">
        <h1 className="text-titulo-2 font-bold text-texto-principal">
          {title}
        </h1>
        <p
          aria-live="polite"
          className="mt-1 text-cuerpo text-texto-principal"
        >
          {loading ? 'Cargando productos…' : countLabel}
        </p>
      </div>
      <div className="mt-4">
        <CategoryFilter
          categories={categories}
          value={category}
          onChange={handleCategoryChange}
          counts={counts}
          total={total}
        />
      </div>

      {loading ? (
        <div
          aria-busy="true"
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-borde-error bg-fondo-superficie px-6 py-12 text-center"
        >
          <p className="text-titulo-3 font-bold text-texto-principal">
            No se pudieron cargar los productos
          </p>
          <p className="text-cuerpo-chico text-texto-error">{error}</p>
          <Button variant="primary" onClick={retry}>
            Reintentar
          </Button>
        </div>
      ) : products.length === 0 ? (
        category ? (
          <ProductsEmptyState
            title="Sin resultados"
            description="No hay productos en esta categoría."
          />
        ) : (
          <ProductsEmptyState
            title="No hay productos disponibles"
            description="Vuelve a intentarlo más tarde."
          />
        )
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {visible.map((product, index) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  priority={index < PRIORITY_COUNT}
                />
              </li>
            ))}
          </ul>
          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="primary"
                onClick={() =>
                  setVisibleCount((count) => count + PAGE_SIZE)
                }
              >
                Cargar más
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
