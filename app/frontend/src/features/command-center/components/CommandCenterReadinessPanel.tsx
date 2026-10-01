import { useQuery } from '@tanstack/react-query';
import { fetchPlatformReadiness } from '@/features/platform/api/platformReadinessClient';

const OVERALL_AR: Record<string, string> = {
  READY: 'جاهز للإنتاج',
  DEGRADED: 'تشغيلي — integrations ناقصة',
  BLOCKED: 'محجوب — أصلح blockers',
};

export default function CommandCenterReadinessPanel() {
  const query = useQuery({
    queryKey: ['platform', 'readiness'],
    queryFn: fetchPlatformReadiness,
    staleTime: 60_000,
  });

  if (query.isLoading) return null;
  if (query.isError || !query.data) return null;

  const r = query.data;

  return (
    <div className="rounded-xl border border-gold/25 p-4 space-y-3" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">جاهزية التشغيل (Go-live)</h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            r.overall === 'READY'
              ? 'bg-emerald-100 text-emerald-900'
              : r.overall === 'DEGRADED'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-red-100 text-red-900'
          }`}
        >
          {OVERALL_AR[r.overall] ?? r.overall}
        </span>
      </div>
      <p className="text-xs text-ink-secondary">
        Alembic: {r.alembic.aligned ? '✓' : '✗'} · JWT: {r.auth.jwt_configured ? '✓' : '✗'} · OIDC:{' '}
        {r.auth.oidc_configured ? '✓' : '—'} · Stripe checkout: {r.payments.checkout_ready ? '✓' : '—'}
      </p>
      {r.blockers.length > 0 ? (
        <ul className="text-xs space-y-1 text-red-800 dark:text-red-200">
          {r.blockers.map((b) => (
            <li key={b.id}>
              <strong>{b.label_ar}:</strong> {b.detail_ar}
            </li>
          ))}
        </ul>
      ) : null}
      {r.pending_external.length > 0 ? (
        <div className="text-xs">
          <p className="font-semibold mb-1">عند توفر الأسرار — أضف إلى app/.env:</p>
          <ul className="space-y-1 text-ink-secondary">
            {r.pending_external.map((p) => (
              <li key={p.id}>
                {p.label_ar}
                {p.env_keys ? (
                  <span className="block font-mono text-[10px] mt-0.5" dir="ltr">
                    {p.env_keys}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-[10px] text-ink-muted">
        API: GET /api/v1/platform/readiness · docs/operations/GO_LIVE_CHECKLIST.md
      </p>
    </div>
  );
}
