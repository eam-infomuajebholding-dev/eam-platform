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
import type { CommandCenterMessageKey } from '@/i18n/commandCenterMessages';

type Props = {
  trends: PlatformTrendPoint[];
  titleKey?: CommandCenterMessageKey;
  subtitleKey?: CommandCenterMessageKey;
};

export default function CommandCenterTrendChart({
  trends,
  titleKey = 'commandCenter.chart.trendTitle',
  subtitleKey = 'commandCenter.chart.trendSubtitle',
}: Props) {
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
    service_requests: { label: t('commandCenter.chart.requests'), color: '#e8943a' },
    qualified_requests: { label: t('commandCenter.chart.qualified'), color: '#3b82f6' },
  };

  if (data.length === 0) {
    return (
      <section className="command-center-panel">
        <p className="text-sm text-ink-secondary">{t('commandCenter.chart.noTrendData')}</p>
      </section>
    );
  }

  return (
    <section className="command-center-panel command-center-panel--chart">
      <div className="mb-3">
        <h3 className="command-center-panel__title">{t(titleKey)}</h3>
        <p className="command-center-panel__subtitle">{t(subtitleKey)}</p>
      </div>
      <ChartContainer config={config} className="aspect-[4/3] min-h-[240px] w-full max-xl:min-h-[220px]">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e8ecef" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="service_requests" stroke="var(--color-service_requests)" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="qualified_requests" stroke="var(--color-qualified_requests)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ChartContainer>
    </section>
  );
}
