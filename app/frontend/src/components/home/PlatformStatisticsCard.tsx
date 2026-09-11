const METRICS = [
  { label: 'سنة خبرة', value: '+15' },
  { label: 'معدل رضا العملاء', value: '+98%' },
  { label: 'مستثمر وخبير', value: '+120' },
  { label: 'مشروع مميز', value: '+250' },
];

export default function PlatformStatisticsCard() {
  return (
    <section
      className="eam-panel flex h-auto flex-col overflow-hidden lg:h-[320px] lg:shrink-0"
      aria-label="إحصائيات المنصة"
    >
      <div className="flex h-[32px] shrink-0 items-center border-b border-[var(--eam-home-border)] px-3">
        <h2 className="font-tajawal text-[14px] font-bold text-[var(--eam-home-ink)]">إحصائيات المنصة</h2>
      </div>

      <div className="flex h-[68px] shrink-0 items-stretch divide-x divide-x-reverse divide-[var(--eam-home-border)]/80 px-1.5 pt-0.5">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-1 flex-col items-center justify-center px-0.5 py-1 text-center"
          >
            <p className="font-playfair text-[21px] font-bold leading-none text-[var(--eam-home-gold-deep)] lg:text-[23px]">
              {metric.value}
            </p>
            <p className="mt-0.5 text-[9px] font-medium leading-tight text-[var(--eam-home-ink)]/68">
              {metric.label}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mx-1.5 mb-1.5 mt-0.5 flex-1 overflow-hidden rounded-[12px] border border-[var(--eam-home-border)]/60 bg-[#2B2118]/[0.04]">
        <img
          src="/images/world-map.svg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-90"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
