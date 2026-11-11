import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage.tsx';

vi.mock('../context/AuthContext.tsx', () => ({
  useAuth: () => ({ user: null, loading: false, login: vi.fn() }),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage password visibility', () => {
  it('shows the password by default as masked input', () => {
    renderLogin();

    const password = screen.getByLabelText('Contraseña');
    expect(password).toHaveAttribute('type', 'password');
  });

  it('toggles the password visibility with the eye button', async () => {
    const user = userEvent.setup();
    renderLogin();

    const password = screen.getByLabelText('Contraseña');
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(password).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Ocultar contraseña' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(password).toHaveAttribute('type', 'password');
  });
});
