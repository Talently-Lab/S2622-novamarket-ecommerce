import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@chakra-ui/react';
import ConfirmDialog from '../../components/admin/ConfirmDialog.tsx';
import {
  ProductsList,
  ProductsTable,
} from '../../components/admin/ProductsTable.tsx';
import Icon from '../../components/icons/Icon.tsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';
import {
  deleteAdminProduct,
  listAdminProducts,
} from '../../services/adminProductService.ts';
import type { Product } from '../../types/product.ts';
import {
  getCategoryDisplayName,
  orderCategoryOptions,
} from '../../utils/categories.ts';

const DESKTOP_QUERY = '(min-width: 1024px)';
const PAGE_SIZE = 8;

type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * Admin products section (SN-251). Desktop renders the dark-header table with
 * numbered pagination; mobile renders stacked rows with "Cargar más". The
 * breakpoint is decided in JS so only one of the two views is ever mounted.
 */
export default function AdminProductsPage() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const navigate = useNavigate();

  const [reloadToken, setReloadToken] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminProducts()
      .then((rows) => {
        if (cancelled) return;
        setProducts(rows);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const categoryOptions = useMemo(
    () => orderCategoryOptions(products.map((product) => product.category)),
    [products],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(term);
      const matchesCategory = category === '' || product.category === category;
      return matchesName && matchesCategory;
    });
  }, [products, query, category]);

  // Both cursors restart when the filters change, so the visible window always
  // belongs to the current result set.
  function resetCursors() {
    setPage(1);
    setVisibleCount(PAGE_SIZE);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = isDesktop
    ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filtered.slice(0, visibleCount);
  const shownCount = isDesktop
    ? Math.min(currentPage * PAGE_SIZE, filtered.length)
    : visibleProducts.length;

  const requestDelete = useCallback((product: Product) => {
    setDeleteError(null);
    setPendingDelete(product);
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setIsDeleting(true);
    try {
      await deleteAdminProduct(target.id);
      setProducts((current) =>
        current.filter((product) => String(product.id) !== String(target.id)),
      );
      setPendingDelete(null);
    } catch {
      setPendingDelete(null);
      setDeleteError('No se pudo eliminar el producto. Intentá de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-titulo-2 font-bold text-texto-principal">
          Productos
          {isDesktop && status === 'ready' ? (
            <span className="text-titulo-3 font-normal text-texto-secundario">
              {' '}
              ({filtered.length})
            </span>
          ) : null}
        </h1>
        {/* Inline width: the Chakra button recipe pins width to 240px in a
            later cascade layer, so a Tailwind utility would lose. */}
        <Button
          variant="primary"
          onClick={() => navigate('/admin/productos/nuevo')}
          style={{ width: 'auto' }}
        >
          <Icon name="add" className="mr-2 text-xl" />
          {isDesktop ? 'Nuevo producto' : 'Nuevo'}
        </Button>
      </header>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar por nombre</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xl text-texto-secundario"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetCursors();
            }}
            placeholder="Buscar por nombre"
            className="h-12 w-full rounded-md border border-borde-divisor bg-fondo-superficie pr-4 pl-11 text-cuerpo text-texto-principal placeholder:text-texto-secundario focus:outline-2 focus:outline-borde-foco"
          />
        </label>
        {isDesktop ? (
          <label className="relative md:w-64">
            <span className="sr-only">Filtrar por categoría</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                resetCursors();
              }}
              className="h-12 w-full appearance-none rounded-md border border-borde-divisor bg-fondo-superficie pr-10 pl-4 text-cuerpo text-texto-principal focus:outline-2 focus:outline-borde-foco"
            >
              {categoryOptions.map((slug) => (
                <option key={slug === '' ? 'all' : slug} value={slug}>
                  {slug === ''
                    ? 'Todas las categorías'
                    : getCategoryDisplayName(slug)}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xl text-texto-principal"
            />
          </label>
        ) : null}
      </div>

      {deleteError ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-borde-error px-4 py-3 text-cuerpo-chico text-texto-error"
        >
          {deleteError}
        </p>
      ) : null}

      <div className="mt-6">
        {status === 'loading' ? (
          <p className="text-cuerpo text-texto-secundario">
            Cargando productos…
          </p>
        ) : null}

        {status === 'error' ? (
          <div className="rounded-lg border border-borde-divisor bg-fondo-superficie p-6">
            <p className="text-cuerpo text-texto-principal">
              No pudimos cargar los productos.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              style={{ width: 'auto' }}
              onClick={() => {
                setStatus('loading');
                setReloadToken((token) => token + 1);
              }}
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        {status === 'ready' && products.length === 0 ? (
          <p className="text-cuerpo text-texto-secundario">
            Todavía no hay productos cargados.
          </p>
        ) : null}

        {status === 'ready' &&
        products.length > 0 &&
        filtered.length === 0 ? (
          <p className="text-cuerpo text-texto-secundario">
            No encontramos productos con esos filtros.
          </p>
        ) : null}

        {status === 'ready' && filtered.length > 0 ? (
          isDesktop ? (
            <ProductsTable
              products={visibleProducts}
              onEdit={(product) =>
                navigate(`/admin/productos/${String(product.id)}/editar`)
              }
              onDelete={requestDelete}
            />
          ) : (
            <ProductsList
              products={visibleProducts}
              onEdit={(product) =>
                navigate(`/admin/productos/${String(product.id)}/editar`)
              }
              onDelete={requestDelete}
            />
          )
        ) : null}
      </div>

      {status === 'ready' && filtered.length > 0 ? (
        <div className="mt-6">
          {isDesktop ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-cuerpo-chico text-texto-secundario">
                Mostrando {shownCount} de {filtered.length}
              </p>
              <nav
                aria-label="Paginación de productos"
                className="flex items-center gap-2"
              >
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-label={`Página ${pageNumber}`}
                      aria-current={
                        pageNumber === currentPage ? 'page' : undefined
                      }
                      className={`h-10 w-10 rounded-md text-cuerpo-boton font-semibold ${
                        pageNumber === currentPage
                          ? 'bg-fondo-estructura text-texto-sobre-estructura'
                          : 'border border-borde-divisor bg-fondo-superficie text-texto-principal'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPage(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages}
                  aria-label="Página siguiente"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-borde-divisor bg-fondo-superficie text-texto-principal disabled:opacity-40"
                >
                  <Icon name="chevron_right" className="text-xl" />
                </button>
              </nav>
            </div>
          ) : visibleCount < filtered.length ? (
            <Button
              variant="secondary"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              style={{ width: '100%' }}
            >
              Cargar más
            </Button>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar producto"
        description={
          pendingDelete
            ? `¿Seguro que querés eliminar «${pendingDelete.name}»? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        isConfirming={isDeleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (isDeleting) return;
          setPendingDelete(null);
        }}
      />
    </>
  );
}
