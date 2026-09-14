import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { PlatformTrendPoint } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  trends: PlatformTrendPoint[];
};

export default function CommandCenterTrendChart({ trends }: Props) {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const data = trends.map((point) => ({
    label: new Date(point.period_start).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    }),
    service_requests: point.service_requests,
    qualified_requests: point.qualified_requests,
  }));

  const config = {
    service_requests: { label: t('commandCenter.chart.requests'), color: '#c9a227' },
    qualified_requests: { label: t('commandCenter.chart.qualified'), color: '#2d9f6f' },
  };

  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t('commandCenter.chart.noTrendData')}</p>
    );
  }

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-ink dark:text-white">{t('commandCenter.chart.trendTitle')}</h3>
        <p className="text-sm text-ink-secondary">{t('commandCenter.chart.trendSubtitle')}</p>
      </div>
      <ChartContainer config={config} className="aspect-[16/9] min-h-[260px] w-full">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="service_requests"
            stroke="var(--color-service_requests)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="qualified_requests"
            stroke="var(--color-qualified_requests)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
    </section>
  );
}
