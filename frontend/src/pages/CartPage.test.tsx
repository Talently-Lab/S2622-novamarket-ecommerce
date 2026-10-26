import { fireEvent, render, screen, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProductsFromApi } from '../services/productService.ts';
import { system } from '../theme/system.ts';
import type { CartItem } from '../types/cart.ts';
import type { Product } from '../types/product.ts';
import CartPage from './CartPage.tsx';
import type { CartPageProps } from './CartPage.tsx';

vi.mock('../services/productService.ts', () => ({
  getProductsFromApi: vi.fn(),
}));

const mockedGetProducts = vi.mocked(getProductsFromApi);

const PRODUCT: Product = {
  id: 'p3',
  name: 'Auriculares NovaSound X1',
  description: 'Auriculares inalámbricos',
  price: 45999,
  stock: 24,
  category: 'accesorios',
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
};

const ITEMS: CartItem[] = [
  {
    productId: 'p1',
    name: 'Teclado Mecánico',
    unitPrice: 18500,
    quantity: 2,
    stock: 2,
  },
  {
    productId: 'p2',
    name: 'Mouse Gamer',
    unitPrice: 8000,
    quantity: 1,
    stock: 10,
  },
];

function renderCart(props: CartPageProps = {}) {
  render(
    <ChakraProvider value={system}>
      <MemoryRouter>
        <CartPage {...props} />
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe('CartPage', () => {
  beforeEach(() => {
    mockedGetProducts.mockResolvedValue([]);
  });

  it('renders the title, item names and the continue-shopping link', () => {
    renderCart({ items: ITEMS });

    expect(
      screen.getByRole('heading', { name: 'Tu carrito' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Teclado Mecánico')).toBeInTheDocument();
    expect(screen.getByText('Mouse Gamer')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Seguir comprando' }),
    ).toHaveAttribute('href', '/productos');
  });

  it('shows the unit price with the c/u suffix and the line subtotal', () => {
    renderCart({ items: [ITEMS[0]] });

    expect(screen.getByText('$18.500 c/u')).toBeInTheDocument();
    const row = screen.getByText('Teclado Mecánico').closest('li');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('$37.000')).toBeInTheDocument();
  });

  it('computes the total from the items and applies the discount', () => {
    renderCart({ items: ITEMS, discount: 5000 });

    const summary = screen.getByRole('complementary', { name: 'Resumen' });

    expect(within(summary).getByText('Subtotal')).toBeInTheDocument();
    expect(within(summary).getByText('$45.000')).toBeInTheDocument();
    expect(within(summary).getByText('Descuentos')).toBeInTheDocument();
    expect(within(summary).getByText('-$5.000')).toBeInTheDocument();
    expect(within(summary).getByText('Total')).toBeInTheDocument();
    expect(within(summary).getByText('$40.000')).toBeInTheDocument();
  });

  it('renders the desktop table header with the four column labels', () => {
    renderCart({ items: ITEMS });

    const products = screen.getByRole('region', {
      name: 'Productos del carrito',
    });

    expect(within(products).getByText('Producto')).toBeInTheDocument();
    expect(within(products).getByText('Precio')).toBeInTheDocument();
    expect(within(products).getByText('Cantidad')).toBeInTheDocument();
    expect(within(products).getByText('Subtotal')).toBeInTheDocument();
  });

  it('renders the summary as a labelled region with the total and checkout CTA', () => {
    renderCart({ items: ITEMS });

    const summary = screen.getByRole('complementary', { name: 'Resumen' });

    expect(within(summary).getByText('Total')).toBeInTheDocument();
    expect(
      within(summary).getByRole('button', { name: 'Continuar compra' }),
    ).toBeInTheDocument();
  });

  it('calls the quantity and remove handlers with the product id', () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const onRemove = vi.fn();
    renderCart({
      items: [ITEMS[0]],
      onIncrement,
      onDecrement,
      onRemove,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Sumar cantidad de Teclado Mecánico',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Restar cantidad de Teclado Mecánico',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Teclado Mecánico' }),
    );

    expect(onIncrement).toHaveBeenCalledWith('p1');
    expect(onDecrement).toHaveBeenCalledWith('p1');
    expect(onRemove).toHaveBeenCalledWith('p1');
  });

  it('calls onCheckout when the primary CTA is clicked', () => {
    const onCheckout = vi.fn();
    renderCart({ items: ITEMS, onCheckout });

    fireEvent.click(screen.getByRole('button', { name: 'Continuar compra' }));

    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it('disables the decrement control when quantity is 1', () => {
    renderCart({ items: [ITEMS[1]] });

    expect(
      screen.getByRole('button', {
        name: 'Restar cantidad de Mouse Gamer',
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'Sumar cantidad de Mouse Gamer',
      }),
    ).toBeEnabled();
  });

  it('shows the empty state and a catalog link when there are no items', () => {
    renderCart();

    expect(
      screen.getByRole('heading', { name: 'Tu carrito está vacío' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Sumá productos para armar tu setup'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute(
      'href',
      '/productos',
    );
    expect(screen.queryByText('Continuar compra')).toBeNull();
  });

  it('shows the best sellers heading and catalog product when the cart is empty', async () => {
    mockedGetProducts.mockResolvedValueOnce([PRODUCT]);

    renderCart();

    expect(
      await screen.findByRole('heading', { name: 'Más vendidos' }),
    ).toBeInTheDocument();
    expect(await screen.findByText(PRODUCT.name)).toBeInTheDocument();
  });
});
