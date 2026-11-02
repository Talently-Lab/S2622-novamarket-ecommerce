import { useEffect, useRef, useState } from 'react';
import { Button } from '@chakra-ui/react';
import CatalogFilters from './CatalogFilters.tsx';
import type { CatalogFilterValues } from './CatalogFilters.tsx';
import Icon from './icons/Icon.tsx';
import type { CategoryOption } from '../services/formdataService.ts';

interface CategoryFilterProps {
  /** Backend-owned category options (GET /api/formdata/products). */
  options: CategoryOption[];
  value: string;
  minPrice?: number;
  maxPrice?: number;
  onChange: (values: CatalogFilterValues) => void;
  counts: Record<string, number>;
  total: number;
}

// Mobile filter control (Figma `Catálogo` 737:5641): the dark "Filtros (n)"
// button opens a bottom sheet with the same fields as the desktop rail —
// categories and price. Changes stay pending until the CTA applies them.
export default function CategoryFilter({
  options,
  value,
  minPrice,
  maxPrice,
  onChange,
  counts,
  total,
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<CatalogFilterValues>({
    category: value,
    minPrice,
    maxPrice,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const activeCount =
    (value ? 1 : 0) +
    (minPrice !== undefined ? 1 : 0) +
    (maxPrice !== undefined ? 1 : 0);

  function openSheet() {
    setPending({ category: value, minPrice, maxPrice });
    setOpen(true);
  }

  function closeSheet() {
    setOpen(false);
  }

  function applyPending() {
    onChange(pending);
    setOpen(false);
  }

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  const pendingCount =
    pending.category === '' ? total : (counts[pending.category] ?? 0);
  const ctaLabel = `Ver ${pendingCount} ${pendingCount === 1 ? 'producto' : 'productos'}`;

  return (
    <div className="flex-1">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openSheet}
        className="bg-fondo-estructura text-texto-sobre-estructura focus-visible:outline-borde-foco flex h-12 w-full items-center justify-center gap-2 rounded-md px-4 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Icon name="tune" className="text-xl" />
        <span className="text-cuerpo-boton font-semibold">
          Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:pb-6">
          {/* Scrim alpha is approximate: /60 over fondo-estructura. */}
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={closeSheet}
            className="bg-fondo-estructura/60 animate-fade-in absolute inset-0 cursor-default"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            className="bg-fondo-superficie animate-sheet-in relative max-h-[85vh] w-full overflow-y-auto rounded-t-xl sm:mx-auto sm:w-full sm:max-w-md sm:rounded-xl"
          >
            <div
              aria-hidden="true"
              className="bg-borde-divisor mx-auto mt-3 h-1 w-10 rounded-full"
            />
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-titulo-3 text-texto-principal font-bold">
                Filtros
              </h2>
              <button
                ref={closeRef}
                type="button"
                aria-label="Cerrar"
                onClick={closeSheet}
                className="focus-visible:outline-borde-foco flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Icon name="close" className="text-texto-principal text-2xl" />
              </button>
            </div>
            <div aria-hidden="true" className="border-borde-divisor border-t" />
            <div className="px-4 py-4">
              <CatalogFilters
                name="category-filter-sheet"
                options={options}
                category={pending.category}
                minPrice={pending.minPrice}
                maxPrice={pending.maxPrice}
                onCategoryChange={(category) =>
                  setPending((current) => ({ ...current, category }))
                }
                onPriceChange={(nextMin, nextMax) =>
                  setPending((current) => ({
                    ...current,
                    minPrice: nextMin,
                    maxPrice: nextMax,
                  }))
                }
              />
            </div>
            <div className="px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {/* Inline width instead of w-full: the Chakra recipe fixes
                  width at 240px in a cascade layer injected after
                  Tailwind's utilities, so the w-full utility loses and the
                  button would render 240px wide. Inline style wins. */}
              <Button
                variant="primary"
                onClick={applyPending}
                style={{ width: '100%' }}
              >
                {ctaLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
