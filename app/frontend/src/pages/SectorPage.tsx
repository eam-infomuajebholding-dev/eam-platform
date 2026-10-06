import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageSection from '@/components/page/PageSection';
import PageSectionHeader from '@/components/page/PageSectionHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSectorBySlug, SECTOR_DEFINITIONS } from '@/data/sectors';
import { getSectorJourney } from '@/data/sectorJourneys';
import { sectorDescMessageKey, sectorMessageKey } from '@/i18n/homeMessages';
import { ArrowLeft, Layers, Route } from 'lucide-react';

export default function SectorPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const sector = slug ? getSectorBySlug(slug) : undefined;

  if (!sector) {
    return (
      <Layout>
        <PageSection variant="cream">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="font-display text-display-sm text-ink">{t('page.sector.notFound')}</h1>
            <Link to="/" className="mt-6 inline-block text-deep-gold hover:underline">
              {t('common.backHome')}
            </Link>
          </div>
        </PageSection>
      </Layout>
    );
  }

  const Icon = sector.icon;
  const journeyCta = getSectorJourney(sector.slug);

  return (
    <Layout>
      <section
        className="eam-page-hero min-h-[320px]"
        data-page-section="hero"
        data-section-label="البطل"
      >
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div
              className="mb-8 h-48 overflow-hidden rounded-2xl border border-soft-border/70 shadow-gold-card md:h-56"
              style={{ background: sector.imagePlaceholder }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-sm font-bold text-deep-gold shadow-gold-sm">
                {sector.number}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 dark:bg-gold/10">
                <Icon size={24} className="text-gold-600 dark:text-gold-400" />
              </span>
              <h1 className="gold-text font-display text-display-md md:text-display-xl">
                {t(sectorMessageKey(sector.slug))}
              </h1>
            </div>
            <p className="text-lead mt-4 max-w-3xl">{t(sectorDescMessageKey(sector.slug))}</p>
          </div>
        </div>
      </section>

      <PageSection variant="muted" className="py-10 md:py-14" sectionId="stats" sectionLabel="إحصائيات">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-soft-border/60 bg-cream px-5 py-6 text-center dark:bg-surface">
            <Layers className="mx-auto mb-3 h-6 w-6 text-gold-500" strokeWidth={1.75} />
            <p className="font-display text-3xl font-semibold text-gold-600 dark:text-gold-300">
              {sector.number}
            </p>
            <p className="text-caption mt-1">{t('page.services.stat.sectors')}</p>
          </div>
          <div className="rounded-2xl border border-soft-border/60 bg-cream px-5 py-6 text-center dark:bg-surface">
            <Route className="mx-auto mb-3 h-6 w-6 text-gold-500" strokeWidth={1.75} />
            <p className="font-display text-3xl font-semibold text-gold-600 dark:text-gold-300">
              {journeyCta ? '1' : '—'}
            </p>
            <p className="text-caption mt-1">{t('page.services.stat.journeys')}</p>
          </div>
        </div>
      </PageSection>

      <PageSection variant="cream" sectionId="journey" sectionLabel="ابدأ الرحلة">
        <div className="mx-auto max-w-3xl">
          <PageSectionHeader
            titleKey="page.services.startJourney"
            subtitleKey="page.sector.body"
            center={false}
          />
          <div className="rounded-2xl border border-soft-border/70 bg-cream p-8 shadow-gold-card dark:bg-surface">
            <div className="flex flex-wrap gap-3">
              {journeyCta ? (
                <Link to={journeyCta.to} className="eam-btn-primary inline-block">
                  {t(journeyCta.labelKey)}
                </Link>
              ) : null}
              <Link to="/services" className="eam-btn-outline inline-block">
                {t('page.services.explore')}
              </Link>
              {sector.route.startsWith('/services/') ? (
                <Link
                  to={sector.route}
                  className="inline-block rounded-xl border border-soft-border px-5 py-2.5 text-sm font-semibold text-ink-secondary transition hover:border-gold-300 hover:bg-gold-50"
                >
                  {t('common.learnMore')}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-10">
            <p className="text-label mb-4">{t('page.services.grid.subtitle')}</p>
            <div className="flex flex-wrap gap-2">
              {SECTOR_DEFINITIONS.slice(0, 8).map((s) => (
                <Link
                  key={s.slug}
                  to={`/sectors/${s.slug}`}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    s.slug === sector.slug
                      ? 'border-gold-400 bg-gold-50 text-gold-700 dark:bg-gold/10 dark:text-gold-300'
                      : 'border-soft-border text-ink-secondary hover:border-gold-300 hover:bg-gold-50'
                  }`}
                >
                  {t(sectorMessageKey(s.slug))}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/"
            className="mt-10 inline-flex items-center gap-2 text-deep-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('common.backHome')}
          </Link>
        </div>
      </PageSection>
    </Layout>
  );
}
