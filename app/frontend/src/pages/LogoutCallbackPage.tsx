import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LogoutCallbackPage() {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <PageMeta title={t('auth.logoutSuccess')} noIndex />
      <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-ink">{t('auth.logoutSuccess')}</h1>
          <p className="mt-3 text-ink-secondary">{t('auth.logoutRedirect')}</p>
          <Link to="/" className="mt-6 inline-block text-sm text-gold hover:underline">
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    </>
  );
}
