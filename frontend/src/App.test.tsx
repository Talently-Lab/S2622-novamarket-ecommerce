import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubCatalogFetch() {
  const payload = {
    ok: true,
    message: 'Operación exitosa',
    data: [
      {
        _id: 'mongo-id-1',
        nombre: 'Auriculares NovaSound X1',
        descripcion: 'Auriculares inalambricos over-ear',
        precio: 45999.9,
        stock: 24,
        categoria: 'accesorios',
        imagenUrl: 'https://example.com/x1.png',
      },
      {
        _id: 'mongo-id-2',
        nombre: 'Mouse Gamer NovaTech',
        descripcion: 'Mouse optico para gaming',
        precio: 18500.0,
        stock: 40,
        categoria: 'perifericos',
        imagenUrl: 'https://example.com/mouse.png',
      },
    ],
  };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
}

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

  it('renders the API-backed product catalog on /productos', async () => {
    stubCatalogFetch();
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
    expect(await screen.findAllByRole('img')).toHaveLength(2);
  });
});
