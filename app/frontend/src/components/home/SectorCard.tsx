import { Link } from 'react-router-dom';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getSectorImageAsset } from '@/config/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SectorDefinition } from '@/data/sectors';
import { sectorMessageKey } from '@/i18n/homeMessages';

type Props = {
  sector: SectorDefinition;
  className?: string;
};

export default function SectorCard({ sector, className = '' }: Props) {
  const { t } = useLanguage();
  const Icon = sector.icon;
  const image = getSectorImageAsset(sector.imageKey);
  const title = t(sectorMessageKey(sector.slug));
  const label = `${String(sector.number).padStart(2, '0')} ${title}`;

  return (
    <Link
      to={sector.route}
      aria-label={label}
      className={`group flex h-[224px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[18px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--eam-home-gold)] hover:shadow-[0_6px_18px_rgba(198,138,42,0.18)] motion-reduce:transform-none motion-reduce:transition-none dark:bg-surface sm:h-[256px] sm:w-[320px] lg:h-[288px] lg:w-[380px] ${className}`}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white dark:bg-surface-muted">
        <ResponsiveImage
          asset={image}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
        />
      </div>
      <div className="flex h-[40px] shrink-0 items-center gap-2 border-t border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] px-2.5 dark:border-gold/20 dark:bg-surface sm:h-[42px]">
        <span className="text-[10px] font-bold text-[var(--eam-home-gold-deep)]">
          {String(sector.number).padStart(2, '0')}
        </span>
        <Icon
          size={16}
          className="shrink-0 text-[var(--eam-home-gold-deep)] dark:text-[var(--eam-home-gold)]"
          strokeWidth={1.75}
        />
        <p className="min-w-0 flex-1 truncate text-[11px] font-bold text-[var(--eam-home-ink)] group-hover:text-[var(--eam-home-gold-deep)] dark:text-white dark:group-hover:text-[var(--eam-home-gold-soft)] sm:text-xs">
          {title}
        </p>
      </div>
    </Link>
  );
}
