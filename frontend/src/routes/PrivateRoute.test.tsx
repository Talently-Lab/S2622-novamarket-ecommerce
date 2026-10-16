import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrivateRoute from './PrivateRoute.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import type { Role, User } from '../types/auth.ts';

vi.mock('../context/AuthContext.tsx', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../context/AuthContext.tsx')>();
  return { ...actual, useAuth: vi.fn() };
});

const mockedUseAuth = vi.mocked(useAuth);

const clienteUser: User = {
  id: 'cliente-1',
  name: 'Cliente Prueba',
  email: 'cliente@example.com',
  role: 'cliente',
};

const adminUser: User = {
  id: 'admin-1',
  name: 'Admin Prueba',
  email: 'admin@example.com',
  role: 'admin',
};

function mockAuthState(auth: {
  user: User | null;
  loading: boolean;
}): void {
  mockedUseAuth.mockReturnValue({
    user: auth.user,
    token: auth.user ? 'fake-token' : null,
    loading: auth.loading,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });
}

function renderPrivateTestRoute(roles?: Role[]): void {
  render(
    <MemoryRouter initialEntries={['/privada']}>
      <Routes>
        <Route element={<PrivateRoute roles={roles} />}>
          <Route path="/privada" element={<p>Contenido privado</p>} />
        </Route>
        <Route path="/login" element={<p>Página login</p>} />
        <Route path="/" element={<p>Página inicio</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PrivateRoute (SN-140)', () => {
  it('con loading=true muestra espera y no navega ni a /login ni a la privada (anti-parpadeo SN-98)', () => {
    mockAuthState({ user: null, loading: true });

    renderPrivateTestRoute(['admin']);

    expect(screen.getByText('Loading session...')).toBeInTheDocument();
    expect(screen.queryByText('Página login')).not.toBeInTheDocument();
    expect(screen.queryByText('Página inicio')).not.toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('con loading=false y user=null redirige a /login a nivel componente', async () => {
    mockAuthState({ user: null, loading: false });

    renderPrivateTestRoute(['admin']);

    expect(await screen.findByText('Página login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it("user cliente en ruta con roles={['admin']} rebota a / y no renderiza el Outlet", async () => {
    mockAuthState({ user: clienteUser, loading: false });

    renderPrivateTestRoute(['admin']);

    expect(await screen.findByText('Página inicio')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    expect(screen.queryByText('Página login')).not.toBeInTheDocument();
  });

  it("user admin en ruta con roles={['admin']} renderiza el Outlet", async () => {
    mockAuthState({ user: adminUser, loading: false });

    renderPrivateTestRoute(['admin']);

    expect(await screen.findByText('Contenido privado')).toBeInTheDocument();
    expect(screen.queryByText('Página login')).not.toBeInTheDocument();
    expect(screen.queryByText('Página inicio')).not.toBeInTheDocument();
  });

  it('user cliente en ruta sin roles renderiza el Outlet', async () => {
    mockAuthState({ user: clienteUser, loading: false });

    renderPrivateTestRoute();

    expect(await screen.findByText('Contenido privado')).toBeInTheDocument();
    expect(screen.queryByText('Página login')).not.toBeInTheDocument();
    expect(screen.queryByText('Página inicio')).not.toBeInTheDocument();
  });
});
