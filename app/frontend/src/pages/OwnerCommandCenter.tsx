import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import CommandCenterActivityFeed from '@/features/command-center/components/CommandCenterActivityFeed';
import CommandCenterAssistantPanel from '@/features/command-center/components/CommandCenterAssistantPanel';
import CommandCenterDelegationsPanel from '@/features/command-center/components/CommandCenterDelegationsPanel';
import CommandCenterPartnersPanel from '@/features/command-center/components/CommandCenterPartnersPanel';
import CommandCenterPlatformArchitecturePanel from '@/features/command-center/components/CommandCenterPlatformArchitecturePanel';
import CommandCenterReadinessPanel from '@/features/command-center/components/CommandCenterReadinessPanel';
import CommandCenterDistributionChart from '@/features/command-center/components/CommandCenterDistributionChart';
import CommandCenterFeaturedProjects from '@/features/command-center/components/CommandCenterFeaturedProjects';
import CommandCenterHero from '@/features/command-center/components/CommandCenterHero';
import CommandCenterKpiGrid from '@/features/command-center/components/CommandCenterKpiGrid';
import CommandCenterLayout from '@/features/command-center/components/CommandCenterLayout';
import CommandCenterTrendChart from '@/features/command-center/components/CommandCenterTrendChart';
import CommandCenterSectorGrid from '@/features/command-center/components/CommandCenterSectorGrid';
import DecisionInboxPanel from '@/features/command-center/components/DecisionInboxPanel';
import EvidenceDrawer from '@/features/command-center/components/EvidenceDrawer';
import MetricCard from '@/features/command-center/components/MetricCard';
import TruthStateBadge from '@/features/command-center/components/TruthStateBadge';
import {
  fetchCommandCenterOverview,
  fetchExecutiveBrief,
} from '@/features/command-center/api/commandCenterClient';
import { buildShowcaseOverview } from '@/features/command-center/data/commandCenterShowcase';
import { isCommandCenterOpenAccessEnabled } from '@/config/commandCenterDevAccess';
import type { AttentionItem, AttentionSeverity } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';
import PageMeta from '@/components/PageMeta';
import { JOURNEY_TYPE_LABELS } from '@/features/service-requests/operationalStages';

const SEVERITY_STYLES: Record<AttentionSeverity, string> = {
  NORMAL: 'border-gray-200',
  FYI: 'border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20',
  WATCH: 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20',
  ACTION: 'border-orange-300 bg-orange-50/60 dark:border-orange-900/40 dark:bg-orange-950/20',
  DECISION: 'border-gold/40 bg-cream dark:border-gold/30 dark:bg-white/5',
  CRITICAL: 'border-red-300 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20',
};

const NAV_SECTIONS = [
  { id: 'leadership', labelKey: 'commandCenter.sections.leadership' as const },
  { id: 'attention', labelKey: 'commandCenter.sections.attention' as const },
  { id: 'operations', labelKey: 'commandCenter.sections.operations' as const },
  { id: 'journeys', labelKey: 'commandCenter.sections.journeys' as const },
  { id: 'finance', labelKey: 'commandCenter.sections.finance' as const },
  { id: 'platform', labelKey: 'commandCenter.sections.platform' as const },
] as const;

function AttentionCard({ item }: { item: AttentionItem }) {
  const content = (
    <div className={`rounded-xl border p-4 ${SEVERITY_STYLES[item.severity]}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="font-tajawal text-sm font-bold text-ink dark:text-white">{item.title_ar}</h3>
        <span className="font-tajawal text-[11px] text-ink/50">{item.domain}</span>
      </div>
      <p className="font-tajawal text-sm text-ink/70 dark:text-white/70">{item.why_ar}</p>
    </div>
  );
  if (item.drill_down_path) {
    return (
      <Link to={item.drill_down_path} className="block hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}

const SECTION_IDS = new Set(NAV_SECTIONS.map((section) => section.id));

export default function OwnerCommandCenterPage() {
  const { t } = useLanguage();
  const { isCommandCenterOwner } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<(typeof NAV_SECTIONS)[number]['id']>('leadership');
  const [evidenceMetricId, setEvidenceMetricId] = useState<string | null>(null);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) {
      setActiveSection('leadership');
      return;
    }
    if (hash === 'platform-sections') {
      setActiveSection('leadership');
      document.getElementById('platform-sections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (SECTION_IDS.has(hash as (typeof NAV_SECTIONS)[number]['id'])) {
      setActiveSection(hash as (typeof NAV_SECTIONS)[number]['id']);
    }
  }, [location.hash]);

  const overviewQuery = useQuery({
    queryKey: ['operations', 'command-center', 'overview'],
    queryFn: fetchCommandCenterOverview,
  });

  const briefQuery = useQuery({
    queryKey: ['operations', 'command-center', 'executive-brief'],
    queryFn: fetchExecutiveBrief,
  });

  const overview = overviewQuery.data;
  const brief = briefQuery.data;

  const effectiveOverview = useMemo(() => {
    if (overview) return overview;
    if (!isCommandCenterOpenAccessEnabled || overviewQuery.isLoading) return null;
    return buildShowcaseOverview();
  }, [overview, overviewQuery.isLoading]);

  const isShowcaseData = Boolean(!overview && effectiveOverview);

  const attentionSorted = useMemo(() => {
    const source = overview ?? effectiveOverview;
    if (!source) return [];
    const order: AttentionSeverity[] = ['CRITICAL', 'DECISION', 'ACTION', 'WATCH', 'FYI', 'NORMAL'];
    return [...source.attention_items].sort(
      (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
    );
  }, [overview, effectiveOverview]);

  const refreshDashboard = () => {
    void queryClient.invalidateQueries({ queryKey: ['operations', 'command-center'] });
  };

  const opportunityCenterTotal = useMemo(() => {
    if (!effectiveOverview) return null;
    const opp = effectiveOverview.executive_kpis.find((m) =>
      /opportunit|فرص/i.test(`${m.metric_id} ${m.label_ar}`),
    );
    if (opp?.value != null) {
      const n = Number(String(opp.value).replace(/[^\d.]/g, ''));
      return Number.isFinite(n) ? n : null;
    }
    return effectiveOverview.journey_metrics.reduce((sum, row) => sum + row.service_request_count, 0) || null;
  }, [effectiveOverview]);

  return (
    <>
      <PageMeta title={`${t('auth.commandCenter')} — EAM`} noIndex />
      <CommandCenterLayout
      overview={effectiveOverview}
      onRefresh={refreshDashboard}
      refreshing={overviewQuery.isFetching}
    >
      <div className="command-center-dashboard space-y-5">
        <CommandCenterHero generatedAt={effectiveOverview?.generated_at} />

        {isShowcaseData ? (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-center text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            {t('commandCenter.showcase.banner')}
          </p>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-8">
          {overviewQuery.isError && !effectiveOverview ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-tajawal text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
              {t('commandCenter.loadError')}
            </div>
          ) : null}

          {overviewQuery.isLoading && !effectiveOverview ? (
            <p className="font-tajawal text-ink/60">{t('commandCenter.loading')}</p>
          ) : null}

          {activeSection === 'leadership' ? (
            <section id="leadership" className="space-y-6">
              {effectiveOverview ? (
                <CommandCenterKpiGrid
                  metrics={effectiveOverview.executive_kpis}
                  changes={effectiveOverview.what_changed}
                  onEvidenceClick={isShowcaseData ? undefined : setEvidenceMetricId}
                />
              ) : null}

              <CommandCenterSectorGrid journeyMetrics={effectiveOverview?.journey_metrics ?? []} />

              {effectiveOverview ? (
                <>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <CommandCenterTrendChart
                      trends={effectiveOverview.platform_trends ?? []}
                      titleKey="commandCenter.chart.performanceTitle"
                      subtitleKey="commandCenter.chart.performanceSubtitle"
                      variant="platformPerformance"
                    />
                    <CommandCenterDistributionChart
                      journeyMetrics={effectiveOverview.journey_metrics}
                      centerTotal={opportunityCenterTotal}
                    />
                    <CommandCenterFeaturedProjects journeyMetrics={effectiveOverview.journey_metrics} />
                  </div>

                  <div className="xl:hidden space-y-4">
                    <CommandCenterActivityFeed overview={effectiveOverview} />
                    <CommandCenterAssistantPanel />
                  </div>
                </>
              ) : null}

              {overview ? (
              <details className="command-center-advanced">
                <summary>{t('commandCenter.advanced.title')}</summary>
                <div className="mt-4 space-y-6">
                  <nav
                    className="flex flex-wrap gap-2"
                    role="tablist"
                    aria-label={t('commandCenter.sections.aria')}
                  >
                    {NAV_SECTIONS.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        role="tab"
                        aria-selected={activeSection === section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`rounded-full px-3 py-1 font-tajawal text-xs ${
                          activeSection === section.id
                            ? 'bg-gold text-white'
                            : 'border border-gold/20 bg-white text-ink/80'
                        }`}
                      >
                        {t(section.labelKey)}
                      </button>
                    ))}
                  </nav>
                  <h2 className="sr-only">{t('commandCenter.leadership.title')}</h2>
                  <DecisionInboxPanel items={attentionSorted} />

              {brief ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gold/15 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-tajawal font-bold text-ink dark:text-white">{t('commandCenter.leadership.briefTitle')}</h3>
                      <TruthStateBadge state={brief.ai_assistance === 'RULE_ASSISTED' ? 'PARTIAL' : 'LIVE'} />
                    </div>
                    <p className="mb-2 font-tajawal text-xs text-ink/50">{t('commandCenter.leadership.briefFacts')}</p>
                    <ul className="list-disc pr-5 font-tajawal text-sm text-ink/80 dark:text-white/80">
                      {brief.facts.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className="mb-2 mt-4 font-tajawal text-xs text-ink/50">{t('commandCenter.leadership.briefRecommendations')}</p>
                    <ul className="list-disc pr-5 font-tajawal text-sm text-ink/80 dark:text-white/80">
                      {brief.recommendations.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-gold/15 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                    <h3 className="mb-3 font-tajawal font-bold text-ink dark:text-white">{t('commandCenter.leadership.decisionsTitle')}</h3>
                    <p className="mb-2 font-tajawal text-xs text-ink/50">{t('commandCenter.leadership.decisionsNeeded')}</p>
                    <ul className="list-disc pr-5 font-tajawal text-sm">
                      {brief.decisions_needed.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className="mb-2 mt-4 font-tajawal text-xs text-ink/50">{t('commandCenter.leadership.watchNext')}</p>
                    <ul className="list-disc pr-5 font-tajawal text-sm">
                      {brief.watch_next.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {overview.strategic_scorecard?.length ? (
                <div className="rounded-2xl border border-gold/15 p-5 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-bold">{t('commandCenter.leadership.scorecard')}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {overview.strategic_scorecard.map((item) => (
                      <div key={`${item.domain}-${item.label_ar}`} className="rounded-xl border border-gold/10 p-3">
                        <p className="font-tajawal text-xs text-ink/50">{item.domain}</p>
                        <p className="font-tajawal text-sm font-semibold">{item.label_ar}</p>
                        <p className="font-tajawal text-lg font-bold">
                          {item.current_value}
                          {item.target_value != null ? (
                            <span className="text-sm font-normal text-ink/50"> / {item.target_value}</span>
                          ) : null}
                        </p>
                        {item.status ? <TruthStateBadge state={item.status} /> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {overview.operating_pulse?.length ? (
                <div className="rounded-2xl border border-gold/15 p-5 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-bold">{t('commandCenter.leadership.operatingPulse')}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {overview.operating_pulse.map((item) => (
                      <div key={item.metric_id} className="rounded-xl border border-gold/10 p-3">
                        <p className="font-tajawal text-xs text-ink/50">{item.domain}</p>
                        <p className="font-tajawal text-sm">{item.label_ar}</p>
                        {item.truth_state && item.truth_state !== 'LIVE' ? (
                          <TruthStateBadge state={item.truth_state} />
                        ) : (
                          <p className="font-tajawal text-xl font-bold">{item.value ?? '—'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {overview.what_changed?.length ? (
                <div className="rounded-2xl border border-gold/15 p-5 dark:border-white/10">
                  <h3 className="mb-1 font-tajawal font-bold">{t('commandCenter.leadership.whatChanged')}</h3>
                  <p className="mb-3 font-tajawal text-xs text-ink/50">
                    {overview.comparison_period_label ?? t('commandCenter.leadership.comparisonDefault')}
                  </p>
                  <ul className="space-y-2 font-tajawal text-sm">
                    {overview.what_changed.map((change) => (
                      <li key={change.metric_id} className="flex flex-wrap justify-between gap-2">
                        <span>{change.label_ar}</span>
                        <span>
                          {change.baseline} → {change.current} ({change.direction})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
                </div>
              </details>
              ) : null}
            </section>
          ) : null}

          {overview && activeSection === 'attention' ? (
            <section id="attention" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold">{t('commandCenter.attention.title')}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {attentionSorted.map((item) => (
                  <AttentionCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {overview && activeSection === 'operations' ? (
            <section id="operations" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold">{t('commandCenter.operations.title')}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-semibold">{t('commandCenter.operations.byStatus')}</h3>
                  <dl className="space-y-2 font-tajawal text-sm">
                    {Object.entries(overview.service_request_status_counts).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <dt>{status}</dt>
                        <dd className="font-bold">{count}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-semibold">{t('commandCenter.operations.recent')}</h3>
                  <ul className="space-y-2 font-tajawal text-sm">
                    {overview.recent_service_requests.map((sr) => (
                      <li key={sr.id}>
                        <Link
                          to={`/operations/service-requests/${sr.id}`}
                          className="flex justify-between hover:text-gold"
                        >
                          <span>{sr.reference_code}</span>
                          <span>{JOURNEY_TYPE_LABELS[sr.journey_type] ?? sr.journey_type}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          {overview && activeSection === 'journeys' ? (
            <section id="journeys" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold">
                {t('commandCenter.journeys.title')} ({overview.real_journey_count})
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-gold/15 dark:border-white/10">
                <table className="min-w-full font-tajawal text-sm">
                  <thead className="bg-cream-light dark:bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-right">{t('commandCenter.journeys.col.journey')}</th>
                      <th className="px-4 py-3 text-right">{t('commandCenter.journeys.col.active')}</th>
                      <th className="px-4 py-3 text-right">{t('commandCenter.journeys.col.completed')}</th>
                      <th className="px-4 py-3 text-right">{t('commandCenter.journeys.col.requests')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.journey_metrics.map((row) => (
                      <tr key={row.journey_type} className="border-t border-gold/10 dark:border-white/10">
                        <td className="px-4 py-3">{row.label_ar}</td>
                        <td className="px-4 py-3">{row.active_count}</td>
                        <td className="px-4 py-3">{row.completed_count}</td>
                        <td className="px-4 py-3">{row.service_request_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {overview && activeSection === 'finance' ? (
            <section id="finance" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold">{t('commandCenter.finance.title')}</h2>
              <p className="font-tajawal text-sm text-ink/60">{t('commandCenter.finance.note')}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {overview.financial_pulse.map((metric) => (
                  <MetricCard key={metric.metric_id} metric={metric} />
                ))}
              </div>
              {overview.commercial_funnel?.length ? (
                <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-semibold">{t('commandCenter.finance.funnel')}</h3>
                  <ol className="space-y-2 font-tajawal text-sm">
                    {overview.commercial_funnel.map((stage) => (
                      <li key={stage.stage_id} className="flex flex-wrap items-center justify-between gap-2">
                        <span>{stage.label_ar}</span>
                        <TruthStateBadge state={stage.status} />
                        {stage.detail_ar ? (
                          <span className="w-full text-xs text-ink/50">{stage.detail_ar}</span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                <h3 className="mb-3 font-tajawal font-semibold">{t('commandCenter.finance.readiness')}</h3>
                <ul className="space-y-2 font-tajawal text-sm">
                  {overview.commercial_readiness.map((item) => (
                    <li key={item.item_id} className="flex flex-wrap items-center justify-between gap-2">
                      <span>{item.label_ar}</span>
                      <TruthStateBadge state={item.status} />
                      {item.blocker ? (
                        <span className="w-full text-xs text-ink/50">{item.blocker}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {overview && activeSection === 'platform' ? (
            <section id="platform" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold">{t('commandCenter.platform.title')}</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {overview.platform_health.map((domain) => (
                  <div
                    key={domain.domain}
                    className="rounded-xl border border-gold/15 p-4 dark:border-white/10"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-tajawal font-semibold">{domain.label_ar}</h3>
                      <span className="font-tajawal text-xs uppercase">{domain.status}</span>
                    </div>
                    {domain.detail_ar ? (
                      <p className="font-tajawal text-sm text-ink/60 dark:text-white/60">{domain.detail_ar}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              {overview.risk_items?.length ? (
                <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-semibold">{t('commandCenter.platform.riskCenter')}</h3>
                  <ul className="space-y-3 font-tajawal text-sm">
                    {overview.risk_items.map((risk) => (
                      <li key={risk.risk_id} className="rounded-lg border border-gold/10 p-3">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">{risk.title_ar}</span>
                          <span className="text-xs text-ink/50">{risk.domain}</span>
                        </div>
                        <p className="text-ink/70">{risk.evidence}</p>
                        <p className="mt-1 text-xs text-ink/50">تأثير: {risk.affected_capability}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {overview.control_assurance?.length ? (
                <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-semibold">{t('commandCenter.platform.controls')}</h3>
                  <ul className="space-y-2 font-tajawal text-sm">
                    {overview.control_assurance.map((control) => (
                      <li key={control.control_id} className="flex flex-wrap justify-between gap-2">
                        <span>{control.label_ar}</span>
                        <span className="text-xs uppercase text-ink/60">{control.verification}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <CommandCenterReadinessPanel />
              <CommandCenterPlatformArchitecturePanel />
              <p className="font-tajawal text-xs text-ink/50">{t('commandCenter.platform.footerNote')}</p>
            </section>
          ) : null}

          {effectiveOverview ? (
            <section className="md:hidden space-y-3 rounded-2xl border border-gold/20 bg-white/80 p-4 dark:bg-white/5">
              <h2 className="font-tajawal font-bold">{t('commandCenter.mobile.title')}</h2>
              <p className="font-tajawal text-xs text-ink/60">{t('commandCenter.mobile.subtitle')}</p>
              <div className="grid grid-cols-2 gap-2">
                {effectiveOverview.executive_kpis.slice(0, 4).map((m) => (
                  <div key={m.metric_id} className="rounded-lg border border-gold/10 p-2 text-center">
                    <p className="font-tajawal text-[11px] text-ink/60">{m.label_ar}</p>
                    <p className="font-tajawal text-lg font-bold">{m.value ?? '—'}</p>
                  </div>
                ))}
              </div>
              {attentionSorted.slice(0, 3).map((item) => (
                <AttentionCard key={`mobile-${item.id}`} item={item} />
              ))}
            </section>
          ) : null}

          {isCommandCenterOwner ? <CommandCenterPartnersPanel /> : null}
          {isCommandCenterOwner ? <CommandCenterDelegationsPanel /> : null}
          </div>

          {effectiveOverview ? (
            <aside className="hidden xl:block space-y-4">
              <CommandCenterActivityFeed overview={effectiveOverview} />
              <CommandCenterAssistantPanel />
            </aside>
          ) : null}
        </div>
      </div>
      <EvidenceDrawer metricId={evidenceMetricId} onClose={() => setEvidenceMetricId(null)} />
    </CommandCenterLayout>
    </>
  );
}
