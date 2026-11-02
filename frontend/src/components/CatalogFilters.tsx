import { useState } from 'react';
import type { CategoryOption } from '../services/formdataService.ts';

// Figma `D - Catálogo` › `Section categoria` (570:4630): a 264px rail with the
// category radios and the price range. The same fields feed the desktop rail
// and the mobile sheet, so they live here and stay fully controlled.

export interface CatalogFilterValues {
  category: string;
  minPrice?: number;
  maxPrice?: number;
}

interface CatalogFiltersProps extends CatalogFilterValues {
  options: CategoryOption[];
  onCategoryChange: (category: string) => void;
  onPriceChange: (minPrice?: number, maxPrice?: number) => void;
  /** Radio group name; unique per rendered instance. */
  name: string;
}

function toDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

function parsePrice(raw: string): number | undefined {
  const digits = toDigits(raw);
  return digits.length > 0 ? Number(digits) : undefined;
}

export default function CatalogFilters({
  options,
  category,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
  name,
}: CatalogFiltersProps) {
  const [min, setMin] = useState(
    minPrice === undefined ? '' : String(minPrice),
  );
  const [max, setMax] = useState(
    maxPrice === undefined ? '' : String(maxPrice),
  );

  const [synced, setSynced] = useState({ minPrice, maxPrice });

  // The URL owns the values: adjust the local inputs during render when a
  // deep link or a clear changes them (React's "derive state from props"
  // pattern, which avoids a cascading effect render).
  if (synced.minPrice !== minPrice || synced.maxPrice !== maxPrice) {
    setSynced({ minPrice, maxPrice });
    setMin(minPrice === undefined ? '' : String(minPrice));
    setMax(maxPrice === undefined ? '' : String(maxPrice));
  }

  // Committing on blur/Enter keeps the price inputs from firing a request on
  // every keystroke.
  function commitPrice() {
    const nextMin = parsePrice(min);
    const nextMax = parsePrice(max);
    if (nextMin !== minPrice || nextMax !== maxPrice) {
      onPriceChange(nextMin, nextMax);
    }
  }

  const radioOptions: CategoryOption[] = [
    { value: '', label: 'Todos' },
    ...options,
  ];

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-titulo-3 text-texto-principal mb-4 font-bold">
          Categorías
        </legend>
        {radioOptions.map((option) => (
          <label
            key={option.value === '' ? 'all' : option.value}
            className="text-cuerpo text-texto-principal flex min-h-11 cursor-pointer items-center gap-3"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={category === option.value}
              onChange={() => onCategoryChange(option.value)}
              className="accent-texto-principal h-5 w-5"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-4">
        <p className="text-titulo-3 text-texto-principal font-bold">Precio</p>
        <div className="flex flex-col gap-3">
          <label className="text-cuerpo-chico-label text-texto-secundario flex flex-col gap-2">
            Mínimo
            <input
              type="text"
              inputMode="numeric"
              value={min}
              onChange={(event) => setMin(toDigits(event.target.value))}
              onBlur={commitPrice}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitPrice();
                }
              }}
              className="border-borde-input bg-fondo-superficie text-cuerpo text-texto-principal h-12 rounded-md border px-4"
            />
          </label>
          <label className="text-cuerpo-chico-label text-texto-secundario flex flex-col gap-2">
            Máximo
            <input
              type="text"
              inputMode="numeric"
              value={max}
              onChange={(event) => setMax(toDigits(event.target.value))}
              onBlur={commitPrice}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitPrice();
                }
              }}
              className="border-borde-input bg-fondo-superficie text-cuerpo text-texto-principal h-12 rounded-md border px-4"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
