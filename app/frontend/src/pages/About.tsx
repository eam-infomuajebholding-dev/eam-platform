import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import PageSection from '@/components/page/PageSection';
import PageSectionHeader from '@/components/page/PageSectionHeader';
import PageStatGrid from '@/components/page/PageStatGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MessageKey } from '@/i18n/messages';
import { Award, Building2, CheckCircle, Eye, TrendingUp, Users } from 'lucide-react';

const commitmentKeys: MessageKey[] = [
  'page.about.commitments.1',
  'page.about.commitments.2',
  'page.about.commitments.3',
  'page.about.commitments.4',
  'page.about.commitments.5',
];

const valueKeys = [
  { icon: Award, titleKey: 'page.about.values.1.title' as MessageKey, descKey: 'page.about.values.1.desc' as MessageKey },
  { icon: Eye, titleKey: 'page.about.values.2.title' as MessageKey, descKey: 'page.about.values.2.desc' as MessageKey },
  { icon: TrendingUp, titleKey: 'page.about.values.3.title' as MessageKey, descKey: 'page.about.values.3.desc' as MessageKey },
];

const aboutStats = [
  { icon: TrendingUp, value: '20+', labelKey: 'page.about.values.3.title' as MessageKey },
  { icon: Building2, value: '200+', labelKey: 'page.invest.stats.projects' as MessageKey },
  { icon: Users, value: '16+', labelKey: 'page.services.stat.sectors' as MessageKey },
];

export default function About() {
  const { t } = useLanguage();

  return (
    <Layout>
      <PageHero
        titleKey="page.about.hero.title"
        subtitleKey="page.about.hero.subtitle"
        titleEditableId="about-hero-title"
        subtitleEditableId="about-hero-desc"
      />

      <PageSection variant="muted" className="py-10 md:py-14">
        <PageStatGrid stats={aboutStats} columns={3} />
      </PageSection>

      <PageSection variant="cream">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-soft-border/70 bg-cream p-8 shadow-gold-card dark:bg-surface md:p-12">
            <p
              data-editable-id="about-intro-text"
              className="text-lead mb-8 md:text-xl"
            >
              {t('page.about.intro')}
            </p>

            <PageSectionHeader
              title={t('page.about.commitments.title')}
              center={false}
              className="mb-6"
            />
            <ul className="space-y-4">
              {commitmentKeys.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-gold-500" />
                  <span className="text-body md:text-lg">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      <PageSection variant="alt" withGlow>
        <PageSectionHeader titleKey="page.about.values.title" />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {valueKeys.map((value) => (
            <div
              key={value.titleKey}
              className="group rounded-2xl border border-soft-border/60 bg-cream-light p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/70 hover:shadow-gold-card dark:bg-surface"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-50 transition-colors duration-300 group-hover:bg-gold-100 dark:bg-gold/10">
                <value.icon className="h-10 w-10 text-gold-600 dark:text-gold-400" />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-gold-700 dark:text-gold-300">
                {t(value.titleKey)}
              </h3>
              <p className="text-body text-sm">{t(value.descKey)}</p>
            </div>
          ))}
        </div>
      </PageSection>
    </Layout>
  );
}
