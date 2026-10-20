import { fireEvent, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
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
  return render(
    <ChakraProvider value={system}>
      <MemoryRouter>{node}</MemoryRouter>
    </ChakraProvider>,
  );
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
    const cta = screen.getByRole('button', { name: 'Agregar' });
    expect(cta).toBeEnabled();
    // Inline width: the Chakra recipe width wins over style props and
    // utilities through cascade layers, so it is forced (see component).
    expect(cta.style.width).toBe('100%');
  });

  it('links the title to the product detail page', () => {
    renderCard(<ProductCard product={baseProduct} />);

    expect(
      screen.getByRole('link', { name: baseProduct.name }),
    ).toHaveAttribute('href', '/productos/1');
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
    expect(cta.style.width).toBe('100%');
    fireEvent.click(cta);
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('ProductCard responsive images', () => {
  const unsplashProduct: Product = {
    ...baseProduct,
    imageUrl:
      'https://images.unsplash.com/photo-123?auto=format&fit=crop&w=600&q=80',
  };

  it('lazy-loads by default without high fetch priority', () => {
    renderCard(<ProductCard product={baseProduct} />);

    const img = screen.getByRole('img', { name: baseProduct.name });
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img.getAttribute('fetchpriority')).toBeNull();
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('omits srcset when the URL has no w param', () => {
    renderCard(<ProductCard product={baseProduct} />);

    const img = screen.getByRole('img', { name: baseProduct.name });
    expect(img.getAttribute('srcset')).toBeNull();
  });

  it('exposes srcset and sizes when the URL has a w param', () => {
    renderCard(<ProductCard product={unsplashProduct} />);

    const img = screen.getByRole('img', { name: baseProduct.name });
    const srcSet = img.getAttribute('srcset');
    expect(srcSet).toContain('w=200');
    expect(srcSet).toContain('w=600');
    expect(srcSet).toContain('200w');
    expect(srcSet).toContain('800w');
    expect(img).toHaveAttribute(
      'sizes',
      '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
    );
    expect(img).toHaveAttribute('src', unsplashProduct.imageUrl);
  });

  it('eager-loads with high priority when flagged', () => {
    renderCard(<ProductCard product={unsplashProduct} priority />);

    const img = screen.getByRole('img', { name: baseProduct.name });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });
});

describe('ProductCard image fallback', () => {
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

    // Figma placeholder: large dark-navy broken-image icon on gris-200.
    const icon = screen.getByText('image_not_supported');
    expect(icon.tagName).toBe('SPAN');
    expect(icon.className).toContain('text-4xl');
    expect(icon.className).toContain('text-texto-principal');
  });

  it('shows the placeholder when imageUrl is empty', () => {
    renderCard(<ProductCard product={{ ...baseProduct, imageUrl: '' }} />);

    expect(screen.queryByAltText(baseProduct.name)).not.toBeInTheDocument();
    expect(screen.getByText('image_not_supported')).toBeInTheDocument();
  });
});
