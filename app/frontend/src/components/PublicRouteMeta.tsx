import { useLocation } from 'react-router-dom';
import PageMeta from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicTitleKey } from '@/lib/publicRouteMeta';

/** Sets document title for public marketing routes (indexable). */
export default function PublicRouteMeta() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const key = publicTitleKey(pathname);
  if (!key) return null;

  const pageTitle = key === 'hero.titleBefore' ? 'EAM' : `${t(key)} — EAM`;
  return <PageMeta title={pageTitle} noIndex={false} />;
}
