import { fireEvent, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ProductCard, {
  getProductCardVariant,
} from './ProductCard.tsx';
import type { Product } from '../mocks/products.ts';
import { system } from '../theme/system.ts';

const baseProduct: Product = {
  id: 1,
  name: 'Auriculares Bluetooth NovaSound X1',
  description: 'Auriculares inalambricos over-ear',
  price: 45999.9,
  stock: 24,
  category: 'accesorios',
  imageUrl: 'https://placehold.co/600x400/png?text=Test',
};

function renderCard(node: ReactNode) {
  render(<ChakraProvider value={system}>{node}</ChakraProvider>);
}

describe('getProductCardVariant', () => {
  it('resolves default when in stock and not added', () => {
    expect(getProductCardVariant(baseProduct)).toBe('default');
  });

  it('resolves added when flagged and in stock', () => {
    expect(getProductCardVariant(baseProduct, true)).toBe('added');
  });

  it('resolves out-of-stock even when flagged as added', () => {
    expect(getProductCardVariant({ ...baseProduct, stock: 0 }, true)).toBe(
      'out-of-stock',
    );
  });
});

describe('ProductCard', () => {
  it('renders the default variant with name, price and an enabled CTA', () => {
    renderCard(<ProductCard product={baseProduct} />);

    expect(
      screen.getByRole('heading', { name: baseProduct.name }),
    ).toBeInTheDocument();
    expect(screen.getByText('$45,999.9')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Agregar' }),
    ).toBeEnabled();
  });

  it('calls onAdd with the product when the CTA is clicked', () => {
    const onAdd = vi.fn();
    renderCard(<ProductCard product={baseProduct} onAdd={onAdd} />);

    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(baseProduct);
  });

  it('renders the added confirmation instead of a button', () => {
    renderCard(<ProductCard product={baseProduct} added />);

    expect(screen.getByRole('status')).toHaveTextContent('Agregado');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a disabled CTA without action when out of stock', () => {
    const onAdd = vi.fn();
    renderCard(
      <ProductCard
        product={{ ...baseProduct, stock: 0 }}
        added
        onAdd={onAdd}
      />,
    );

    const cta = screen.getByRole('button', { name: 'Sin stock' });
    expect(cta).toBeDisabled();
    fireEvent.click(cta);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows an accessible local fallback when the image fails', () => {
    renderCard(
      <ProductCard
        product={{ ...baseProduct, imageUrl: 'https://invalid.local/x.png' }}
      />,
    );

    fireEvent.error(screen.getByRole('img', { name: baseProduct.name }));

    expect(screen.queryByRole('img', { name: baseProduct.name })).toHaveAttribute(
      'aria-label',
      baseProduct.name,
    );
    expect(screen.queryByAltText(baseProduct.name)).not.toBeInTheDocument();
  });
});
