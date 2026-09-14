import type {
  AttentionItem,
  ChangeItem,
  CommandCenterOverview,
  JourneyMetricRow,
  RecentServiceRequestRow,
} from '@/features/command-center/types';

export type ActivityFeedItem = {
  id: string;
  title: string;
  summary: string;
  timestamp?: string | null;
  href?: string | null;
  tone: 'info' | 'warning' | 'critical' | 'success';
};

const CHART_COLORS = ['#c9a227', '#1a2634', '#5b8def', '#2d9f6f', '#d97706', '#7c6bf0', '#e06c75'];

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function journeyVolume(row: JourneyMetricRow): number {
  return row.service_request_count + row.active_count + row.completed_count;
}

export function buildPerformanceChartData(journeyMetrics: JourneyMetricRow[]) {
  return journeyMetrics
    .map((row) => ({
      journey: row.label_ar,
      requests: row.service_request_count,
      active: row.active_count,
      completed: row.completed_count,
    }))
    .filter((row) => row.requests + row.active + row.completed > 0)
    .slice(0, 10);
}

export function buildDistributionChartData(journeyMetrics: JourneyMetricRow[]) {
  const ranked = journeyMetrics
    .map((row) => ({ name: row.label_ar, value: journeyVolume(row) }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  if (ranked.length <= 6) return ranked;

  const top = ranked.slice(0, 5);
  const otherTotal = ranked.slice(5).reduce((sum, row) => sum + row.value, 0);
  return [...top, { name: 'other', value: otherTotal }];
}

export function changeForMetric(changes: ChangeItem[] | undefined, metricId: string): ChangeItem | undefined {
  return changes?.find((item) => item.metric_id === metricId);
}

export function trendLabel(direction: ChangeItem['direction'] | undefined, locale: string): string | null {
  if (!direction || direction === 'unknown') return null;
  if (direction === 'up') return locale.startsWith('ar') ? '↑ صعود' : '↑ Up';
  if (direction === 'down') return locale.startsWith('ar') ? '↓ تراجع' : '↓ Down';
  return locale.startsWith('ar') ? '→ ثابت' : '→ Flat';
}

export function buildActivityFeed(overview: CommandCenterOverview): ActivityFeedItem[] {
  const attentionItems: ActivityFeedItem[] = overview.attention_items.slice(0, 6).map((item: AttentionItem) => ({
    id: `attention-${item.id}`,
    title: item.title_ar,
    summary: item.why_ar,
    href: item.drill_down_path ?? null,
    tone:
      item.severity === 'CRITICAL' || item.severity === 'DECISION'
        ? 'critical'
        : item.severity === 'ACTION' || item.severity === 'WATCH'
          ? 'warning'
          : 'info',
  }));

  const requestItems: ActivityFeedItem[] = overview.recent_service_requests
    .slice(0, 6)
    .map((row: RecentServiceRequestRow) => ({
      id: `sr-${row.id}`,
      title: row.reference_code,
      summary: `${row.journey_type} · ${row.status}`,
      timestamp: row.created_at ?? null,
      href: `/operations/service-requests/${row.id}`,
      tone: row.status === 'qualified' ? 'success' : 'info',
    }));

  return [...attentionItems, ...requestItems].slice(0, 10);
}

export function formatRelativeTimestamp(iso: string | null | undefined, locale: string): string {
  if (!iso) return locale.startsWith('ar') ? 'الآن' : 'Just now';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return locale.startsWith('ar') ? 'الآن' : 'Just now';
  if (minutes < 60) return locale.startsWith('ar') ? `منذ ${minutes} د` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return locale.startsWith('ar') ? `منذ ${hours} س` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return locale.startsWith('ar') ? `منذ ${days} ي` : `${days}d ago`;
}
