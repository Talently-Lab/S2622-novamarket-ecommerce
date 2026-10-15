interface ProductsEmptyStateProps {
  title: string;
  description?: string;
}

/** Non-interactive empty result for the catalog (empty or no match). */
export default function ProductsEmptyState({
  title,
  description,
}: ProductsEmptyStateProps) {
  return (
    <div
      role="status"
      data-testid="products-empty-state"
      className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-borde-divisor bg-fondo-superficie px-6 py-12 text-center"
    >
      <p className="text-titulo-3 font-bold text-texto-principal">{title}</p>
      {description ? (
        <p className="text-cuerpo-chico text-texto-secundario">{description}</p>
      ) : null}
    </div>
  );
}
