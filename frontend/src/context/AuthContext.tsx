import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AuthState, User } from '../types/auth.ts';
import { TOKEN_STORAGE_KEY } from '../services/api.ts';
import * as authService from '../services/authService.ts';

const USER_STORAGE_KEY = 'novamarket_user';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!token || !rawUser) return { user: null, token: null };
    return { user: JSON.parse(rawUser) as User, token };
  } catch {
    return { user: null, token: null };
  }
}

function persistSession(user: User, token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      const stored = readStoredSession();
      if (!stored.token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const restored = await authService.me(stored.token);
        if (cancelled) return;
        setUser(restored);
        setToken(stored.token);
      } catch {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    persistSession(result.user, result.token);
    setUser(result.user);
    setToken(result.token);
    return result.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await authService.register(name, email, password);
      persistSession(result.user, result.token);
      setUser(result.user);
      setToken(result.token);
      return result.user;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
