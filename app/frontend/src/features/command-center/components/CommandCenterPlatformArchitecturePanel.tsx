import { useQuery } from '@tanstack/react-query';
import { fetchPlatformArchitecture } from '@/features/platform/api/platformArchitectureClient';

const STATUS_STYLES: Record<string, string> = {
  LIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  PARTIAL: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40',
  PLANNED: 'bg-slate-100 text-slate-700 dark:bg-white/10',
  CMS_ONLY: 'bg-slate-100 text-slate-600',
  BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-950/40',
};

export default function CommandCenterPlatformArchitecturePanel() {
  const query = useQuery({
    queryKey: ['platform', 'architecture'],
    queryFn: fetchPlatformArchitecture,
  });

  if (query.isLoading) {
    return (
      <p className="text-sm text-ink-secondary" dir="rtl">
        جاري تحميل سجل المعمارية...
      </p>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p className="text-sm text-red-600" dir="rtl">
        تعذّر تحميل معمارية المنصة.
      </p>
    );
  }

  const { layer_model, platform_business_services, sectors, summary } = query.data;

  return (
    <section
      id="platform-architecture"
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface"
      dir="rtl"
    >
      <h3 className="text-lg font-bold text-ink dark:text-white">معمارية المنصة (16 قطاعاً)</h3>
      <p className="mt-1 text-sm text-ink-secondary">
        نموذج: {layer_model.join(' → ')} · {summary.live_journey_count} رحلة JOS حية ·{' '}
        {summary.planned_or_blocked_sectors} قطاع بدون رحلة كاملة
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {platform_business_services.map((svc) => (
          <span
            key={svc.id}
            className="rounded-full border border-gold/20 px-2 py-0.5 text-[11px] font-medium"
            title={svc.authority}
          >
            {svc.label_ar}
          </span>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-soft-border text-right">
              <th className="py-2 px-2 font-semibold">#</th>
              <th className="py-2 px-2 font-semibold">القطاع</th>
              <th className="py-2 px-2 font-semibold">الرحلة</th>
              <th className="py-2 px-2 font-semibold">خدمات الأعمال</th>
              <th className="py-2 px-2 font-semibold">كائنات</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map((row) => (
              <tr key={row.sector_slug} className="border-b border-soft-border/60 align-top">
                <td className="py-2 px-2">{row.sector_number}</td>
                <td className="py-2 px-2 font-medium">{row.title_ar}</td>
                <td className="py-2 px-2">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 ${STATUS_STYLES[row.journey_status] ?? ''}`}
                  >
                    {row.journey_status}
                  </span>
                  {row.journey_type ? (
                    <p className="mt-1 font-mono text-[10px]" dir="ltr">
                      {row.journey_type}
                    </p>
                  ) : null}
                  {row.notes_ar ? <p className="mt-1 text-ink-secondary">{row.notes_ar}</p> : null}
                </td>
                <td className="py-2 px-2 max-w-[14rem]">
                  <ul className="list-disc list-inside space-y-0.5 text-ink-secondary">
                    {row.business_services.map((id) => (
                      <li key={id}>{id}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 px-2 text-ink-secondary">{row.business_objects.join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
