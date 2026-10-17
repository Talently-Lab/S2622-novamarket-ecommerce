import { fireEvent, render, screen, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { system } from '../theme/system.ts';
import CategoryFilter from './CategoryFilter.tsx';

const CATEGORIES = ['gadgets', 'accesorios', 'perifericos', 'novedades'];
const COUNTS = { accesorios: 3, perifericos: 5, gadgets: 1, novedades: 2 };
const TOTAL = 11;

function renderFilter(value = '', onChange = vi.fn()) {
  render(
    <ChakraProvider value={system}>
      <CategoryFilter
        categories={CATEGORIES}
        value={value}
        onChange={onChange}
        counts={COUNTS}
        total={TOTAL}
      />
    </ChakraProvider>,
  );
  return { onChange };
}

function openSheet() {
  const trigger = screen.getByRole('button', { name: 'Categorías' });
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Categorías' });
  return { trigger, dialog };
}

beforeEach(() => {
  document.body.style.overflow = '';
});

describe('CategoryFilter', () => {
  it('renders a button trigger with dialog semantics and no native select', () => {
    renderFilter();

    const trigger = screen.getByRole('button', { name: 'Categorías' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the sheet with radios in canonical order and Todos checked by default', () => {
    renderFilter();
    const { dialog } = openSheet();

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      screen.getByRole('button', { name: 'Categorías' }),
    ).toHaveAttribute('aria-expanded', 'true');

    const radios = within(dialog).getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual([
      '',
      'perifericos',
      'accesorios',
      'gadgets',
      'novedades',
    ]);
    expect(
      within(dialog).getByRole('radio', { name: 'Todos' }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole('button', { name: /ver 11 productos/i }),
    ).toBeInTheDocument();
  });

  it('uses the singular CTA label for a single pending product', () => {
    renderFilter();
    const { dialog } = openSheet();

    fireEvent.click(within(dialog).getByRole('radio', { name: 'Gadgets' }));

    expect(
      within(dialog).getByRole('button', { name: 'Ver 1 producto' }),
    ).toBeInTheDocument();
  });

  it('keeps the selection pending until the CTA applies it and closes', () => {
    const { onChange } = renderFilter();
    const { dialog } = openSheet();

    fireEvent.click(
      within(dialog).getByRole('radio', { name: 'Periféricos' }),
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(
      within(dialog).getByRole('button', { name: 'Ver 5 productos' }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Ver 5 productos' }),
    );

    expect(onChange).toHaveBeenCalledWith('perifericos');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('discards the pending selection on X, scrim, and Escape', () => {
    const { onChange } = renderFilter();

    // X button.
    openSheet();
    fireEvent.click(screen.getByRole('radio', { name: 'Gadgets' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cerrar',
      }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Scrim click.
    openSheet();
    fireEvent.click(screen.getByRole('radio', { name: 'Gadgets' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Cerrar filtro de categorías' }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Escape.
    openSheet();
    fireEvent.click(screen.getByRole('radio', { name: 'Gadgets' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus into the dialog on open, back to the trigger on close, and locks scroll', () => {
    renderFilter();
    const { trigger, dialog } = openSheet();

    expect(
      within(dialog).getByRole('button', { name: 'Cerrar' }),
    ).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('spans the CTA full width and animates the sheet entrance', () => {
    renderFilter();
    const { dialog } = openSheet();

    expect(dialog.className).toContain('animate-sheet-in');
    expect(
      screen.getByRole('button', { name: 'Cerrar filtro de categorías' })
        .className,
    ).toContain('animate-fade-in');

    // Inline width instead of w-full: the Chakra recipe width (240px) wins
    // over the Tailwind utility through cascade layers, so width is forced.
    const cta = within(dialog).getByRole('button', {
      name: /ver 11 productos/i,
    });
    expect(cta.style.width).toBe('100%');
  });
});
