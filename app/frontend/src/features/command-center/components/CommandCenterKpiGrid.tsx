import { Link } from 'react-router-dom';
import { Area, AreaChart } from 'recharts';
import TruthStateBadge from '@/features/command-center/components/TruthStateBadge';
import {
  changeForMetric,
  trendLabel,
} from '@/features/command-center/lib/dashboardUtils';
import type { ChangeItem, MetricValue } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

function MiniTrendSparkline({ direction }: { direction: ChangeItem['direction'] | undefined }) {
  const points =
    direction === 'up'
      ? [
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 1 },
        ]
      : direction === 'down'
        ? [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ]
        : [
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
          ];

  return (
    <div className="h-10 w-20 opacity-80">
      <AreaChart width={80} height={40} data={points}>
        <Area
          type="monotone"
          dataKey="y"
          stroke="#c9a227"
          fill="rgba(201, 162, 39, 0.18)"
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  );
}

type Props = {
  metrics: MetricValue[];
  changes?: ChangeItem[];
  onEvidenceClick?: (metricId: string) => void;
};

export default function CommandCenterKpiGrid({ metrics, changes, onEvidenceClick }: Props) {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {metrics.map((metric) => {
        const change = changeForMetric(changes, metric.metric_id);
        const trend = trendLabel(change?.direction, locale);
        const display =
          metric.truth_state && metric.truth_state !== 'LIVE' && metric.value == null
            ? '—'
            : metric.value ?? '—';

        const body = (
          <div className="rounded-2xl border border-gold/15 bg-cream-light/80 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-sm text-ink/70 dark:text-white/70">{metric.label_ar}</p>
              <div className="flex items-center gap-2">
                {onEvidenceClick ? (
                  <button
                    type="button"
                    onClick={() => onEvidenceClick(metric.metric_id)}
                    className="text-[11px] text-gold underline"
                  >
                    {t('commandCenter.metric.evidence')}
                  </button>
                ) : null}
                <TruthStateBadge state={metric.truth_state} />
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-ink dark:text-white">{display}</p>
                {metric.context ? (
                  <p className="mt-1 text-xs text-ink/50 dark:text-white/50">{metric.context}</p>
                ) : null}
                {trend ? (
                  <span
                    className={cn(
                      'mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
                      change?.direction === 'up' && 'bg-emerald-100 text-emerald-800',
                      change?.direction === 'down' && 'bg-red-100 text-red-800',
                      change?.direction === 'flat' && 'bg-slate-100 text-slate-700',
                    )}
                  >
                    {trend}
                  </span>
                ) : null}
              </div>
              {change ? <MiniTrendSparkline direction={change.direction} /> : null}
            </div>
          </div>
        );

        if (metric.drill_down_path) {
          return (
            <Link key={metric.metric_id} to={metric.drill_down_path} className="block transition hover:opacity-90">
              {body}
            </Link>
          );
        }

        return <div key={metric.metric_id}>{body}</div>;
      })}
    </div>
  );
}
