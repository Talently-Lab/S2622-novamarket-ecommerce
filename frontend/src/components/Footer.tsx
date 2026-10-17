export default function Footer() {
  return (
    <footer className="flex w-full justify-center border-t border-borde-divisor-estructura bg-fondo-estructura px-4 py-8 font-sans text-texto-sobre-estructura md:px-20">
      <div className="flex w-full max-w-[1280px] flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="w-fit rounded border border-borde-divisor-estructura px-3 py-1 text-sm font-semibold tracking-wider">
            NovaMarket
          </div>
          <p className="m-0 text-sm leading-5 text-texto-sobre-estructura-sec">
            Tecnología para tu setup
          </p>
        </div>

        <div className="flex flex-col">
          <div className="flex h-12 items-center justify-between border-b border-borde-divisor-estructura text-sm font-medium">
            <span>Categorías</span>
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

          <div className="flex h-12 items-center justify-between border-b border-borde-divisor-estructura text-sm font-medium">
            <span>Ayuda</span>
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

          <div className="flex h-12 items-center justify-between border-b border-borde-divisor-estructura text-sm font-medium">
            <span>Mi cuenta</span>
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
        </div>

        <div className="flex gap-4 text-texto-sobre-estructura-sec">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-label="Instagram"
          >
            <rect x="4" y="4" width="16" height="16" rx="5" />
            <circle cx="12" cy="12" r="3.5" />
          </svg>

          <svg
            width="24"
            height="24"
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

        <p className="m-0 text-xs leading-4 text-texto-sobre-estructura-sec">
          © 2026 NovaMarket
          <br />
          Sitio de demostración: el checkout es simulado, no se realizan cobros.
        </p>
      </div>
    </footer>
  );
}
