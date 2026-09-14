import { useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { client } from '@/lib/api';
import { saveAuthReturnTo } from '@/features/auth/utils/authReturnTo';

/** Anonymous journey hint with optional sign-in (preserves return URL). */
export default function JourneyOptionalLoginHint() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (user) return null;

  return (
    <p className="mb-4 text-xs text-ink/50 dark:text-white/50">
      {t('journey.anonymousHint')}{' '}
      <button
        type="button"
        className="text-gold underline"
        onClick={() => {
          saveAuthReturnTo(`${location.pathname}${location.search}`);
          void client.auth.toLogin();
        }}
      >
        {t('auth.optionalLogin')}
      </button>
      .
    </p>
  );
}
