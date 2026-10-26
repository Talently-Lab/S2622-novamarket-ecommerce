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
      className="border-borde-divisor bg-fondo-superficie flex w-full flex-col overflow-hidden rounded-2xl border"
    >
      <div aria-hidden="true" className="flex flex-col">
        <div className="bg-fondo-deshabilitado aspect-square w-full animate-pulse" />
        <div className="flex flex-col gap-2 p-3">
          <div
            aria-hidden="true"
            data-testid="product-card-skeleton-title"
            className="flex h-10 flex-col justify-center gap-1.5"
          >
            <div className="bg-fondo-deshabilitado h-4 w-3/4 animate-pulse rounded-sm" />
            <div className="bg-fondo-deshabilitado h-4 w-1/2 animate-pulse rounded-sm" />
          </div>
          <div className="bg-fondo-deshabilitado h-6 w-1/2 animate-pulse rounded-sm" />
          <div className="bg-fondo-deshabilitado h-11 w-full animate-pulse rounded-md" />
        </div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
