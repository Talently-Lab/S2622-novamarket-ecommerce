import { Button } from '@chakra-ui/react';
import emptySearchArt from '../assets/illustrations/not-products.svg';

interface EmptyStateAction {
  label: string;
  onAction: () => void;
}

interface ProductsEmptyStateProps {
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

/**
 * Illustrated empty result for the catalog (Figma Estado_vacío). The art is
 * decorative (aria-hidden, empty alt); the heading + description carry the
 * meaning and the status role announces them.
 */
export default function ProductsEmptyState({
  title,
  description,
  action,
}: ProductsEmptyStateProps) {
  return (
    <div
      role="status"
      data-testid="products-empty-state"
      className="mt-6 flex flex-col items-center px-6 py-8 text-center"
    >
      <img
        src={emptySearchArt}
        alt=""
        aria-hidden="true"
        className="h-auto w-40"
      />
      <p className="mt-6 text-titulo-3 font-bold text-texto-principal">
        {title}
      </p>
      {description ? (
        <p className="mt-2 max-w-md text-cuerpo text-texto-secundario">
          {description}
        </p>
      ) : null}
      {action ? (
        // Inline width instead of w-full: the Chakra recipe fixes width at
        // 240px in a cascade layer injected after Tailwind's utilities.
        <Button
          variant="primary"
          onClick={action.onAction}
          style={{ width: '100%' }}
          className="mt-6"
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
