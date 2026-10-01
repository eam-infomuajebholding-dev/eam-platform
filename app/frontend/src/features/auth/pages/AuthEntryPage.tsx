import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import PageMeta from '@/components/PageMeta';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchAuthConfig } from '@/features/auth/api/authConfig';
import { saveAuthReturnTo } from '@/features/auth/utils/authReturnTo';
import { startAuthFlow } from '@/features/auth/utils/authStartUrl';
import { useLanguage } from '@/contexts/LanguageContext';

type AuthEntryMode = 'login' | 'register';

export default function AuthEntryPage({ mode }: { mode: AuthEntryMode }) {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnTo = useMemo(() => {
    const raw = searchParams.get('returnTo') ?? searchParams.get('return_to');
    if (raw?.startsWith('/') && !raw.startsWith('//')) {
      return raw;
    }
    return '/my-requests';
  }, [searchParams]);

  const configQuery = useQuery({
    queryKey: ['auth', 'config'],
    queryFn: fetchAuthConfig,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!loading && user) {
      navigate(returnTo, { replace: true });
    }
  }, [loading, user, navigate, returnTo]);

  const title = mode === 'login' ? t('auth.login') : t('auth.signup');
  const oidcReady = configQuery.data?.oidc_configured !== false;

  const handleContinue = () => {
    saveAuthReturnTo(returnTo);
    startAuthFlow(mode, returnTo);
  };

  return (
    <Layout>
      <PageMeta title={`${title} | EAM`} noIndex />
      <section className="py-16 md:py-24 bg-cream-light dark:bg-background min-h-[70vh]" dir="rtl">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="rounded-2xl border border-gold/25 bg-cream dark:bg-dark p-8 shadow-sm space-y-6">
            <header className="space-y-2 text-center">
              <h1 className="text-2xl font-bold font-display gold-text">{title}</h1>
              <p className="text-sm text-ink-secondary leading-relaxed">{t('auth.entry.subtitle')}</p>
            </header>

            <ul className="text-sm text-ink-secondary space-y-2 list-disc list-inside">
              <li>{t('auth.entry.benefitContinuity')}</li>
              <li>{t('auth.entry.benefitSecurity')}</li>
              <li>{t('auth.entry.benefitRequests')}</li>
            </ul>

            {!configQuery.isLoading && !oidcReady ? (
              <p className="rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                {t('auth.entry.oidcUnavailable')}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!oidcReady || configQuery.isLoading}
              onClick={handleContinue}
              className="w-full rounded-xl bg-gold py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {mode === 'login' ? t('auth.entry.continueLogin') : t('auth.entry.continueRegister')}
            </button>

            <p className="text-xs text-center text-ink-secondary leading-relaxed">
              {t('auth.entry.legalNotice')}
            </p>

            <div className="text-center text-sm">
              {mode === 'login' ? (
                <Link to={`/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="text-gold font-semibold">
                  {t('auth.entry.switchToRegister')}
                </Link>
              ) : (
                <Link to={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="text-gold font-semibold">
                  {t('auth.entry.switchToLogin')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
