import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { buildPerformanceChartData } from '@/features/command-center/lib/dashboardUtils';
import type { JourneyMetricRow } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  journeyMetrics: JourneyMetricRow[];
};

export default function CommandCenterPerformanceChart({ journeyMetrics }: Props) {
  const { t } = useLanguage();
  const data = buildPerformanceChartData(journeyMetrics);

  const config = {
    requests: { label: t('commandCenter.chart.requests'), color: '#c9a227' },
    active: { label: t('commandCenter.chart.active'), color: '#1a2634' },
    completed: { label: t('commandCenter.chart.completed'), color: '#2d9f6f' },
  };

  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t('commandCenter.chart.noPerformanceData')}</p>
    );
  }

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-ink dark:text-white">{t('commandCenter.chart.performanceTitle')}</h3>
        <p className="text-sm text-ink-secondary">{t('commandCenter.chart.performanceSubtitle')}</p>
      </div>
      <ChartContainer config={config} className="aspect-[16/9] min-h-[260px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="journey"
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={70}
          />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="requests" fill="var(--color-requests)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="active" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </section>
  );
}
