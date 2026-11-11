import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
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
const MOBILE_CATEGORY_ORDER = ['perifericos', 'accesorios', 'gadgets'];

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

function SessionLinks({
  onNavigate,
  mobile = false,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
}) {
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
    if (mobile) {
      return (
        <div className="bg-fondo-deshabilitado flex min-h-[112px] flex-col justify-center gap-4 px-4 py-4">
          <p className="text-cuerpo-chico text-texto-secundario m-0">
            Ingresá para ver tus pedidos
          </p>
          <div className="flex gap-2">
            <NavLink
              to="/login"
              onClick={onNavigate}
              className="bg-accion-primaria text-texto-sobre-accion flex h-11 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold"
            >
              Ingresar
            </NavLink>
            <NavLink
              to="/registro"
              onClick={onNavigate}
              className="border-borde-input bg-fondo-superficie text-texto-principal flex h-11 flex-1 items-center justify-center rounded-md border px-3 text-sm font-semibold"
            >
              Crear cuenta
            </NavLink>
          </div>
        </div>
      );
    }

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

  if (mobile) {
    return (
      <div className="bg-fondo-deshabilitado flex flex-col gap-3 px-4 py-4">
        <span className="text-cuerpo-chico text-texto-secundario">
          Hola, {user.name}
        </span>
        {user.role === 'admin' ? (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className="text-cuerpo-boton font-semibold hover:underline"
          >
            Admin
          </NavLink>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="text-cuerpo-boton w-fit font-semibold hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
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
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="flex h-12 w-12 cursor-pointer items-center justify-center"
      >
        <Icon name="logout" className="text-xl" />
      </button>
    </>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDivElement>(null);
  const wasMenuOpen = useRef(false);
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const activeCategory = searchParams.get('categoria') ?? '';
  // Figma only renders the category bar on the home page. Everywhere else the
  // categories are reached through the catalog filters or the mobile drawer, so
  // repeating them under the navbar would duplicate the control.
  const showCategoryBar = pathname === '/';
  // Category names come from the backend enum, not from a local map.
  const { categories: categoryOptions } = useCategories();
  const mobileCategoryOptions = [...categoryOptions].sort((left, right) => {
    const leftOrder = MOBILE_CATEGORY_ORDER.indexOf(left.value);
    const rightOrder = MOBILE_CATEGORY_ORDER.indexOf(right.value);
    return (
      (leftOrder === -1 ? MOBILE_CATEGORY_ORDER.length : leftOrder) -
      (rightOrder === -1 ? MOBILE_CATEGORY_ORDER.length : rightOrder)
    );
  });

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

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (menuOpen) {
      wasMenuOpen.current = true;
      menuCloseRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    if (wasMenuOpen.current) {
      wasMenuOpen.current = false;
      menuButtonRef.current?.focus();
    }
  }, [menuOpen]);

  function handleMobileMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = menuDialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <header className="bg-fondo-estructura text-texto-sobre-estructura font-sans">
      {/* Mobile top bar */}
      <div className="flex h-16 items-center justify-between px-4 md:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Menú"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
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

      {/* Full-screen mobile menu, matching Figma `Menú abierto` (236:1455). */}
      {menuOpen ? (
        <div
          ref={menuDialogRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
          tabIndex={-1}
          onKeyDown={handleMobileMenuKeyDown}
          className="bg-fondo-superficie text-texto-principal fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-y-auto md:hidden"
        >
          <header className="bg-fondo-pagina flex h-[60px] shrink-0 items-center justify-between px-4">
            <NavLink
              to="/"
              onClick={closeMenu}
              className="text-titulo-3 text-texto-principal font-bold"
            >
              NovaMarket
            </NavLink>
            <button
              ref={menuCloseRef}
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMenu}
              className="focus-visible:outline-borde-foco flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Icon name="close" className="text-texto-principal text-2xl" />
            </button>
          </header>

          <SessionLinks mobile onNavigate={closeMenu} />

          <nav
            aria-label="Categorías del menú"
            className="border-borde-divisor flex shrink-0 flex-col border-b px-4 pt-6 pb-6"
          >
            <h2 className="text-cuerpo text-texto-secundario m-0 font-normal">
              Categorías
            </h2>
            <div className="mt-2 flex flex-col">
              <Link
                to="/productos"
                onClick={closeMenu}
                className="text-cuerpo text-texto-principal flex h-[52px] items-center justify-between"
              >
                Todos
                <Icon
                  name="chevron_right"
                  className="text-texto-secundario text-xl"
                />
              </Link>
              {mobileCategoryOptions.map((option) => (
                <Link
                  key={option.value}
                  to={`/productos?categoria=${option.value}`}
                  onClick={() => {
                    closeMenu();
                    trackEvent('select_category', {
                      categoria: option.value,
                      origen: 'filtro',
                    });
                  }}
                  className="text-cuerpo text-texto-principal flex h-[52px] items-center justify-between"
                >
                  {option.label}
                  <Icon
                    name="chevron_right"
                    className="text-texto-secundario text-xl"
                  />
                </Link>
              ))}
            </div>
          </nav>

          <div className="flex shrink-0 flex-col px-4 py-4">
            <div className="text-cuerpo text-texto-secundario flex h-11 items-center gap-3">
              <Icon name="help_outline" className="text-xl" />
              <span>Ayuda</span>
            </div>
            <div className="text-cuerpo text-texto-secundario flex h-11 items-center gap-3">
              <Icon name="chat_bubble_outline" className="text-xl" />
              <span>Contacto por WhatsApp</span>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
