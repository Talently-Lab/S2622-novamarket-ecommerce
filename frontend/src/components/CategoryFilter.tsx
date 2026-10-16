import Icon from './icons/Icon.tsx';

interface CategoryFilterProps {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
}

// Closed-state button styling only (Figma Buttons 427:3108). The custom
// dropdown overlay is deferred, so a transparent native select stays
// overlaid on the visual bar to keep behavior and keyboard support.
export default function CategoryFilter({
  categories,
  value,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-borde-divisor bg-fondo-superficie px-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-borde-foco"
      >
        <span className="text-cuerpo-boton font-semibold text-texto-principal">
          Categorías
        </span>
        <Icon name="expand_more" className="text-2xl text-texto-principal" />
      </div>
      <select
        id="category-filter"
        aria-label="Categorías"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">Todas</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
