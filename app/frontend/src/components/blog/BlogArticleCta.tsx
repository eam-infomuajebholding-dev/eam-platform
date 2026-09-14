import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BlogArticleCta() {
  const { t } = useLanguage();

  return (
    <section className="mt-12 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 p-8 text-center">
      <h2 className="font-display text-2xl font-bold text-ink">
        {t('blog.cta.title')}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-ink-secondary">
        {t('blog.cta.body')}
      </p>
      <Link
        to="/consultation"
        className="mt-6 inline-block rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-3 font-bold text-dark transition-all hover:scale-[1.02] hover:shadow-gold-sm"
      >
        {t('blog.cta.button')}
      </Link>
    </section>
  );
}
