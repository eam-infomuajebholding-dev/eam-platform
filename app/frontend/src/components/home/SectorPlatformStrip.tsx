import HorizontalMarquee from '@/components/home/HorizontalMarquee';
import SectorCard from '@/components/home/SectorCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { SECTOR_DEFINITIONS } from '@/data/sectors';

export default function SectorPlatformStrip() {
  const { t } = useLanguage();

  return (
    <section className="home-sector-rail overflow-hidden" aria-label={t('sectors.aria')}>
      <div className="home-rail-header">
        <h2>{t('sectors.title')}</h2>
        <p>{t('sectors.subtitle')}</p>
      </div>
      <HorizontalMarquee speed={0.32} trackClassName="flex w-max gap-3 px-0.5">
        {SECTOR_DEFINITIONS.map((sector) => (
          <SectorCard key={sector.slug} sector={sector} />
        ))}
      </HorizontalMarquee>
    </section>
  );
}
