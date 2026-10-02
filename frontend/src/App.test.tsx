import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { products } from './mocks/products.ts';

describe('NovaMarket landing page', () => {
  it('welcomes visitors to NovaMarket on the root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /welcome to novamarket/i }),
    ).toBeInTheDocument();
  });

  it('shows navigation links to the main sections', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: /browse products/i }),
    ).toBeInTheDocument();
  });

  it('renders the mock product catalog on /productos', () => {
    render(
      <MemoryRouter initialEntries={['/productos']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /^products$/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(products.length);
  });
});
