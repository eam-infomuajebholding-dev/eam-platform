import { Cell, Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { buildDistributionChartData, chartColor } from '@/features/command-center/lib/dashboardUtils';
import type { JourneyMetricRow } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  journeyMetrics: JourneyMetricRow[];
};

export default function CommandCenterDistributionChart({ journeyMetrics }: Props) {
  const { t } = useLanguage();
  const data = buildDistributionChartData(journeyMetrics).map((row, index) => ({
    ...row,
    name: row.name === 'other' ? t('commandCenter.chart.other') : row.name,
    fill: chartColor(index),
  }));

  const config = Object.fromEntries(
    data.map((row, index) => [row.name, { label: row.name, color: chartColor(index) }]),
  );

  if (data.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t('commandCenter.chart.noDistributionData')}</p>
    );
  }

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-ink dark:text-white">{t('commandCenter.chart.distributionTitle')}</h3>
        <p className="text-sm text-ink-secondary">{t('commandCenter.chart.distributionSubtitle')}</p>
      </div>
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="mt-4 space-y-2">
        {data.map((row) => {
          const total = data.reduce((sum, item) => sum + item.value, 0);
          const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
          return (
            <li key={row.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.fill }} />
                <span className="text-ink dark:text-white">{row.name}</span>
              </span>
              <span className="font-semibold text-ink/70">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
