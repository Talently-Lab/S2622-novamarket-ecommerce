import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';
import type { Role } from '../types/auth.ts';

interface PrivateRouteProps {
  roles?: Role[];
}

export default function PrivateRoute({ roles }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-slate-600">Loading session...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
