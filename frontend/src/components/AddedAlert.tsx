import Icon from './icons/Icon.tsx';

export interface AddedAlertProps {
  /** Renders the Figma `Alert Added-to-cart` (178:1988) overlay while true. */
  visible: boolean;
}

// Figma `Alert Added-to-cart` (178:1988 / canvas node 648:5146): a floating
// 358x48 confirmation, mint fill, 8px radius, check icon and semibold label.
// It spans the top on mobile and docks below the 80px desktop navbar on the
// right, so it never covers the navbar cart button.
export default function AddedAlert({ visible }: AddedAlertProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="text-cuerpo-boton bg-fondo-exito text-texto-sobre-exito fixed top-4 right-4 left-4 z-50 flex h-12 items-center gap-2 rounded-md px-4 font-semibold shadow-lg md:top-24 md:left-auto md:w-[358px]"
    >
      <Icon name="check" />
      Agregado al carrito
    </div>
  );
}
