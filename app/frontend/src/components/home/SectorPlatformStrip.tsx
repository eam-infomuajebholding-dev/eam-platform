import HorizontalMarquee from '@/components/home/HorizontalMarquee';
import SectorCard from '@/components/home/SectorCard';
import { SECTOR_DEFINITIONS } from '@/data/sectors';

export default function SectorPlatformStrip() {
  return (
    <section className="home-sector-rail mt-4 overflow-hidden pt-0.5" aria-label="منصات القطاعات">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <h2 className="font-tajawal text-base font-bold text-[var(--eam-home-ink)] sm:text-lg">
          منصات الأعمال
        </h2>
        <p className="text-[11px] text-[var(--eam-home-ink)]/55">16 قطاعاً — مصدر واحد</p>
      </div>
      <HorizontalMarquee speed={0.32} trackClassName="flex w-max gap-[5px] px-0.5">
        {SECTOR_DEFINITIONS.map((sector) => (
          <SectorCard key={sector.slug} sector={sector} />
        ))}
      </HorizontalMarquee>
    </section>
  );
}
