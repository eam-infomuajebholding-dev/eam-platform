import { Link } from 'react-router-dom';
import type { MetricValue } from '../types';
import TruthStateBadge from './TruthStateBadge';

export default function MetricCard({
  metric,
  onEvidenceClick,
}: {
  metric: MetricValue;
  onEvidenceClick?: (metricId: string) => void;
}) {
  const display =
    metric.truth_state && metric.truth_state !== 'LIVE' && metric.value == null
      ? '—'
      : metric.value ?? '—';

  const body = (
    <div className="rounded-2xl border border-gold/15 bg-cream-light/80 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-tajawal text-sm text-ink/70 dark:text-white/70">{metric.label_ar}</p>
        <div className="flex items-center gap-2">
          {onEvidenceClick ? (
            <button
              type="button"
              onClick={() => onEvidenceClick(metric.metric_id)}
              className="font-tajawal text-[11px] text-gold underline"
            >
              دليل
            </button>
          ) : null}
          <TruthStateBadge state={metric.truth_state} />
        </div>
      </div>
      <p className="font-tajawal text-2xl font-bold text-ink dark:text-white">{display}</p>
      {metric.context ? (
        <p className="mt-1 font-tajawal text-xs text-ink/50 dark:text-white/50">{metric.context}</p>
      ) : null}
    </div>
  );

  if (metric.drill_down_path) {
    return (
      <Link to={metric.drill_down_path} className="block transition hover:opacity-90">
        {body}
      </Link>
    );
  }
  return body;
}
