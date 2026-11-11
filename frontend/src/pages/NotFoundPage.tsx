import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section
      data-testid="not-found-content"
      aria-labelledby="not-found-title"
      className="flex min-h-[calc(100svh-8rem)] flex-col items-center gap-10 px-4 py-10 text-center md:min-h-[795px] md:justify-between md:px-[200px] md:pt-20 md:pb-[200px]"
    >
      <div className="bg-fondo-deshabilitado flex h-[104px] w-full max-w-[320px] flex-col items-center justify-center gap-2 rounded-md px-4">
        <p className="text-cuerpo-boton text-texto-principal m-0 font-semibold">
          ¡UPS!
        </p>
        <p className="text-cuerpo-chico text-texto-secundario m-0">
          No encontramos esta página
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-cuerpo-boton text-texto-principal m-0 font-semibold tracking-wide md:text-titulo-3">
          ERROR
        </p>
        <h1
          id="not-found-title"
          className="text-texto-principal m-0 text-[72px] leading-none font-bold md:text-[96px]"
        >
          404
        </h1>
      </div>

      <Link
        to="/"
        className="bg-accion-primaria text-texto-sobre-accion hover:bg-accion-primaria-hover text-cuerpo-boton flex h-12 w-[240px] items-center justify-center rounded-md px-4 font-semibold"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
