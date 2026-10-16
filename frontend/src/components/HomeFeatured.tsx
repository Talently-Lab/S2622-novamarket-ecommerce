import { Link } from 'react-router';
import { HOME_FEATURED_PRODUCTS } from '../data/homeFeatured.ts';
import Icon from './icons/Icon.tsx';

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

export default function HomeFeatured() {
  return (
    <section aria-labelledby="home-featured-title">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2
          id="home-featured-title"
          className="text-titulo-3 font-bold text-texto-principal"
        >
          Destacados
        </h2>
        <Link
          to="/productos"
          className="flex min-h-11 items-center text-cuerpo-chico font-semibold text-texto-secundario underline"
        >
          Ver todo
        </Link>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {HOME_FEATURED_PRODUCTS.map((product) => (
          <li
            key={product.id}
            className="relative flex flex-col overflow-hidden rounded-lg border border-borde-divisor bg-fondo-superficie"
          >
            <span className="absolute left-2 top-2 rounded-full bg-fondo-exito px-2 py-1 text-caption-badge font-semibold text-texto-sobre-exito">
              Novedad
            </span>
            <span
              aria-hidden="true"
              className="flex aspect-square w-full items-center justify-center bg-fondo-deshabilitado"
            >
              <Icon name="image_not_supported" className="text-4xl text-texto-principal" />
            </span>
            <span className="flex flex-col gap-2 p-3">
              <span className="h-10 line-clamp-2 overflow-hidden text-cuerpo-chico font-normal text-texto-principal">
                {product.name}
              </span>
              <span className="text-precio font-bold text-texto-principal">
                {formatPrice(product.price)}
              </span>
              <button
                type="button"
                aria-label={`Agregar ${product.name} al carrito`}
                className="flex h-11 w-full items-center justify-center rounded-md bg-accion-primaria text-cuerpo-boton font-semibold text-texto-sobre-accion hover:bg-accion-primaria-hover"
              >
                Agregar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
