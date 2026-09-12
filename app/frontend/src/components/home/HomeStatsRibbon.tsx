const METRICS = [
  { label: 'سنة خبرة', value: '+15' },
  { label: 'معدل رضا العملاء', value: '+98%' },
  { label: 'مستثمر وخبير', value: '+120' },
  { label: 'مشروع مميز', value: '+250' },
];

/** Compact platform stats — presentation metrics, not financial authority */
export default function HomeStatsRibbon() {
  return (
    <section
      className="home-stats-ribbon mt-3 overflow-hidden rounded-[14px] border border-[var(--eam-home-border)] bg-[#2B2118] px-3 py-2.5 text-white sm:px-4"
      aria-label="مؤشرات المنصة"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs font-medium text-[var(--eam-home-gold-soft)] sm:text-right">
          مشاريع أكبر… أثر أعمق… مستقبل مستدام
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-6">
          {METRICS.map((metric) => (
            <div key={metric.label} className="text-center sm:text-right">
              <p className="font-playfair text-lg font-bold leading-none text-[var(--eam-home-gold-soft)]">
                {metric.value}
              </p>
              <p className="mt-0.5 text-[10px] text-white/70">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
