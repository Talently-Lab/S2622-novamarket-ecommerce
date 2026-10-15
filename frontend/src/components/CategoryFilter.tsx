interface CategoryFilterProps {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
}

/** Accessible category dropdown for the catalog (Figma label "Categorías"). */
export default function CategoryFilter({
  categories,
  value,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="category-filter"
        className="text-cuerpo-chico-label font-medium text-texto-principal"
      >
        Categorías
      </label>
      <select
        id="category-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-borde-input bg-fondo-superficie px-3 text-cuerpo-chico text-texto-principal"
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
