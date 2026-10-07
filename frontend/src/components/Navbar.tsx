import { useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';

// TODO(cart): wire `count` to a real cart context once it exists.
// The default 2 mirrors the Figma badge example, it is not live data.
interface NavbarProps {
  count?: number;
}

const CATEGORIES = ['Periféricos', 'Audio', 'Accesorios', 'Gadges', 'Ofertas'];

function CartButton({ count }: { count: number }) {
  return (
    <button
      type="button"
      aria-label="Carrito"
      className="relative flex h-12 w-12 shrink-0 items-center justify-center"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-accion-primaria"
      >
        <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20.5 8H6" />
        <circle cx="10" cy="20" r="1.25" />
        <circle cx="17" cy="20" r="1.25" />
      </svg>
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
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}

function SessionLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
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
  const navigate = useNavigate();

  function goToProducts() {
    setMenuOpen(false);
    navigate('/productos');
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
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
      <div className="hidden items-center justify-between gap-8 px-20 py-4 md:flex">
        <NavLink to="/" className="shrink-0 text-titulo-2 font-bold">
          NovaMarket
        </NavLink>
        <SearchForm id="navbar-search-desktop" className="w-[640px] shrink" />
        <div className="flex shrink-0 items-center gap-4">
          <SessionLinks />
          <CartButton count={count} />
        </div>
      </div>

      {/* Divider between top bar and categories */}
      <div
        aria-hidden="true"
        className="hidden border-t border-borde-divisor-estructura md:block"
      />

      {/* Desktop category bar */}
      <nav
        aria-label="Categorías"
        className="hidden items-center gap-8 px-20 py-6 md:flex"
      >
        <button
          type="button"
          onClick={() => navigate('/productos')}
          className="text-cuerpo font-semibold hover:underline"
        >
          Todos
        </button>
        {CATEGORIES.map((category) => (
          <NavLink
            key={category}
            to="/productos"
            className="text-cuerpo hover:underline"
          >
            {category}
          </NavLink>
        ))}
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
            <button
              type="button"
              onClick={goToProducts}
              className="text-cuerpo font-semibold"
            >
              Todos
            </button>
            {CATEGORIES.map((category) => (
              <NavLink
                key={category}
                to="/productos"
                onClick={() => setMenuOpen(false)}
                className="text-cuerpo"
              >
                {category}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
