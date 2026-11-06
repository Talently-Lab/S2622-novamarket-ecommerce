import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { trackEvent } from '../analytics/trackEvent.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useCategories } from '../hooks/useCategories.ts';
import Icon from './icons/Icon.tsx';

// Selected category marker from Nav_categorias.png: orange underline.
const SELECTED_CATEGORY_CLASS =
  'font-semibold underline decoration-accion-acento decoration-2 underline-offset-4';

function CartButton() {
  const { totalItems } = useCart();
  const label = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en el carrito`;

  return (
    <Link
      to="/carrito"
      aria-label="Carrito"
      className="relative flex h-12 w-12 shrink-0 items-center justify-center"
    >
      <Icon name="shopping_cart" className="text-accion-primaria text-2xl" />
      {/* Figma paints the count in the navbar blue over the orange accent,
          not in white like the other action surfaces. */}
      {totalItems > 0 ? (
        <span
          aria-label={label}
          className="bg-accion-acento text-caption-badge text-texto-principal absolute top-1 right-0 flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-semibold"
        >
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}

function SearchForm({
  id,
  className = '',
}: {
  id: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('buscar') ?? '';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const field = event.currentTarget.elements.namedItem('buscar');
    const term = field instanceof HTMLInputElement ? field.value.trim() : '';
    // A new search starts from the whole catalog: previous filters are
    // dropped instead of narrowing the term to whatever was selected.
    navigate(
      term === ''
        ? '/productos'
        : `/productos?buscar=${encodeURIComponent(term)}`,
    );
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative w-full ${className}`}
    >
      <input
        // Remounts when the URL term changes, so the input always mirrors
        // the catalog search on deep links, back/forward and after a clear.
        key={urlQuery}
        id={id}
        name="buscar"
        type="search"
        defaultValue={urlQuery}
        placeholder="Buscar productos"
        aria-label="Buscar productos"
        className="bg-fondo-superficie text-cuerpo text-texto-principal placeholder:text-texto-secundario focus:outline-borde-foco h-12 w-full rounded-lg pr-12 pl-4 focus:outline-2"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="text-texto-secundario absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
      >
        <Icon name="search" className="text-xl" />
      </button>
    </form>
  );
}

function SessionLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    logout();
    onNavigate?.();
    navigate('/');
  }

  // Keep the header layout stable while the session restores.
  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <NavLink
        to="/login"
        onClick={onNavigate}
        aria-label="Ingresar a tu cuenta"
        className="text-cuerpo-boton font-semibold hover:underline"
      >
        Ingresar
      </NavLink>
    );
  }

  return (
    <>
      {user.role === 'admin' ? (
        <NavLink
          to="/admin"
          onClick={onNavigate}
          className="text-cuerpo-boton font-semibold hover:underline"
        >
          Admin
        </NavLink>
      ) : null}
      <span className="text-cuerpo">Hola, {user.name}</span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-cuerpo-boton font-semibold hover:underline"
      >
        Cerrar sesión
      </button>
    </>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const activeCategory = searchParams.get('categoria') ?? '';
  // Figma only renders the category bar on the home page. Everywhere else the
  // categories are reached through the catalog filters or the mobile drawer, so
  // repeating them under the navbar would duplicate the control.
  const showCategoryBar = pathname === '/';
  // Category names come from the backend enum, not from a local map.
  const { categories: categoryOptions } = useCategories();

  // Mirrors useProducts: bogus slugs mean "no filter", so Todos is selected.
  function isSelected(slug: string) {
    if (slug === '') {
      return (
        activeCategory === '' ||
        !categoryOptions.some((option) => option.value === activeCategory)
      );
    }
    return activeCategory === slug;
  }

  function desktopCategoryClass(slug: string, base: string) {
    return `${base} ${isSelected(slug) ? SELECTED_CATEGORY_CLASS : 'hover:underline'}`;
  }

  return (
    <header className="bg-fondo-estructura text-texto-sobre-estructura font-sans">
      {/* Mobile top bar */}
      <div className="flex h-16 items-center justify-between px-4 md:hidden">
        <button
          type="button"
          aria-label="Menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-12 w-12 items-center justify-center"
        >
          <Icon name="menu" className="text-2xl" />
        </button>
        <NavLink to="/" className="text-titulo-3 font-bold">
          NovaMarket
        </NavLink>
        <CartButton />
      </div>

      {/* Mobile search bar */}
      <div className="px-4 pb-4 md:hidden">
        <SearchForm id="navbar-search-mobile" />
      </div>

      {/* Desktop top bar */}
      <div className="hidden justify-center px-20 md:flex">
        <div className="flex w-full max-w-[1280px] items-center justify-between gap-8 py-4">
          <NavLink to="/" className="text-titulo-2 shrink-0 font-bold">
            NovaMarket
          </NavLink>
          <SearchForm
            id="navbar-search-desktop"
            className="max-w-[640px] shrink"
          />
          <div className="flex shrink-0 items-center gap-4">
            <SessionLinks />
            <CartButton />
          </div>
        </div>
      </div>

      {showCategoryBar ? (
        <>
          {/* Divider between top bar and categories */}
          <div
            aria-hidden="true"
            className="border-borde-divisor-estructura hidden border-t md:block"
          />

          {/* Desktop category bar */}
          <nav
            aria-label="Categorías"
            className="hidden justify-center px-20 md:flex"
          >
            <div className="flex w-full max-w-[1280px] items-center gap-6 py-3">
              <Link
                to="/productos"
                className={desktopCategoryClass('', 'text-cuerpo')}
              >
                Todos
              </Link>
              {categoryOptions.map((option) => (
                <Link
                  key={option.value}
                  to={`/productos?categoria=${option.value}`}
                  onClick={() =>
                    trackEvent('select_category', {
                      categoria: option.value,
                      origen: 'filtro',
                    })
                  }
                  className={desktopCategoryClass(option.value, 'text-cuerpo')}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      ) : null}

      {/* Mobile drawer: session + categories */}
      {menuOpen ? (
        <nav
          aria-label="Menú principal"
          className="border-borde-divisor-estructura border-t px-4 py-4 md:hidden"
        >
          <div className="flex flex-col items-start gap-3">
            <SessionLinks onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="border-borde-divisor-estructura mt-4 flex flex-col items-start gap-3 border-t pt-4">
            <Link
              to="/productos"
              onClick={() => setMenuOpen(false)}
              className={`text-cuerpo font-semibold ${isSelected('') ? SELECTED_CATEGORY_CLASS : ''}`}
            >
              Todos
            </Link>
            {categoryOptions.map((option) => (
              <Link
                key={option.value}
                to={`/productos?categoria=${option.value}`}
                onClick={() => {
                  setMenuOpen(false);
                  trackEvent('select_category', {
                    categoria: option.value,
                    origen: 'filtro',
                  });
                }}
                className={`text-cuerpo ${isSelected(option.value) ? SELECTED_CATEGORY_CLASS : ''}`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
