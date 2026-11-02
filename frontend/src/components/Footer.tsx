import { Link } from 'react-router';

type FooterItem = { label: string; to?: string };

const FOOTER_COLUMNS: { title: string; links: FooterItem[] }[] = [
  {
    title: 'Categorías',
    links: [
      { label: 'Periféricos', to: '/productos?categoria=perifericos' },
      { label: 'Accesorios', to: '/productos?categoria=accesorios' },
      { label: 'Gadgets', to: '/productos?categoria=gadgets' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Cómo comprar' },
      { label: 'Preguntas frecuentes' },
      { label: 'Contacto' },
    ],
  },
  {
    title: 'Mi cuenta',
    links: [
      { label: 'Ingresar', to: '/login' },
      { label: 'Crear cuenta', to: '/registro' },
      { label: 'Mis pedidos' },
    ],
  },
];

function SocialLinks() {
  return (
    <div
      role="group"
      aria-label="Redes sociales"
      className="text-fondo-exito flex gap-2"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-label="Instagram"
      >
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        aria-label="WhatsApp"
      >
        <path d="M4 20l1.5-4A8 8 0 1 1 8 18.5z" />
      </svg>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterItem[];
}) {
  return (
    <div className="flex flex-col gap-6 text-sm leading-5">
      <h2 className="m-0 font-semibold">{title}</h2>
      <ul className="text-texto-sobre-estructura-sec m-0 flex list-none flex-col gap-2 p-0">
        {links.map(({ label, to }) => (
          <li key={label}>
            {to ? (
              <Link to={to} className="hover:underline">
                {label}
              </Link>
            ) : (
              <span>{label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileFooter() {
  return (
    <div className="flex flex-col gap-4 md:hidden">
      <div className="flex flex-col gap-2">
        <div className="border-borde-divisor-estructura w-fit rounded border px-3 py-1 text-sm font-semibold tracking-wider">
          NovaMarket
        </div>
        <p className="text-texto-sobre-estructura-sec m-0 text-sm leading-5">
          Tecnología para tu setup
        </p>
      </div>

      <div className="flex flex-col">
        {FOOTER_COLUMNS.map(({ title }) => (
          <div
            key={title}
            className="border-borde-divisor-estructura flex h-12 items-center justify-between border-b text-sm font-medium"
          >
            <span>{title}</span>
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
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        ))}
      </div>

      <SocialLinks />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-fondo-estructura text-texto-sobre-estructura flex w-full justify-center px-4 py-8 font-sans md:px-20 md:py-12">
      <div className="flex w-full max-w-[1280px] flex-col gap-4 md:gap-6">
        <MobileFooter />

        <nav
          aria-label="Secciones del pie de página"
          className="border-borde-divisor-estructura hidden grid-cols-4 gap-4 border-b pb-12 md:grid"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h2 className="text-titulo-3 text-texto-sobre-estructura m-0 font-bold">
                NovaMarket
              </h2>
              <p className="text-texto-sobre-estructura-sec m-0 text-xs leading-4">
                Tecnología para tu setup
              </p>
            </div>
            <SocialLinks />
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} {...column} />
          ))}
        </nav>

        <div className="border-borde-divisor-estructura flex flex-col gap-4 border-t pt-4">
          <p className="text-texto-sobre-estructura-sec m-0 text-xs leading-4">
            © 2026 NovaMarket
          </p>
          <p className="text-texto-sobre-estructura-sec m-0 text-xs leading-4">
            Sitio de demostración: el checkout es simulado, no se realizan
            cobros.
          </p>
        </div>
      </div>
    </footer>
  );
}
