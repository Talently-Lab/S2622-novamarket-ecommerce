import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router';
import { trackEvent } from '../analytics/trackEvent.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCategories } from '../hooks/useCategories.ts';
import Icon from './icons/Icon.tsx';

// TODO(cart): wire `count` to a real cart context once it exists.
// The default 2 mirrors the Figma badge example, it is not live data.
interface NavbarProps {
  count?: number;
}

// Selected category marker from Nav_categorias.png: orange underline.
const SELECTED_CATEGORY_CLASS =
  'underline decoration-accion-acento decoration-2 underline-offset-4';

function CartButton({ count }: { count: number }) {
  return (
    <button
      type="button"
      aria-label="Carrito"
      className="relative flex h-12 w-12 shrink-0 items-center justify-center"
    >
      <Icon name="shopping_cart" className="text-2xl text-accion-primaria" />
      <span
        aria-label={`${count} productos en el carrito`}
        className="absolute right-0 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-accion-acento px-1 text-caption-badge font-semibold text-texto-sobre-accion"
      >
        {count}
      </span>
    </button>
  );
}

function SearchForm({ id, className = '' }: { id: string; className?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No search endpoint yet — submitting navigates to the catalog.
    navigate('/productos');
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative w-full ${className}`}
    >
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar productos"
        aria-label="Buscar productos"
        className="h-12 w-full rounded-lg bg-fondo-superficie pr-12 pl-4 text-cuerpo text-texto-principal placeholder:text-texto-secundario focus:outline-2 focus:outline-borde-foco"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-texto-secundario"
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

export default function Navbar({ count = 2 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('categoria') ?? '';
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
    <header className="bg-fondo-estructura font-sans text-texto-sobre-estructura">
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
        <CartButton count={count} />
      </div>

      {/* Mobile search bar */}
      <div className="px-4 pb-4 md:hidden">
        <SearchForm id="navbar-search-mobile" />
      </div>

      {/* Desktop top bar */}
      <div className="hidden justify-center px-20 md:flex">
        <div className="flex w-full max-w-[1280px] items-center justify-between gap-8 py-4">
          <NavLink to="/" className="shrink-0 text-titulo-2 font-bold">
            NovaMarket
          </NavLink>
          <SearchForm id="navbar-search-desktop" className="w-[640px] shrink" />
          <div className="flex shrink-0 items-center gap-4">
            <SessionLinks />
            <CartButton count={count} />
          </div>
        </div>
      </div>

      {/* Divider between top bar and categories */}
      <div
        aria-hidden="true"
        className="hidden border-t border-borde-divisor-estructura md:block"
      />

      {/* Desktop category bar */}
      <nav aria-label="Categorías" className="hidden justify-center px-20 md:flex">
        <div className="flex w-full max-w-[1280px] items-center gap-8 py-6">
          <Link
            to="/productos"
            className={desktopCategoryClass('', 'text-cuerpo font-semibold')}
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

      {/* Mobile drawer: session + categories */}
      {menuOpen ? (
        <nav
          aria-label="Menú principal"
          className="border-t border-borde-divisor-estructura px-4 py-4 md:hidden"
        >
          <div className="flex flex-col items-start gap-3">
            <SessionLinks onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="mt-4 flex flex-col items-start gap-3 border-t border-borde-divisor-estructura pt-4">
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
