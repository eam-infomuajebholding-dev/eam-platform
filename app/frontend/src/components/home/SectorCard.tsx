import { Link } from 'react-router-dom';
import type { SectorDefinition } from '@/data/sectors';
import {
  getSectorImage,
  getSectorObjectPosition,
  hasApprovedSectorArtwork,
} from '@/data/homeAssets';

type Props = {
  sector: SectorDefinition;
  className?: string;
};

export default function SectorCard({ sector, className = '' }: Props) {
  const Icon = sector.icon;
  const approvedArt = hasApprovedSectorArtwork(sector.slug);
  const imageSrc = getSectorImage(sector.slug);
  const label = `${String(sector.number).padStart(2, '0')} ${sector.title}`;

  if (approvedArt && imageSrc) {
    return (
      <Link
        to={sector.route}
        aria-label={label}
        className={`group relative flex h-[210px] w-[148px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--eam-home-gold)] hover:shadow-[0_6px_18px_rgba(198,138,42,0.18)] motion-reduce:transform-none motion-reduce:transition-none ${className}`}
      >
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
          style={{ objectPosition: getSectorObjectPosition(sector.slug) }}
          loading="lazy"
          decoding="async"
        />
      </Link>
    );
  }

  return (
    <Link
      to={sector.route}
      aria-label={label}
      className={`group relative flex h-[210px] w-[148px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--eam-home-gold)] hover:shadow-[0_6px_18px_rgba(198,138,42,0.18)] motion-reduce:transform-none motion-reduce:transition-none ${className}`}
    >
      <div
        className="relative h-[178px] w-full overflow-hidden"
        style={{ background: sector.imagePlaceholder }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2118]/85 via-[#2B2118]/15 to-transparent" />
        <span className="absolute right-2 top-2 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/95 text-[9px] font-bold text-[var(--eam-home-gold-deep)]">
          {String(sector.number).padStart(2, '0')}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[32px] items-center gap-1.5 bg-[#2B2118]/88 px-2">
        <Icon size={16} className="shrink-0 text-[var(--eam-home-gold)]" strokeWidth={1.75} />
        <p className="line-clamp-2 text-[11px] font-bold leading-tight text-white group-hover:text-[var(--eam-home-gold-soft)]">
          {sector.title}
        </p>
      </div>
    </Link>
  );
}
