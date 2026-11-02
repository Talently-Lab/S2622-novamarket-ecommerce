import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@chakra-ui/react';
import CatalogFilters from '../components/CatalogFilters.tsx';
import type { CatalogFilterValues } from '../components/CatalogFilters.tsx';
import CategoryFilter from '../components/CategoryFilter.tsx';
import Icon from '../components/icons/Icon.tsx';
import ProductCard from '../components/ProductCard.tsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.tsx';
import ProductsEmptyState from '../components/ProductsEmptyState.tsx';
import { useMediaQuery } from '../hooks/useMediaQuery.ts';
import { useCategories } from '../hooks/useCategories.ts';
import { useProducts } from '../hooks/useProducts.ts';

const MOBILE_PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 8;
const SKELETON_COUNT = 8;
const PRIORITY_COUNT = 4;
const DESKTOP_QUERY = '(min-width: 1024px)';

const SORT_OPTIONS = [
  { value: '', label: 'Ordenar' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
];

// API-backed catalog (SN-249, Figma 570:4395). Desktop lays the filters out as
// a 264px rail next to a three-column grid; below lg the same fields live in
// the "Filtros" bottom sheet and the grid drops to two columns. The URL is the
// single source of truth for every filter, so deep links keep working.
// No cart wiring: cards render without onAdd by design.
export default function ProductsPage() {
  const {
    products,
    counts,
    total,
    category,
    minPrice,
    maxPrice,
    loading,
    error,
    retry,
  } = useProducts();
  const { categories: categoryOptions, labelFor } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  // Single paging cursor: below lg it grows as pages are appended, from lg
  // it selects which page is shown.
  const [page, setPage] = useState(1);

  function writeParams(update: (next: URLSearchParams) => void) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      update(next);
      return next;
    });
    setPage(1);
  }

  function handleCategoryChange(next: string) {
    writeParams((params) => {
      if (next) {
        params.set('categoria', next);
      } else {
        params.delete('categoria');
      }
    });
  }

  function handlePriceChange(nextMin?: number, nextMax?: number) {
    writeParams((params) => {
      if (nextMin === undefined) {
        params.delete('precioMin');
      } else {
        params.set('precioMin', String(nextMin));
      }
      if (nextMax === undefined) {
        params.delete('precioMax');
      } else {
        params.set('precioMax', String(nextMax));
      }
    });
  }

  function handleFiltersApply(values: CatalogFilterValues) {
    writeParams((params) => {
      if (values.category) {
        params.set('categoria', values.category);
      } else {
        params.delete('categoria');
      }
      if (values.minPrice === undefined) {
        params.delete('precioMin');
      } else {
        params.set('precioMin', String(values.minPrice));
      }
      if (values.maxPrice === undefined) {
        params.delete('precioMax');
      } else {
        params.set('precioMax', String(values.maxPrice));
      }
    });
  }

  function handleSortChange(next: string) {
    writeParams((params) => {
      if (next) {
        params.set('orden', next);
      } else {
        params.delete('orden');
      }
    });
  }

  function clearFilter() {
    setSearchParams({});
    setPage(1);
  }

  const pageSize = isDesktop ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = isDesktop
    ? products.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : products.slice(0, currentPage * pageSize);
  const hasMore = currentPage < totalPages;
  const countLabel =
    products.length === 1 ? '1 producto' : `${products.length} productos`;
  const title = category ? labelFor(category) : 'Todos los productos';
  const sortParam = searchParams.get('orden') ?? '';

  const sortSelect = (
    <div className="relative w-full lg:w-[160px]">
      <select
        aria-label="Ordenar"
        value={sortParam}
        onChange={(event) => handleSortChange(event.target.value)}
        className="border-borde-divisor bg-fondo-superficie text-cuerpo-boton text-texto-principal h-12 w-full appearance-none rounded-md border pr-10 pl-4 font-semibold"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value || 'default'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="text-texto-principal pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
      />
    </div>
  );

  return (
    <main className="flex w-full justify-center px-4 py-8 md:px-20">
      <div className="w-full max-w-[1280px]">
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

        <div className="mt-6 flex gap-4">
          {/* Desktop filter rail (Figma 264px). */}
          {isDesktop ? (
            <aside className="w-[264px] shrink-0 py-4 pr-6 pl-4">
              <CatalogFilters
                name="category-filter-rail"
                options={categoryOptions}
                category={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategoryChange={handleCategoryChange}
                onPriceChange={handlePriceChange}
              />
            </aside>
          ) : null}

          <section className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-12">
              <div>
                <h1 className="text-titulo-2 text-texto-principal font-bold">
                  {title}
                </h1>
                <p
                  aria-live="polite"
                  className="text-cuerpo text-texto-principal mt-1"
                >
                  {loading ? 'Cargando productos…' : countLabel}
                </p>
              </div>
              {isDesktop ? sortSelect : null}
            </div>

            {/* Mobile toolbar: Filtros + Ordenar, as in the 390 frame. */}
            {isDesktop ? null : (
              <div className="mt-4 flex gap-2">
                <CategoryFilter
                  options={categoryOptions}
                  value={category}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChange={handleFiltersApply}
                  counts={counts}
                  total={total}
                />
                {sortSelect}
              </div>
            )}

            {loading ? (
              <div
                aria-busy="true"
                className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6"
              >
                {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div
                role="alert"
                className="border-borde-error bg-fondo-superficie mt-6 flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center"
              >
                <p className="text-titulo-3 text-texto-principal font-bold">
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
                  title={`No hay productos en ${labelFor(category)}`}
                  description="Por ahora no tenemos nada acá. Mirá el resto del catálogo."
                  action={{
                    label: 'Ver todos los productos',
                    onAction: clearFilter,
                  }}
                />
              ) : (
                <ProductsEmptyState
                  title="No hay productos disponibles"
                  description="Vuelve a intentarlo más tarde."
                />
              )
            ) : (
              <>
                <ul
                  // Remounting on page change replays the fade-in entrance.
                  key={isDesktop ? `desktop-page-${currentPage}` : 'catalog'}
                  className="animate-fade-in mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6"
                >
                  {visible.map((product, index) => (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        priority={index < PRIORITY_COUNT}
                      />
                    </li>
                  ))}
                </ul>
                {!isDesktop && hasMore ? (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Cargar más
                    </Button>
                  </div>
                ) : null}
                {isDesktop && totalPages > 1 ? (
                  <nav
                    aria-label="Paginación"
                    className="mt-8 flex justify-end"
                  >
                    <ul className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNumber = index + 1;
                        const isActive = pageNumber === currentPage;
                        return (
                          <li key={pageNumber}>
                            <button
                              type="button"
                              aria-label={`Página ${pageNumber}`}
                              aria-current={isActive ? 'page' : undefined}
                              onClick={() => setPage(pageNumber)}
                              className={
                                isActive
                                  ? 'border-fondo-estructura bg-fondo-estructura text-cuerpo-boton text-texto-sobre-estructura flex h-11 w-11 items-center justify-center rounded-md border font-semibold'
                                  : 'border-borde-divisor bg-fondo-superficie text-cuerpo-boton text-texto-principal hover:border-texto-secundario flex h-11 w-11 items-center justify-center rounded-md border font-semibold'
                              }
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      })}
                      {hasMore ? (
                        <li>
                          <button
                            type="button"
                            aria-label="Página siguiente"
                            onClick={() => setPage(currentPage + 1)}
                            className="border-borde-divisor bg-fondo-superficie text-texto-principal hover:border-texto-secundario flex h-11 w-11 items-center justify-center rounded-md border"
                          >
                            <Icon name="chevron_right" />
                          </button>
                        </li>
                      ) : null}
                    </ul>
                  </nav>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
