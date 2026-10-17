import { useEffect, useRef, useState } from 'react';
import { Button } from '@chakra-ui/react';
import Icon from './icons/Icon.tsx';
import {
  getCategoryDisplayName,
  orderCategoryOptions,
} from '../utils/categories.ts';

interface CategoryFilterProps {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
  counts: Record<string, number>;
  total: number;
}

// Bottom-sheet category dialog (overlay-todos.png). The closed trigger keeps
// the button styling from Figma Buttons 427:3108; opening it shows a sheet
// with pending selection — only the CTA applies the filter.
// Responsive note (interim, no desktop spec provided): the sheet is a
// bottom-anchored full-width panel on mobile and becomes a centered floating
// card on sm+ (max-w-md with bottom offset and full rounded-xl).
export default function CategoryFilter({
  categories,
  value,
  onChange,
  counts,
  total,
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  function openSheet() {
    setPending(value);
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
  }, [open ]);

  const options = orderCategoryOptions(categories);
  const pendingCount = pending === '' ? total : (counts[pending] ?? 0);
  const ctaLabel = `Ver ${pendingCount} ${pendingCount === 1 ? 'producto' : 'productos'}`;

  return (
    <div className="w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openSheet}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-borde-divisor bg-fondo-superficie px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco"
      >
        <span className="text-cuerpo-boton font-semibold text-texto-principal">
          Categorías
        </span>
        <Icon name="expand_more" className="text-2xl text-texto-principal" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:pb-6">
          {/* Scrim alpha is approximate: /60 over fondo-estructura. */}
          <button
            type="button"
            aria-label="Cerrar filtro de categorías"
            onClick={closeSheet}
            className="absolute inset-0 animate-fade-in cursor-default bg-fondo-estructura/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Categorías"
            className="relative max-h-[85vh] w-full animate-sheet-in overflow-y-auto rounded-t-xl bg-fondo-superficie sm:mx-auto sm:w-full sm:max-w-md sm:rounded-xl"
          >
            <div
              aria-hidden="true"
              className="mx-auto mt-3 h-1 w-10 rounded-full bg-borde-divisor"
            />
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-titulo-3 font-bold text-texto-principal">
                Categorías
              </h2>
              <button
                ref={closeRef}
                type="button"
                aria-label="Cerrar"
                onClick={closeSheet}
                className="flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco"
              >
                <Icon name="close" className="text-2xl text-texto-principal" />
              </button>
            </div>
            <div aria-hidden="true" className="border-t border-borde-divisor" />
            <fieldset className="px-4 py-2">
              <legend className="sr-only">Categorías</legend>
              {options.map((slug) => (
                <label
                  key={slug === '' ? 'all' : slug}
                  className="flex cursor-pointer items-center gap-3 py-3 text-cuerpo text-texto-principal"
                >
                  <input
                    type="radio"
                    name="category-filter"
                    value={slug}
                    checked={pending === slug}
                    onChange={() => setPending(slug)}
                    className="h-5 w-5 accent-texto-principal"
                  />
                  {slug === '' ? 'Todos' : getCategoryDisplayName(slug)}
                </label>
              ))}
            </fieldset>
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
