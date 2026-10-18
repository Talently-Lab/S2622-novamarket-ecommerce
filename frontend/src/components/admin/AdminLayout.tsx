import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.tsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';
import Icon from '../icons/Icon.tsx';

const DESKTOP_QUERY = '(min-width: 1024px)';

interface AdminNavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: AdminNavItem[] = [
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
];

function Brand() {
  return (
    <span className="flex items-center gap-2">
      <span className="text-titulo-3 font-bold text-texto-principal">
        NovaMarket
      </span>
      <span className="rounded-md bg-fondo-exito px-2 py-0.5 text-caption-badge font-semibold text-texto-sobre-exito">
        Admin
      </span>
    </span>
  );
}

/**
 * Admin shell (design: pics-admin). `/admin` gets its own navigation instead
 * of the storefront Navbar/Footer: on mobile a top bar plus a
 * Productos/Pedidos tab bar, on desktop a sidebar that also exposes
 * "Ver tienda" and "Salir".
 *
 * The switch happens in JS through `useMediaQuery` rather than CSS-only
 * `hidden lg:flex` classes, so exactly one navigation exists in the DOM.
 * Duplicate nav landmarks are both an accessibility problem and impossible to
 * assert in jsdom, where CSS classes hide nothing.
 */
export default function AdminLayout() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-fondo-pagina">
        <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-borde-divisor bg-fondo-superficie">
          <div className="px-6 py-6">
            <Brand />
          </div>
          <nav
            aria-label="Secciones de administración"
            className="flex flex-col"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `border-l-4 py-3 pl-5 text-cuerpo-boton ${
                    isActive
                      ? 'border-accion-acento bg-fondo-pagina font-semibold text-texto-principal'
                      : 'border-transparent text-texto-secundario hover:text-texto-principal'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-borde-divisor px-6 py-4">
            <NavLink
              to="/"
              className="block text-cuerpo text-texto-secundario hover:text-texto-principal"
            >
              Ver tienda
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 text-cuerpo-boton font-semibold text-texto-principal hover:underline"
            >
              Salir
              <Icon name="logout" className="text-xl" />
            </button>
          </div>
        </aside>
        <div className="pl-64">
          <main className="px-8 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo-pagina">
      <header className="flex items-center justify-between bg-fondo-superficie px-4 py-3">
        <Brand />
        <button
          type="button"
          onClick={handleLogout}
          className="text-cuerpo-boton font-semibold text-texto-principal"
        >
          Salir
        </button>
      </header>
      <nav
        aria-label="Secciones de administración"
        className="flex border-b border-borde-divisor bg-fondo-superficie"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 border-b-2 py-3 text-center text-cuerpo-boton ${
                isActive
                  ? 'border-accion-acento font-semibold text-texto-principal'
                  : 'border-transparent text-texto-secundario'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
