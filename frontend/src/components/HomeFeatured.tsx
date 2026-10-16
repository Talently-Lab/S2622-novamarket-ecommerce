import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getProducts } from '../services/productService.ts';
import type { Product } from '../types/product.ts';
import { buildImageSrcSet } from '../utils/responsiveImage.ts';
import Icon from './icons/Icon.tsx';

// Featured picks: the first in-catalog product of each category
// (accesorios, perifericos, gadgets) plus a second perifericos best-seller,
// every pick with a valid imageUrl. The "Novedad" badge is a user-kept visual
// label, not a catalog field.
const FEATURED_IDS: ReadonlySet<Product['id']> = new Set([1, 2, 3, 6]);

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

function FeaturedCard({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <li className="relative flex flex-col overflow-hidden rounded-lg border border-borde-divisor bg-fondo-superficie">
      <span className="absolute left-2 top-2 rounded-full bg-fondo-exito px-2 py-1 text-caption-badge font-semibold text-texto-sobre-exito">
        Novedad
      </span>
      {imageFailed || !product.imageUrl ? (
        <div
          role="img"
          aria-label={product.name}
          className="flex aspect-square w-full items-center justify-center bg-fondo-deshabilitado"
        >
          <Icon
            name="image_not_supported"
            className="text-4xl text-texto-principal"
          />
        </div>
      ) : (
        <img
          src={product.imageUrl}
          srcSet={buildImageSrcSet(product.imageUrl)}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="aspect-square w-full bg-fondo-deshabilitado object-cover"
        />
      )}
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
  );
}

export default function HomeFeatured() {
  const [featured, setFeatured] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((items) => {
        if (cancelled) return;
        setFeatured(
          items
            .filter(
              (item) => FEATURED_IDS.has(item.id) && item.imageUrl.length > 0,
            )
            .slice(0, 4),
        );
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hidden while loading and on error/empty: the home never breaks.
  if (!featured || featured.length === 0) return null;

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
        {featured.map((product) => (
          <FeaturedCard key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}
