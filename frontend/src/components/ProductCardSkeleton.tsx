// Loading placeholder matching ProductCard geometry (Figma `178:2042`).
// Fluid width like the card: image, title, price and CTA placeholders
// keep stable proportions at any container width. No interactive state.
interface ProductCardSkeletonProps {
  label?: string;
}

export default function ProductCardSkeleton({
  label = 'Cargando producto',
}: ProductCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      data-testid="product-card-skeleton"
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-borde-divisor bg-fondo-superficie"
    >
      <div aria-hidden="true" className="flex flex-col">
        <div className="aspect-square w-full animate-pulse bg-fondo-deshabilitado" />
        <div className="flex flex-col gap-2 p-3">
          <div
            aria-hidden="true"
            data-testid="product-card-skeleton-title"
            className="flex h-10 flex-col justify-center gap-1.5"
          >
            <div className="h-4 w-3/4 animate-pulse rounded-sm bg-fondo-deshabilitado" />
            <div className="h-4 w-1/2 animate-pulse rounded-sm bg-fondo-deshabilitado" />
          </div>
          <div className="h-6 w-1/2 animate-pulse rounded-sm bg-fondo-deshabilitado" />
          <div className="h-11 w-full animate-pulse rounded-md bg-fondo-deshabilitado" />
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
