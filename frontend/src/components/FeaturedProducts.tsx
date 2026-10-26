import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getProductsFromApi } from '../services/productService.ts';
import type { Product } from '../types/product.ts';
import { formatPrice } from '../utils/format.ts';
import { buildImageSrcSet } from '../utils/responsiveImage.ts';
import Icon from './icons/Icon.tsx';
import ProductCardSkeleton from './ProductCardSkeleton.tsx';

// Featured picks: one catalog product per category, then the remaining slots
// filled with the next products that have an image. The catalog has no
// "featured" flag, so the picks are derived from the catalog order. The
// "Novedad" badge is a user-kept visual label, not a catalog field.
const FEATURED_CATEGORIES = ['accesorios', 'perifericos', 'gadgets'] as const;
const FEATURED_COUNT = 4;

function pickFeatured(
  items: Product[],
  count: number = FEATURED_COUNT,
): Product[] {
  const candidates = items.filter((item) => item.imageUrl.length > 0);
  const picks = FEATURED_CATEGORIES.map((category) =>
    candidates.find((item) => item.category === category),
  ).filter((item): item is Product => item !== undefined);

  for (const item of candidates) {
    if (picks.length >= count) break;
    if (!picks.includes(item)) picks.push(item);
  }

  return picks.slice(0, count);
}

function FeaturedCard({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const detailHref = `/productos/${product.id}`;

  return (
    <li className="border-borde-divisor bg-fondo-superficie relative flex flex-col overflow-hidden rounded-lg border">
      {/* One link wraps badge + image + title + price so the whole block is
          clickable with a single tab stop. The CTA stays outside the link:
          nested interactive elements are invalid and break the button. */}
      <Link
        to={detailHref}
        aria-label={product.name}
        className="group focus-visible:outline-borde-foco flex flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      >
        <span className="bg-fondo-exito text-caption-badge text-texto-sobre-exito absolute top-2 left-2 rounded-full px-2 py-1 font-semibold">
          Novedad
        </span>
        {imageFailed || !product.imageUrl ? (
          <div
            role="img"
            aria-label={product.name}
            className="bg-fondo-deshabilitado flex aspect-square w-full items-center justify-center"
          >
            <Icon
              name="image_not_supported"
              className="text-texto-principal text-4xl"
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
            className="bg-fondo-deshabilitado aspect-square w-full object-cover"
          />
        )}
        <span className="flex flex-col gap-2 px-3 pt-3">
          <span className="text-cuerpo-chico text-texto-principal line-clamp-2 h-10 overflow-hidden font-normal group-hover:underline">
            {product.name}
          </span>
          <span className="text-precio text-texto-principal font-bold">
            {formatPrice(product.price)}
          </span>
        </span>
      </Link>
      <span className="flex flex-col gap-2 p-3 pt-2">
        <button
          type="button"
          aria-label={`Agregar ${product.name} al carrito`}
          className="bg-accion-primaria text-cuerpo-boton text-texto-sobre-accion hover:bg-accion-primaria-hover flex h-11 w-full items-center justify-center rounded-md font-semibold"
        >
          Agregar
        </button>
      </span>
    </li>
  );
}

export interface FeaturedProductsProps {
  title: string;
  count?: number;
  showSeeAll?: boolean;
}

function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function FeaturedProducts({
  title,
  count = FEATURED_COUNT,
  showSeeAll = false,
}: FeaturedProductsProps) {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const headingId = `featured-${slugifyTitle(title)}`;

  useEffect(() => {
    let cancelled = false;
    getProductsFromApi()
      .then((items) => {
        if (cancelled) return;
        setFeatured(pickFeatured(items, count));
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, [count]);

  // Hidden on error/empty: the section never breaks. While loading it renders
  // skeletons so the section does not collapse.
  if (featured && featured.length === 0) return null;

  return (
    <section aria-labelledby={headingId}>
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2
          id={headingId}
          className="text-titulo-3 text-texto-principal font-bold"
        >
          {title}
        </h2>
        {showSeeAll ? (
          <Link
            to="/productos"
            className="text-cuerpo-chico text-texto-secundario flex min-h-11 items-center font-semibold underline"
          >
            Ver todo
          </Link>
        ) : null}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {featured === null
          ? Array.from({ length: count }, (_, index) => (
              <li key={`featured-skeleton-${index}`}>
                <ProductCardSkeleton label="Cargando producto destacado" />
              </li>
            ))
          : featured.map((product) => (
              <FeaturedCard key={product.id} product={product} />
            ))}
      </ul>
    </section>
  );
}
