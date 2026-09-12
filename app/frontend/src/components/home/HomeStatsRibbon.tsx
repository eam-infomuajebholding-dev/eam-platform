/** Qualitative trust pillars — no unverified numeric claims (WO-021 B13) */
const TRUST_PILLARS = [
  { label: 'تميّز هندسي', detail: 'معايير مهنية في كل مسار' },
  { label: 'مصداقية', detail: 'شفافية في التوجيه والمتابعة' },
  { label: 'استدامة', detail: 'قرارات تخدم الأثر طويل المدى' },
  { label: 'ابتكار', detail: 'ذكاء EAM يوجّه الرحلة من البداية' },
];

export default function HomeStatsRibbon() {
  return (
    <section
      className="home-stats-ribbon mt-3 overflow-hidden rounded-[14px] border border-[var(--eam-home-border)] bg-[#2B2118] px-3 py-2.5 text-white sm:px-4"
      aria-label="قيم المنصة"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs font-medium text-[var(--eam-home-gold-soft)] sm:text-right">
          مشاريع أكبر… أثر أعمق… مستقبل مستدام
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-5">
          {TRUST_PILLARS.map((pillar) => (
            <div key={pillar.label} className="text-center sm:text-right">
              <p className="text-xs font-bold text-[var(--eam-home-gold-soft)]">{pillar.label}</p>
              <p className="mt-0.5 text-[10px] text-white/65">{pillar.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
