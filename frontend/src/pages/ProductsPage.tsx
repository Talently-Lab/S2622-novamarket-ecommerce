import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@chakra-ui/react';
import CategoryFilter from '../components/CategoryFilter.tsx';
import Icon from '../components/icons/Icon.tsx';
import ProductCard from '../components/ProductCard.tsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.tsx';
import ProductsEmptyState from '../components/ProductsEmptyState.tsx';
import { useMediaQuery } from '../hooks/useMediaQuery.ts';
import { useProducts } from '../hooks/useProducts.ts';
import { getCategoryDisplayName } from '../utils/categories.ts';

const MOBILE_PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 8;
const SKELETON_COUNT = 8;
const PRIORITY_COUNT = 4;
const DESKTOP_QUERY = '(min-width: 1024px)';

// API-backed catalog (SN-249, Figma 212:1259). Mobile-first grid with
// 2 columns from mobile. Below lg the catalog grows with a secondary
// "Cargar más" ten at a time; from lg it shows one page of 8 at a time
// (two full rows of four) with a numbered paginator aligned to the right.
// Paging resets on every filter change.
// No cart wiring: cards render without onAdd by design.
export default function ProductsPage() {
  const {
    products,
    categories,
    counts,
    total,
    category,
    loading,
    error,
    retry,
  } = useProducts();
  const [, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  // Single paging cursor: below lg it grows as pages are appended, from lg
  // it selects which page is shown.
  const [page, setPage] = useState(1);

  function handleCategoryChange(next: string) {
    // The URL param is the single source of truth; the hook picks it up.
    setSearchParams(next ? { categoria: next } : {});
    setPage(1);
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
  const title = category ? getCategoryDisplayName(category) : 'Todos los productos';

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
      {/* Mobile-only: the navbar category bar owns md+. */}
      <div className="mt-4 md:hidden">
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
            title={`No hay productos en ${getCategoryDisplayName(category)}`}
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
                            ? 'flex h-11 w-11 items-center justify-center rounded-md border border-fondo-estructura bg-fondo-estructura text-cuerpo-boton font-semibold text-texto-sobre-estructura'
                            : 'flex h-11 w-11 items-center justify-center rounded-md border border-borde-divisor bg-fondo-superficie text-cuerpo-boton font-semibold text-texto-principal hover:border-texto-secundario'
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
                      className="flex h-11 w-11 items-center justify-center rounded-md border border-borde-divisor bg-fondo-superficie text-texto-principal hover:border-texto-secundario"
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
    </main>
  );
}
