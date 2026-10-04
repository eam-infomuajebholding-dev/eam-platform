import { Cell, Label, Pie, PieChart } from 'recharts';
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
  centerTotal?: number | null;
};

export default function CommandCenterDistributionChart({ journeyMetrics, centerTotal }: Props) {
  const { t } = useLanguage();
  const data = buildDistributionChartData(journeyMetrics).map((row, index) => ({
    ...row,
    name: row.name === 'other' ? t('commandCenter.chart.other') : row.name,
    fill: chartColor(index),
  }));

  const config = Object.fromEntries(
    data.map((row, index) => [row.name, { label: row.name, color: chartColor(index) }]),
  );

  const computedTotal = data.reduce((sum, item) => sum + item.value, 0);
  const donutCenter = centerTotal ?? computedTotal;

  if (data.length === 0) {
    return (
      <section className="command-center-panel">
        <p className="text-sm text-ink-secondary">{t('commandCenter.chart.noDistributionData')}</p>
      </section>
    );
  }

  return (
    <section className="command-center-panel command-center-panel--chart">
      <div className="mb-3">
        <h3 className="command-center-panel__title">{t('commandCenter.chart.distributionTitle')}</h3>
        <p className="command-center-panel__subtitle">{t('commandCenter.chart.distributionSubtitle')}</p>
      </div>
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[220px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
                const { cx, cy } = viewBox;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={cx} y={(cy ?? 0) - 4} className="fill-ink text-2xl font-bold">
                      {donutCenter}
                    </tspan>
                    <tspan x={cx} y={(cy ?? 0) + 14} className="fill-ink/50 text-[10px]">
                      {t('commandCenter.chart.opportunitiesCenter')}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="mt-3 max-h-[120px] space-y-1.5 overflow-y-auto">
        {data.slice(0, 5).map((row) => {
          const total = data.reduce((sum, item) => sum + item.value, 0);
          const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
          return (
            <li key={row.name} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.fill }} />
                <span className="truncate text-ink dark:text-white">{row.name}</span>
              </span>
              <span className="shrink-0 font-semibold text-ink/70">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
