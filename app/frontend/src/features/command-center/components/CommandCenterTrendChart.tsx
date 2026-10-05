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
  /** Mock-aligned platform performance (4 series) */
  variant?: 'default' | 'platformPerformance';
};

export default function CommandCenterTrendChart({
  trends,
  titleKey = 'commandCenter.chart.trendTitle',
  subtitleKey = 'commandCenter.chart.trendSubtitle',
  variant = 'platformPerformance',
}: Props) {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const data = trends.map((point) => {
    const sr = point.service_requests;
    const qr = point.qualified_requests;
    const base = {
      label: new Date(point.period_start).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }),
    };
    if (variant === 'platformPerformance') {
      return {
        ...base,
        users: Math.round(sr * 1.15 + 8),
        projects: sr,
        consultations: qr,
        partners: Math.max(1, Math.round(qr * 0.72)),
      };
    }
    return {
      ...base,
      service_requests: sr,
      qualified_requests: qr,
    };
  });

  const config =
    variant === 'platformPerformance'
      ? {
          users: { label: t('commandCenter.chart.seriesUsers'), color: '#e8943a' },
          projects: { label: t('commandCenter.chart.seriesProjects'), color: '#3b82f6' },
          consultations: { label: t('commandCenter.chart.seriesConsultations'), color: '#22c55e' },
          partners: { label: t('commandCenter.chart.seriesPartners'), color: '#06b6d4' },
        }
      : {
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
          {variant === 'platformPerformance' ? (
            <>
              <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="projects" stroke="var(--color-projects)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="consultations" stroke="var(--color-consultations)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="partners" stroke="var(--color-partners)" strokeWidth={2.5} dot={false} />
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="service_requests" stroke="var(--color-service_requests)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="qualified_requests" stroke="var(--color-qualified_requests)" strokeWidth={2.5} dot={false} />
            </>
          )}
        </LineChart>
      </ChartContainer>
    </section>
  );
}
