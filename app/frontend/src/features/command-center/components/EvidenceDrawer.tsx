import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import TruthStateBadge from './TruthStateBadge';
import { fetchMetricEvidence } from '../api/commandCenterClient';
import type { TruthState } from '../types';

interface Props {
  metricId: string | null;
  labelOverride?: string;
  onClose: () => void;
}

export default function EvidenceDrawer({ metricId, labelOverride, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const evidenceQuery = useQuery({
    queryKey: ['operations', 'command-center', 'evidence', metricId],
    queryFn: () => fetchMetricEvidence(metricId!),
    enabled: Boolean(metricId),
  });

  useEffect(() => {
    if (metricId) closeRef.current?.focus();
  }, [metricId]);

  if (!metricId) return null;

  const evidence = evidenceQuery.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="presentation" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="درج الأدلة"
        className="h-full w-full max-w-md overflow-y-auto bg-cream p-6 shadow-xl dark:bg-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-tajawal text-lg font-bold text-ink dark:text-white">
            {labelOverride ?? evidence?.label_ar ?? 'دليل المقياس'}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gold/20 px-3 py-1 font-tajawal text-sm"
          >
            إغلاق
          </button>
        </div>

        {evidenceQuery.isLoading ? (
          <p className="font-tajawal text-sm text-ink/60">جاري تحميل الأدلة...</p>
        ) : null}

        {evidence ? (
          <dl className="space-y-3 font-tajawal text-sm text-ink/80 dark:text-white/80">
            <div>
              <dt className="text-ink/50">التعريف</dt>
              <dd>{evidence.description_ar}</dd>
            </div>
            <div>
              <dt className="text-ink/50">المصدر</dt>
              <dd>{evidence.source}</dd>
            </div>
            <div>
              <dt className="text-ink/50">الصيغة / الحساب</dt>
              <dd className="font-mono text-xs">{evidence.formula}</dd>
            </div>
            <div>
              <dt className="text-ink/50">مجال الملكية</dt>
              <dd>{evidence.owner_domain}</dd>
            </div>
            <div>
              <dt className="text-ink/50">الفترة</dt>
              <dd>{evidence.period ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-ink/50">حداثة البيانات</dt>
              <dd>{evidence.freshness ?? '—'}</dd>
            </div>
            {evidence.last_successful_calculation ? (
              <div>
                <dt className="text-ink/50">آخر حساب ناجح</dt>
                <dd>{new Date(evidence.last_successful_calculation).toLocaleString('ar-SA')}</dd>
              </div>
            ) : null}
            {evidence.contributing_record_count != null ? (
              <div>
                <dt className="text-ink/50">عدد السجلات المساهمة</dt>
                <dd>{evidence.contributing_record_count}</dd>
              </div>
            ) : null}
            {evidence.data_quality ? (
              <div>
                <dt className="text-ink/50">جودة البيانات</dt>
                <dd>{evidence.data_quality}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-ink/50">حالة الحقيقة</dt>
              <dd>
                <TruthStateBadge state={(evidence.truth_state ?? 'UNKNOWN') as TruthState} />
              </dd>
            </div>
            {evidence.limitations?.length ? (
              <div>
                <dt className="text-ink/50">قيود</dt>
                <dd>
                  <ul className="list-disc pr-5">
                    {evidence.limitations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {evidence.trace_id ? (
              <div>
                <dt className="text-ink/50">Trace</dt>
                <dd className="font-mono text-xs">{evidence.trace_id}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </aside>
    </div>
  );
}
