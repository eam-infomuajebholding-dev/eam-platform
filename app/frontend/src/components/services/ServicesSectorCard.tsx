import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getSectorImageAsset } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SectorDefinition } from '@/data/sectors';
import { getSectorJourney } from '@/data/sectorJourneys';
import { sectorDescMessageKey, sectorMessageKey } from '@/i18n/homeMessages';

type ServicesSectorCardProps = {
  sector: SectorDefinition;
};

export default function ServicesSectorCard({ sector }: ServicesSectorCardProps) {
  const { t } = useLanguage();
  const Icon = sector.icon;
  const image = getSectorImageAsset(sector.imageKey);
  const title = t(sectorMessageKey(sector.slug));
  const description = t(sectorDescMessageKey(sector.slug));
  const journey = getSectorJourney(sector.slug);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-soft-border/70 bg-cream-light shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/80 hover:shadow-gold-lg dark:bg-surface">
      <Link to={sector.route} className="relative block aspect-[16/10] overflow-hidden bg-cream-soft">
        <ResponsiveImage
          asset={image}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className="text-label absolute start-4 top-4 rounded-full bg-cream-light/95 px-2.5 py-1 backdrop-blur-sm dark:bg-surface/90">
          {String(sector.number).padStart(2, '0')}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 dark:bg-gold/10">
            <Icon className="h-5 w-5 text-gold-600 dark:text-gold-300" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-semibold leading-snug text-ink">
            <Link to={sector.route} className="transition-colors hover:text-deep-gold">
              {title}
            </Link>
          </h3>
        </div>

        <p className="text-caption mb-5 flex-1 leading-relaxed">{description}</p>

        <div className="flex flex-wrap items-center gap-2 border-t border-soft-border/50 pt-4">
          <Link
            to={sector.route}
            className="inline-flex items-center gap-1.5 rounded-lg border border-soft-border px-3 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:border-gold-300 hover:bg-gold-50 dark:hover:bg-gold/10"
          >
            {t('page.services.explore')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          {journey ? (
            <Link
              to={journey.to}
              className="gold-gradient inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t('page.services.startJourney')}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
