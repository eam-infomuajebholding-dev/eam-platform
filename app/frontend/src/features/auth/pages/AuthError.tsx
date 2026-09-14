import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import PageMeta from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AuthErrorPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const errorMessage = searchParams.get('msg') || t('auth.error.title');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <PageMeta title={t('auth.error.title')} noIndex />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cream-soft to-gold-50 p-6 text-center">
        <div className="space-y-6 max-w-md">
          <div className="space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" strokeWidth={1.5} aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-ink">{t('auth.error.title')}</h1>
            <p className="text-base text-muted-foreground">{errorMessage}</p>
            {countdown > 0 ? (
              <p className="text-sm text-ink-muted">
                {t('auth.error.countdown').replace('{seconds}', String(countdown))}
              </p>
            ) : null}
          </div>
          <Button asChild className="px-6">
            <Link to="/">{t('auth.error.returnHome')}</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
