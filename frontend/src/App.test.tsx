import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NovaMarket landing page', () => {
  it('shows the mini-deploy home with banner, categories and featured', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /potenciá tu setup/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /categorías/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /destacados/i }),
    ).toBeInTheDocument();
  });

  it('links the home tiles to the catalog sections', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    const homeTiles = screen.getAllByRole('link', {
      name: /periféricos/i,
    });
    const homeTile = homeTiles.find((link) =>
      link.getAttribute('href')?.startsWith('/productos?categoria='),
    );
    expect(homeTile).toHaveAttribute(
      'href',
      '/productos?categoria=perifericos',
    );
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
