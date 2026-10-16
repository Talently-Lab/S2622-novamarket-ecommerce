import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it('renders the CSV-backed product catalog on /productos', async () => {
    render(
      <MemoryRouter initialEntries={['/productos']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: /todos los productos/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('20 productos')).toBeInTheDocument();
    expect(await screen.findAllByRole('img')).toHaveLength(8);
  });
});
