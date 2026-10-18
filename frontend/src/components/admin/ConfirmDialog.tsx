import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Destructive-action confirmation modal (SN-251 delete flow).
 *
 * Mirrors the overlay recipe already proven in `CategoryFilter` — a native
 * `<div role="dialog">` with scrim, Escape to dismiss, focus moved inside on
 * open and the body scroll locked while it is mounted — instead of pulling in
 * Chakra's Dialog, so the app keeps one overlay pattern.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCancel}
        className="absolute inset-0 animate-fade-in cursor-default bg-fondo-estructura/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md animate-fade-in rounded-xl bg-fondo-superficie p-6"
      >
        <h2 className="text-titulo-3 font-bold text-texto-principal">{title}</h2>
        {description ? (
          <p className="mt-2 text-cuerpo text-texto-secundario">{description}</p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="h-12 rounded-md border border-borde-input px-4 text-cuerpo-boton font-semibold text-texto-secundario disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          {/* The palette has a single red token (texto/error); it is reused as
              the destructive background until design ships an action/danger
              token. */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="h-12 rounded-md bg-texto-error px-4 text-cuerpo-boton font-semibold text-texto-sobre-accion disabled:opacity-60"
          >
            {isConfirming ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
