// Small wrapper for Material Symbols outlined icons.
// Keeps icon usage consistent: decorative by default, exposed as
// an image only when an accessible label is provided.
interface IconProps {
  name: string;
  className?: string;
  label?: string;
}

export default function Icon({ name, className = '', label }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
