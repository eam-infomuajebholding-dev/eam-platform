import { Navigate, useLocation } from 'react-router-dom';
import { LogIn, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { client } from '@/lib/api';
import { saveAuthReturnTo } from '@/features/auth/utils/authReturnTo';
import LoadingSpinner from '@/components/LoadingSpinner';

type ProtectedCommandCenterRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedCommandCenterRoute({ children }: ProtectedCommandCenterRouteProps) {
  const location = useLocation();
  const { user, loading, canAccessCommandCenter, commandCenterAccess } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <LoadingSpinner
        message={t('commandCenter.access.verifying')}
        className="bg-[#1a2634] [&_p]:text-white/70"
        spinnerClassName="border-gold"
      />
    );
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    saveAuthReturnTo(returnTo);
    return <Navigate to="/" replace state={{ from: returnTo, commandCenterLogin: true }} />;
  }

  if (!canAccessCommandCenter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-light px-4 dark:bg-background">
        <div className="w-full max-w-md rounded-2xl border border-soft-border bg-white p-8 shadow-lg dark:border-gold/20 dark:bg-surface">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-center text-xl font-bold text-ink">{t('commandCenter.access.deniedTitle')}</h1>
          <p className="mt-3 text-center text-sm leading-7 text-ink-secondary">
            {t('commandCenter.access.deniedBody')}
          </p>
          <div className="mt-4 rounded-xl bg-surface-alt p-3 text-sm dark:bg-surface-muted">
            <div className="flex items-center justify-center gap-2 text-ink-secondary">
              <UserCheck className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <p className="mt-1 text-center text-xs text-ink-muted">
              {t('commandCenter.access.currentRole')}: {user.role}
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                saveAuthReturnTo(`${location.pathname}${location.search}`);
                void client.auth.toLogin();
              }}
              className="eam-btn-primary flex w-full items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              {t('commandCenter.access.switchAccount')}
            </button>
            <button type="button" onClick={() => window.history.back()} className="eam-btn-outline w-full">
              {t('commandCenter.access.goBack')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (commandCenterAccess?.role === 'delegate') {
    return <>{children}</>;
  }

  return <>{children}</>;
}
