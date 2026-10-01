import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { persistWebSdkToken, readCallbackToken } from '@/features/auth/api/auth';
import { consumeAuthReturnTo } from '@/features/auth/utils/authReturnTo';
import { stripTokenFromBrowserUrl } from '@/features/auth/utils/authTokenStorage';
import PageMeta from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    async function run() {
      const token = readCallbackToken();
      if (!token || !persistWebSdkToken(token)) {
        navigate('/auth/error', { replace: true });
        return;
      }
      stripTokenFromBrowserUrl();

      await refetch();
      const returnTo = consumeAuthReturnTo();
      navigate(returnTo ?? '/', { replace: true });
    }

    void run();
  }, [navigate, refetch]);

  return (
    <>
      <PageMeta title={t('auth.processing')} noIndex />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-ink-secondary">{t('auth.processing')}</p>
        </div>
      </div>
    </>
  );
}
