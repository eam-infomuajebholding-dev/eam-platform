import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import CommandSearchBar from '@/features/command-center/components/CommandSearchBar';
import DecisionInboxPanel from '@/features/command-center/components/DecisionInboxPanel';
import EvidenceDrawer from '@/features/command-center/components/EvidenceDrawer';
import MetricCard from '@/features/command-center/components/MetricCard';
import TruthStateBadge from '@/features/command-center/components/TruthStateBadge';
import {
  fetchCommandCenterOverview,
  fetchExecutiveBrief,
} from '@/features/command-center/api/commandCenterClient';
import type { AttentionItem, AttentionSeverity } from '@/features/command-center/types';
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
  { id: 'leadership', label: 'القيادة' },
  { id: 'attention', label: 'مطلوب انتباهك' },
  { id: 'operations', label: 'العمليات' },
  { id: 'journeys', label: 'الرحلات' },
  { id: 'finance', label: 'المال' },
  { id: 'platform', label: 'المنصة' },
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

export default function OwnerCommandCenterPage() {
  const [activeSection, setActiveSection] = useState<(typeof NAV_SECTIONS)[number]['id']>('leadership');
  const [evidenceMetricId, setEvidenceMetricId] = useState<string | null>(null);

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

  const attentionSorted = useMemo(() => {
    if (!overview) return [];
    const order: AttentionSeverity[] = ['CRITICAL', 'DECISION', 'ACTION', 'WATCH', 'FYI', 'NORMAL'];
    return [...overview.attention_items].sort(
      (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
    );
  }, [overview]);

  return (
    <Layout>
      <div className="min-h-screen bg-cream dark:bg-dark">
        <div className="border-b border-gold/15 bg-cream-light/90 dark:border-white/10 dark:bg-white/5">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
            <div>
              <p className="font-tajawal text-xs text-gold">EAM — إعمار الأصالة والمعاصرة</p>
              <h1 className="font-tajawal text-2xl font-bold text-ink dark:text-white">لوحة القيادة</h1>
              <p className="font-tajawal text-sm text-ink/60 dark:text-white/60">
                نظام قرار وتحكم تنفيذي — بيانات حقيقية فقط
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/operations/service-requests"
                className="rounded-xl border border-gold/25 px-4 py-2 font-tajawal text-sm hover:bg-gold/10"
              >
                المراجعة المهنية
              </Link>
              {overview?.generated_at ? (
                <span className="rounded-xl bg-white/60 px-3 py-2 font-tajawal text-xs text-ink/60 dark:bg-white/10 dark:text-white/60">
                  آخر تحديث: {new Date(overview.generated_at).toLocaleString('ar-SA')}
                </span>
              ) : null}
            </div>
          </div>
          <nav className="container mx-auto flex flex-wrap gap-2 px-4 pb-4" aria-label="أقسام لوحة القيادة">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`rounded-full px-4 py-1.5 font-tajawal text-sm ${
                  activeSection === section.id
                    ? 'bg-gold text-white'
                    : 'border border-gold/20 text-ink/80 dark:text-white/80'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="container mx-auto space-y-8 px-4 py-8">
          {overviewQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-tajawal text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
              تعذر تحميل بيانات لوحة القيادة. تحقق من صلاحيات المالك/المسؤول والاتصال بالخادم.
            </div>
          ) : null}

          {overviewQuery.isLoading ? (
            <p className="font-tajawal text-ink/60">جاري تحميل المؤشرات...</p>
          ) : null}

          {overview && (activeSection === 'leadership' || activeSection === 'operations') ? (
            <section id="leadership" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold text-ink dark:text-white">نظرة قيادية</h2>
              <CommandSearchBar />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {overview.executive_kpis.map((metric) => (
                  <MetricCard
                    key={metric.metric_id}
                    metric={metric}
                    onEvidenceClick={setEvidenceMetricId}
                  />
                ))}
              </div>

              <DecisionInboxPanel items={attentionSorted} />

              {brief ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gold/15 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-tajawal font-bold text-ink dark:text-white">موجز القيادة</h3>
                      <TruthStateBadge state={brief.ai_assistance === 'RULE_ASSISTED' ? 'PARTIAL' : 'LIVE'} />
                    </div>
                    <p className="mb-2 font-tajawal text-xs text-ink/50">حقائق (FACT)</p>
                    <ul className="list-disc pr-5 font-tajawal text-sm text-ink/80 dark:text-white/80">
                      {brief.facts.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className="mb-2 mt-4 font-tajawal text-xs text-ink/50">توصيات (RECOMMENDATION)</p>
                    <ul className="list-disc pr-5 font-tajawal text-sm text-ink/80 dark:text-white/80">
                      {brief.recommendations.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-gold/15 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                    <h3 className="mb-3 font-tajawal font-bold text-ink dark:text-white">قرارات ومتابعة</h3>
                    <p className="mb-2 font-tajawal text-xs text-ink/50">قرارات مطلوبة</p>
                    <ul className="list-disc pr-5 font-tajawal text-sm">
                      {brief.decisions_needed.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className="mb-2 mt-4 font-tajawal text-xs text-ink/50">يُنصح بمتابعتها</p>
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
                  <h3 className="mb-3 font-tajawal font-bold">بطاقة الأداء الاستراتيجي</h3>
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
                  <h3 className="mb-3 font-tajawal font-bold">نبض التشغيل</h3>
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
                  <h3 className="mb-1 font-tajawal font-bold">ما الذي تغيّر؟</h3>
                  <p className="mb-3 font-tajawal text-xs text-ink/50">
                    {overview.comparison_period_label ?? 'مقارنة زمنية'}
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
            </section>
          ) : null}

          {overview && activeSection === 'attention' ? (
            <section id="attention" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold">مطلوب انتباهك</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {attentionSorted.map((item) => (
                  <AttentionCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {overview && (activeSection === 'operations' || activeSection === 'leadership') ? (
            <section id="operations" className="space-y-4">
              <h2 className="font-tajawal text-lg font-bold">طلبات الخدمة والمراجعة المهنية</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-semibold">حسب الحالة</h3>
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
                  <h3 className="mb-3 font-tajawal font-semibold">آخر الطلبات</h3>
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
              <h2 className="font-tajawal text-lg font-bold">الرحلات ({overview.real_journey_count} حقيقية)</h2>
              <div className="overflow-x-auto rounded-2xl border border-gold/15 dark:border-white/10">
                <table className="min-w-full font-tajawal text-sm">
                  <thead className="bg-cream-light dark:bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-right">الرحلة</th>
                      <th className="px-4 py-3 text-right">نشطة</th>
                      <th className="px-4 py-3 text-right">مكتملة</th>
                      <th className="px-4 py-3 text-right">طلبات</th>
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
              <h2 className="font-tajawal text-lg font-bold">النبض المالي</h2>
              <p className="font-tajawal text-sm text-ink/60">
                لا تُعرض أرقام مالية غير معتمدة — الحالات الصريحة بدل الصفر الوهمي.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {overview.financial_pulse.map((metric) => (
                  <MetricCard key={metric.metric_id} metric={metric} />
                ))}
              </div>
              {overview.commercial_funnel?.length ? (
                <div className="rounded-2xl border border-gold/15 p-4 dark:border-white/10">
                  <h3 className="mb-3 font-tajawal font-semibold">مسار تجاري</h3>
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
                <h3 className="mb-3 font-tajawal font-semibold">جاهزية تجارية</h3>
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
              <h2 className="font-tajawal text-lg font-bold">صحة المنصة والمخاطر</h2>
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
                  <h3 className="mb-3 font-tajawal font-semibold">مركز المخاطر</h3>
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
                  <h3 className="mb-3 font-tajawal font-semibold">ضمانات التحكم</h3>
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
              <p className="font-tajawal text-xs text-ink/50">
                COMMAND_CENTER_BUSINESS_AUTHORITY_COUNT = 0 — لوحة قراءة/تحكم عبر السلطات الموجودة فقط.
              </p>
            </section>
          ) : null}

          {overview ? (
            <section className="md:hidden space-y-3 rounded-2xl border border-gold/20 bg-white/80 p-4 dark:bg-white/5">
              <h2 className="font-tajawal font-bold">موجز تنفيذي — جوال</h2>
              <p className="font-tajawal text-xs text-ink/60">قرارات · إجراءات · متابعة · نبض</p>
              <div className="grid grid-cols-2 gap-2">
                {overview.executive_kpis.slice(0, 4).map((m) => (
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
        </div>
      </div>
      <EvidenceDrawer metricId={evidenceMetricId} onClose={() => setEvidenceMetricId(null)} />
    </Layout>
  );
}
