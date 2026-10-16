import { fireEvent, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ProductCard from './ProductCard.tsx';
import type { Product } from '../types/product.ts';
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
  return render(<ChakraProvider value={system}>{node}</ChakraProvider>);
}

describe('ProductCard variants', () => {
  it('resolves default when in stock and not added', () => {
    const { container } = renderCard(<ProductCard product={baseProduct} />);
    const card = container.querySelector('article[data-variant]');
    expect(card).toHaveAttribute('data-variant', 'default');
    expect(
      screen.getByRole('button', { name: 'Agregar' }),
    ).toBeEnabled();
  });

  it('resolves added when flagged and in stock', () => {
    const { container } = renderCard(
      <ProductCard product={baseProduct} added />,
    );
    const card = container.querySelector('article[data-variant]');
    expect(card).toHaveAttribute('data-variant', 'added');
    expect(screen.getByRole('status')).toHaveTextContent('Agregado');
  });

  it('resolves out-of-stock even when flagged as added', () => {
    const { container } = renderCard(
      <ProductCard product={{ ...baseProduct, stock: 0 }} added />,
    );
    const card = container.querySelector('article[data-variant]');
    expect(card).toHaveAttribute('data-variant', 'out-of-stock');
    expect(
      screen.getByRole('button', { name: 'Sin stock' }),
    ).toBeDisabled();
    expect(screen.queryByText('Agregado')).not.toBeInTheDocument();
  });
});

describe('ProductCard', () => {
  it('renders the default variant with name, price and an enabled CTA', () => {
    renderCard(<ProductCard product={baseProduct} />);

    expect(
      screen.getByRole('heading', { name: baseProduct.name }),
    ).toBeInTheDocument();
    expect(screen.getByText('$46.000')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Agregar' }),
    ).toBeEnabled();
  });

  it('formats the price for Argentina without visible decimals', () => {
    renderCard(
      <ProductCard product={{ ...baseProduct, price: 32000 }} />,
    );

    expect(screen.getByText('$32.000')).toBeInTheDocument();
  });

  it('reserves the same two-line title height for short and long names', () => {
    renderCard(
      <>
        <ProductCard product={baseProduct} />
        <ProductCard
          product={{
            ...baseProduct,
            id: 2,
            name: 'Auriculares Bluetooth NovaSound X1 con cancelación de ruido activa',
          }}
        />
      </>,
    );

    const titles = screen.getAllByRole('heading', { level: 2 });
    expect(titles).toHaveLength(2);
    for (const title of titles) {
      expect(title).toHaveClass('h-10', 'line-clamp-2', 'overflow-hidden');
    }
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
