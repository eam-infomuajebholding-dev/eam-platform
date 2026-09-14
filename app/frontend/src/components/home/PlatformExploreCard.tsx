import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getSectorImageAsset } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SectorDefinition } from '@/data/sectors';
import { sectorDescMessageKey, sectorMessageKey } from '@/i18n/homeMessages';

type Props = {
  sector: SectorDefinition;
};

export default function PlatformExploreCard({ sector }: Props) {
  const { t } = useLanguage();
  const Icon = sector.icon;
  const image = getSectorImageAsset(sector.imageKey);
  const title = t(sectorMessageKey(sector.slug));
  const description = t(sectorDescMessageKey(sector.slug));
  const label = `${String(sector.number).padStart(2, '0')} ${title}`;

  return (
    <Link
      to={sector.route}
      aria-label={label}
      data-sector-slug={sector.slug}
      className="home-platform-card group"
    >
      <div className="home-platform-card__media">
        <ResponsiveImage
          asset={image}
          className="home-platform-card__image"
          loading="lazy"
        />
        <div className="home-platform-card__media-overlay" aria-hidden="true" />
        <span className="home-platform-card__index">{String(sector.number).padStart(2, '0')}</span>
        <span className="home-platform-card__icon-wrap">
          <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>

      <div className="home-platform-card__body">
        <h3 className="home-platform-card__title">{title}</h3>
        <p className="home-platform-card__desc">{description}</p>
        <span className="home-platform-card__cta">
          {t('platforms.explore')}
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
