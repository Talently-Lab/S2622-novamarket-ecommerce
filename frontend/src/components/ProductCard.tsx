import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import type { Product } from '../types/product.ts';
import { formatPrice } from '../utils/format.ts';
import { buildImageSrcSet } from '../utils/responsiveImage.ts';
import Icon from './icons/Icon.tsx';

// Reusable catalog card from Figma frame `178:2042` / set `178:2059`.
// Mobile-first, fluid width: it adapts to any grid column, it never
// sets its own width. Visual state is fully derived from props
// (deterministic): out of stock always wins over `added`.
export type ProductCardVariant = 'default' | 'added' | 'out-of-stock';

export interface ProductCardProps {
  product: Product;
  /** Shows the green "Agregado" confirmation instead of the CTA. */
  added?: boolean;
  /** Fired only from the Default CTA. No cart logic lives here. */
  onAdd?: (product: Product) => void;
  /** Eager, high-priority load for above-the-fold cards. Defaults to lazy. */
  priority?: boolean;
}

function getProductCardVariant(
  product: Product,
  added = false,
): ProductCardVariant {
  if (product.stock <= 0) return 'out-of-stock';
  if (added) return 'added';
  return 'default';
}

export default function ProductCard({
  product,
  added = false,
  onAdd,
  priority = false,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  // `imageUrl` can be empty when the backend omits `imagenUrl` (it is not
  // `required` in the Mongo model). Render the same local placeholder as a
  // failed load instead of an empty `src`.
  const showImagePlaceholder = imageFailed || product.imageUrl.length === 0;
  const variant = getProductCardVariant(product, added);
  const nameId = `product-card-${product.id}-name`;

  return (
    <article
      aria-labelledby={nameId}
      data-variant={variant}
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-borde-divisor bg-fondo-superficie"
    >
      {showImagePlaceholder ? (
        <div
          role="img"
          aria-label={product.name}
          className="flex aspect-square w-full items-center justify-center bg-fondo-deshabilitado"
        >
          <Icon name="image_not_supported" className="text-4xl text-texto-principal" />
        </div>
      ) : (
        <img
          src={product.imageUrl}
          srcSet={buildImageSrcSet(product.imageUrl)}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onError={() => setImageFailed(true)}
          className="aspect-square w-full bg-fondo-deshabilitado object-cover"
        />
      )}
      <div className="flex flex-col gap-2 p-3">
        <h2
          id={nameId}
          className="h-10 line-clamp-2 overflow-hidden text-cuerpo-chico font-normal text-texto-principal"
        >
          {product.name}
        </h2>
        <p className="text-precio font-bold text-texto-principal">
          {formatPrice(product.price)}
        </p>
        {/* Width note: the Chakra recipe fixes width at 240px in a cascade
            layer injected after Tailwind's utilities, so neither the
            width style prop nor w-full survive — both CTAs force it inline. */}
        {variant === 'added' ? (
          <p
            role="status"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-fondo-exito text-cuerpo-boton font-semibold text-texto-sobre-exito"
          >
            <Icon name="check" />
            Agregado
          </p>
        ) : variant === 'out-of-stock' ? (
          <Button
            variant="primary"
            disabled
            style={{ width: '100%' }}
            height="44px"
          >
            Sin stock
          </Button>
        ) : (
          <Button
            variant="primary"
            style={{ width: '100%' }}
            height="44px"
            onClick={() => onAdd?.(product)}
          >
            Agregar
          </Button>
        )}
      </div>
    </article>
  );
}
