import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext.tsx';
import { ApiError } from '../services/api.ts';
import * as authService from '../services/authService.ts';
import type { User } from '../types/auth.ts';
import PrivateRoute from '../routes/PrivateRoute.tsx';

vi.mock('../services/authService.ts', () => ({
  me: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const mockedMe = vi.mocked(authService.me);
const mockedLogin = vi.mocked(authService.login);

const TOKEN_KEY = 'novamarket_token';
const USER_KEY = 'novamarket_user';

const storedUser: User = {
  id: 'abc123',
  name: 'Ana Pérez',
  email: 'ana@example.com',
  role: 'cliente',
};

function seedSession(user: User = storedUser, token = 'valid-token'): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Minimal probe that exposes the auth state for assertions. */
function Probe() {
  const { user, token, loading, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="user">{user ? user.email : 'null'}</p>
      <p data-testid="token">{token ?? 'null'}</p>
      <button
        type="button"
        onClick={() => void login('ana@example.com', 'ClaveSegura1')}
      >
        entrar
      </button>
      <button type="button" onClick={() => logout()}>
        salir
      </button>
    </div>
  );
}

function renderWithProvider() {
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthContext session restore (SN-98)', () => {
  it('sin token guardado termina con loading=false, user=null y nunca llama a me', async () => {
    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    );
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(mockedMe).not.toHaveBeenCalled();
  });

  it('con token valido muestra loading=true durante la consulta y restaura el usuario', async () => {
    seedSession();
    let resolveMe!: (user: User) => void;
    mockedMe.mockImplementation(
      () =>
        new Promise<User>((resolve) => {
          resolveMe = resolve;
        }),
    );

    renderWithProvider();

    // Render intermedio observable: la consulta sigue pendiente.
    expect(mockedMe).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    resolveMe(storedUser);

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    );
    expect(screen.getByTestId('user')).toHaveTextContent('ana@example.com');
    expect(screen.getByTestId('token')).toHaveTextContent('valid-token');
  });

  it('con token invalido limpia localStorage y deja user=null con loading=false', async () => {
    seedSession();
    mockedMe.mockRejectedValueOnce(new ApiError('Invalid session', 401));

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    );
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('login persiste token+user y logout limpia ambas keys y deja user=null', async () => {
    const loggedUser: User = { ...storedUser, id: 'nuevo1' };
    mockedLogin.mockResolvedValueOnce({
      user: loggedUser,
      token: 'nuevo-token',
    });
    const user = userEvent.setup();

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    );

    await user.click(screen.getByRole('button', { name: 'entrar' }));

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('ana@example.com'),
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBe('nuevo-token');
    expect(localStorage.getItem(USER_KEY)).toBe(JSON.stringify(loggedUser));

    await user.click(screen.getByRole('button', { name: 'salir' }));

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('null'),
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('PrivateRoute con user=null y loading=false redirige a /login', async () => {
    render(
      <MemoryRouter initialEntries={['/privada']}>
        <AuthProvider>
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path="/privada" element={<p>Contenido privado</p>} />
            </Route>
            <Route path="/login" element={<p>Página login</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Página login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });
});
