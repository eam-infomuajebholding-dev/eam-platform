import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageMeta from '@/components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <Layout>
      <PageMeta title={`${t('site.notFound.title')} — EAM`} noIndex />
      <section className="py-24">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <p className="text-6xl font-bold text-gold/30">404</p>
          <h1 className="mt-4 text-2xl font-bold text-ink dark:text-white">{t('site.notFound.title')}</h1>
          <p className="mt-3 text-ink-secondary">{t('site.notFound.body')}</p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-white"
          >
            {t('common.backHome')}
          </Link>
        </div>
      </section>
    </Layout>
  );
}
