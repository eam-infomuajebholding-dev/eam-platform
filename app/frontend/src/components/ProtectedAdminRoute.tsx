import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { saveAuthReturnTo } from '@/features/auth/utils/authReturnTo';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, LogIn } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user, loading, isAdmin, login } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message={t('admin.verifying')} />;
  }

  if (!user) {
    saveAuthReturnTo(`${location.pathname}${location.search}`);
    return <Navigate to="/" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isAdmin) {
    const roleLabel =
      user.role === 'user' ? t('admin.roleRegular') : user.role;

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt">
        <Card className="mx-4 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-ink">{t('admin.deniedTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-ink-secondary">
              <p className="mb-2">{t('admin.deniedBody')}</p>
              <div className="mb-4 rounded-lg bg-surface-alt p-3">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-ink-muted" />
                  <span className="text-ink-secondary">
                    {t('admin.currentAccount')} {user.email}
                  </span>
                </div>
                <div className="mt-1 text-xs text-ink-muted">
                  {roleLabel}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={login} className="w-full" variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                {t('admin.switchAccount')}
              </Button>

              <Button onClick={() => window.history.back()} className="w-full" variant="ghost">
                {t('admin.goBack')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
