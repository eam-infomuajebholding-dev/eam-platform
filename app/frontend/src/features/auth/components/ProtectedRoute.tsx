import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { saveAuthReturnTo } from '@/features/auth/utils/authReturnTo';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    saveAuthReturnTo(returnTo);
    const loginTarget = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    return <Navigate to={loginTarget} replace state={{ from: returnTo }} />;
  }

  return <>{children}</>;
}
