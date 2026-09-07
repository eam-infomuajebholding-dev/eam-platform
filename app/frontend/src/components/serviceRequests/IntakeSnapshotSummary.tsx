import type { ServiceRequestIntakeSnapshot } from '@/serviceRequests/types';
import {
  DESIRED_SERVICE_OPTIONS,
  LAND_OWNERSHIP_OPTIONS,
} from '@/jos/journeys/buildVilla/constants';

interface IntakeSnapshotSummaryProps {
  snapshot: ServiceRequestIntakeSnapshot;
}

function labelForValue(
  options: { value: string; label: string }[],
  value?: string | null,
): string {
  if (!value) {
    return '—';
  }
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function IntakeSnapshotSummary({ snapshot }: IntakeSnapshotSummaryProps) {
  return (
    <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4 font-tajawal text-sm">
      <p><strong>المدينة:</strong> {snapshot.city ?? '—'}</p>
      <p><strong>حالة الأرض:</strong> {labelForValue(LAND_OWNERSHIP_OPTIONS, snapshot.land_ownership_type)}</p>
      <p><strong>المساحة:</strong> {snapshot.land_area_sqm != null ? `${snapshot.land_area_sqm} م²` : '—'}</p>
      <p><strong>الخدمة:</strong> {labelForValue(DESIRED_SERVICE_OPTIONS, snapshot.desired_service)}</p>
      {snapshot.has_documents != null ? (
        <p><strong>المستندات:</strong> {snapshot.has_documents ? 'متوفرة' : 'غير متوفرة'}</p>
      ) : null}
      {snapshot.document_notes ? <p><strong>ملاحظات:</strong> {snapshot.document_notes}</p> : null}
      {snapshot.document_refs && snapshot.document_refs.length > 0 ? (
        <div>
          <strong>روابط المستندات:</strong>
          <ul className="mt-1 list-disc ps-5">
            {snapshot.document_refs.map((ref) => (
              <li key={`${ref.label}-${ref.url ?? 'no-url'}`}>{ref.label}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
