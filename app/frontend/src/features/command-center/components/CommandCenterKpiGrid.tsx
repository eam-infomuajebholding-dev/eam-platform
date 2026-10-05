import { Link } from 'react-router-dom';
import { Area, AreaChart } from 'recharts';
import {
  Building2,
  Handshake,
  Star,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  changeForMetric,
  trendLabel,
} from '@/features/command-center/lib/dashboardUtils';
import type { ChangeItem, MetricValue } from '@/features/command-center/types';
import type { CommandCenterMessageKey } from '@/i18n/commandCenterMessages';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const KPI_ICONS: LucideIcon[] = [Building2, Users, Handshake, Star, Target, TrendingUp];

const KPI_EN_LABEL: Partial<Record<string, CommandCenterMessageKey>> = {
  'kpi.active_projects': 'commandCenter.kpi.activeProjectsEn',
  'kpi.active_users': 'commandCenter.kpi.activeUsersEn',
  'kpi.partners': 'commandCenter.kpi.partnersEn',
  'kpi.satisfaction': 'commandCenter.kpi.satisfactionEn',
  'kpi.opportunities': 'commandCenter.kpi.opportunitiesEn',
  'kpi.project_value': 'commandCenter.kpi.projectValueEn',
};

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
    <div className="command-center-kpi__sparkline">
      <AreaChart width={72} height={36} data={points}>
        <Area
          type="monotone"
          dataKey="y"
          stroke="#22c55e"
          fill="rgba(34, 197, 94, 0.15)"
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
    <div className="command-center-kpi-grid">
      {metrics.map((metric, index) => {
        const change = changeForMetric(changes, metric.metric_id);
        const trend = trendLabel(change?.direction, locale);
        const deltaText = metric.context ?? trend;
        const display =
          metric.truth_state && metric.truth_state !== 'LIVE' && metric.value == null
            ? '—'
            : metric.value ?? '—';
        const Icon = KPI_ICONS[index % KPI_ICONS.length];
        const enKey = KPI_EN_LABEL[metric.metric_id];
        const primaryLabel = language === 'ar' ? metric.label_ar : enKey ? t(enKey) : metric.label_ar;
        const secondaryLabel = language === 'ar' ? (enKey ? t(enKey) : '') : metric.label_ar;

        const body = (
          <div className="command-center-kpi">
            <div className="command-center-kpi__head">
              <span className="command-center-kpi__icon-wrap">
                <Icon size={18} strokeWidth={1.75} aria-hidden />
              </span>
              {onEvidenceClick ? (
                <button
                  type="button"
                  onClick={() => onEvidenceClick(metric.metric_id)}
                  className="command-center-kpi__evidence sr-only"
                >
                  evidence
                </button>
              ) : null}
            </div>
            <p className="command-center-kpi__value">{display}</p>
            <p className="command-center-kpi__label">{primaryLabel}</p>
            {secondaryLabel ? (
              <p className="command-center-kpi__label-secondary">{secondaryLabel}</p>
            ) : null}
            <div className="command-center-kpi__foot">
              {deltaText ? (
                <span
                  className={cn(
                    'command-center-kpi__delta',
                    (change?.direction === 'up' || metric.context?.startsWith('+')) &&
                      'command-center-kpi__delta--up',
                    change?.direction === 'down' && 'command-center-kpi__delta--down',
                  )}
                >
                  {deltaText}
                </span>
              ) : (
                <span className="command-center-kpi__delta command-center-kpi__delta--up">—</span>
              )}
              {change || metric.context ? <MiniTrendSparkline direction={change?.direction ?? 'up'} /> : null}
            </div>
          </div>
        );

        if (metric.drill_down_path) {
          return (
            <Link key={metric.metric_id} to={metric.drill_down_path} className="block transition hover:opacity-92">
              {body}
            </Link>
          );
        }

        return <div key={metric.metric_id}>{body}</div>;
      })}
    </div>
  );
}
