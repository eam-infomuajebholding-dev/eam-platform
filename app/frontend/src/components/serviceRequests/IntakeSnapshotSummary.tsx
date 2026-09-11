import type { ServiceRequestIntakeSnapshot } from '@/features/service-requests/api/types';
import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import {
  DESIRED_SERVICE_OPTIONS,
  LAND_OWNERSHIP_OPTIONS,
} from '@/features/journeys/build-villa/constants';
import { DISCIPLINE_OPTIONS } from '@/features/journeys/engineering-consulting/constants';
import {
  BOQ_READINESS_OPTIONS,
  DESIGN_READINESS_OPTIONS,
  PROCUREMENT_GOAL_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  SCOPE_TYPE_OPTIONS,
  SITE_READINESS_OPTIONS,
} from '@/features/journeys/contracting/constants';
import {
  ASSET_TYPE_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS,
  INSPECTION_OPTIONS,
  OWNERSHIP_OPTIONS,
  VALUATION_PURPOSE_OPTIONS,
} from '@/features/journeys/real-estate-valuation/constants';
import {
  ACCESS_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS as MAINTENANCE_ENGAGEMENT_GOAL_OPTIONS,
  MAINTENANCE_CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
} from '@/features/journeys/smart-maintenance/constants';
import {
  BUDGET_STATE_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS as PM_ENGAGEMENT_GOAL_OPTIONS,
  PROJECT_STAGE_OPTIONS as PM_PROJECT_STAGE_OPTIONS,
  PROJECT_TYPE_OPTIONS as PM_PROJECT_TYPE_OPTIONS,
  SCOPE_CLARITY_OPTIONS,
} from '@/features/journeys/project-management/constants';
import {
  BUDGET_RANGE_OPTIONS,
  FURNISHING_GOAL_OPTIONS,
  PROCUREMENT_PREFERENCE_OPTIONS,
  PROJECT_STAGE_OPTIONS as FR_PROJECT_STAGE_OPTIONS,
  SPACE_TYPE_OPTIONS,
  STYLE_DIRECTION_OPTIONS,
} from '@/features/journeys/furnishing/constants';
import {
  ENGAGEMENT_GOAL_OPTIONS as FM_ENGAGEMENT_GOAL_OPTIONS,
  FACILITY_SCOPE_OPTIONS as FM_FACILITY_SCOPE_OPTIONS,
  FACILITY_TYPE_OPTIONS as FM_FACILITY_TYPE_OPTIONS,
  OPERATIONAL_CHALLENGE_OPTIONS as FM_OPERATIONAL_CHALLENGE_OPTIONS,
  SERVICE_MATURITY_OPTIONS as FM_SERVICE_MATURITY_OPTIONS,
  URGENCY_OPTIONS as FM_URGENCY_OPTIONS,
} from '@/features/journeys/facility-management/constants';
import {
  ASSET_CONTEXT_OPTIONS,
  CURRENT_STATUS_OPTIONS,
  DOCUMENTS_READINESS_OPTIONS,
  INTENDED_USE_OPTIONS,
  URGENCY_OPTIONS as RED_URGENCY_OPTIONS,
} from '@/features/journeys/real-estate-development/constants';
import {
  EXISTING_ASSETS_OPTIONS,
  MARKETING_GOAL_OPTIONS,
  MARKETING_STAGE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  URGENCY_OPTIONS as RM_URGENCY_OPTIONS,
} from '@/features/journeys/real-estate-marketing/constants';
import {
  MATERIAL_CATEGORY_OPTIONS,
  PROCUREMENT_GOAL_OPTIONS as BM_PROCUREMENT_GOAL_OPTIONS,
  QUANTITY_SCOPE_OPTIONS,
  URGENCY_OPTIONS as BM_URGENCY_OPTIONS,
} from '@/features/journeys/building-materials/constants';
import {
  ENGAGEMENT_TYPE_OPTIONS,
  EQUIPMENT_CATEGORY_OPTIONS,
  EQUIPMENT_NEED_OPTIONS,
  URGENCY_OPTIONS as EQ_URGENCY_OPTIONS,
} from '@/features/journeys/equipment/constants';

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
  const journeyType = snapshot.journey_type ?? 'build_villa';
  const brief = snapshot.preliminary_brief;

  if (journeyType === 'contracting') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>نوع المشروع:</strong> {labelForValue(PROJECT_TYPE_OPTIONS, snapshot.project_type)}</p>
          <p><strong>الوصف:</strong> {snapshot.project_description ?? '—'}</p>
          <p><strong>الموقع:</strong> {snapshot.location ?? '—'}</p>
          <p><strong>جاهزية التصميم:</strong> {labelForValue(DESIGN_READINESS_OPTIONS, snapshot.design_readiness)}</p>
          <p><strong>جاهزية BOQ:</strong> {labelForValue(BOQ_READINESS_OPTIONS, snapshot.boq_readiness)}</p>
          <p><strong>جاهزية الموقع:</strong> {labelForValue(SITE_READINESS_OPTIONS, snapshot.site_readiness)}</p>
          <p><strong>النطاق:</strong> {labelForValue(SCOPE_TYPE_OPTIONS, snapshot.scope_type)}</p>
          <p><strong>هدف الشراء:</strong> {labelForValue(PROCUREMENT_GOAL_OPTIONS, snapshot.procurement_goal)}</p>
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'project_management') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>نوع المشروع:</strong> {labelForValue(PM_PROJECT_TYPE_OPTIONS, snapshot.project_type)}</p>
          <p><strong>المرحلة:</strong> {labelForValue(PM_PROJECT_STAGE_OPTIONS, snapshot.project_stage)}</p>
          <p><strong>الهدف:</strong> {snapshot.project_objective ?? '—'}</p>
          <p><strong>الوضع الحالي:</strong> {snapshot.current_status ?? '—'}</p>
          <p><strong>وضوح النطاق:</strong> {labelForValue(SCOPE_CLARITY_OPTIONS, snapshot.scope_clarity)}</p>
          <p><strong>إطار الميزانية:</strong> {labelForValue(BUDGET_STATE_OPTIONS, snapshot.budget_state)}</p>
          {snapshot.main_challenges ? <p><strong>التحديات:</strong> {snapshot.main_challenges}</p> : null}
          {snapshot.top_risks ? <p><strong>المخاطر:</strong> {snapshot.top_risks}</p> : null}
          <p><strong>هدف الخدمة:</strong> {labelForValue(PM_ENGAGEMENT_GOAL_OPTIONS, snapshot.engagement_goal)}</p>
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'furnishing') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>نوع المساحة:</strong> {labelForValue(SPACE_TYPE_OPTIONS, snapshot.space_type)}</p>
          <p><strong>المرحلة:</strong> {labelForValue(FR_PROJECT_STAGE_OPTIONS, snapshot.project_stage)}</p>
          <p><strong>هدف التأثيث:</strong> {labelForValue(FURNISHING_GOAL_OPTIONS, snapshot.furnishing_goal)}</p>
          <p><strong>اتجاه التصميم:</strong> {labelForValue(STYLE_DIRECTION_OPTIONS, snapshot.style_direction)}</p>
          <p><strong>الأولويات:</strong> {snapshot.functional_priorities ?? '—'}</p>
          <p><strong>النطاق:</strong> {snapshot.room_scope ?? '—'}</p>
          <p><strong>فئة الميزانية:</strong> {labelForValue(BUDGET_RANGE_OPTIONS, snapshot.budget_range)}</p>
          <p><strong>التوريد:</strong> {labelForValue(PROCUREMENT_PREFERENCE_OPTIONS, snapshot.procurement_preference)}</p>
          {snapshot.target_timeline ? <p><strong>الجدول:</strong> {snapshot.target_timeline}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'real_estate_development') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>سياق الأصل:</strong> {labelForValue(ASSET_CONTEXT_OPTIONS, snapshot.asset_context)}</p>
          <p><strong>الموقع:</strong> {snapshot.asset_location ?? '—'}</p>
          <p><strong>الهدف التطويري:</strong> {snapshot.development_objective ?? '—'}</p>
          <p><strong>الاستخدام المستهدف:</strong> {labelForValue(INTENDED_USE_OPTIONS, snapshot.intended_use)}</p>
          <p><strong>الحالة الحالية:</strong> {labelForValue(CURRENT_STATUS_OPTIONS, snapshot.current_status)}</p>
          {snapshot.known_constraints ? <p><strong>القيود:</strong> {snapshot.known_constraints}</p> : null}
          <p><strong>المستندات:</strong> {labelForValue(DOCUMENTS_READINESS_OPTIONS, snapshot.documents_readiness)}</p>
          {snapshot.target_timeline ? <p><strong>الجدول:</strong> {snapshot.target_timeline}</p> : null}
          {snapshot.urgency ? <p><strong>الاستعجال:</strong> {labelForValue(RED_URGENCY_OPTIONS, snapshot.urgency)}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'real_estate_marketing') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>هدف التسويق:</strong> {labelForValue(MARKETING_GOAL_OPTIONS, snapshot.marketing_goal)}</p>
          <p><strong>وصف العقار:</strong> {snapshot.property_description ?? '—'}</p>
          <p><strong>الموقع:</strong> {snapshot.property_location ?? '—'}</p>
          <p><strong>الجمهور المستهدف:</strong> {labelForValue(TARGET_AUDIENCE_OPTIONS, snapshot.target_audience)}</p>
          <p><strong>مرحلة التسويق:</strong> {labelForValue(MARKETING_STAGE_OPTIONS, snapshot.marketing_stage)}</p>
          <p><strong>الأصول التسويقية:</strong> {labelForValue(EXISTING_ASSETS_OPTIONS, snapshot.existing_assets)}</p>
          {snapshot.channels_interest ? <p><strong>القنوات:</strong> {snapshot.channels_interest}</p> : null}
          {snapshot.target_timeline ? <p><strong>الجدول:</strong> {snapshot.target_timeline}</p> : null}
          {snapshot.urgency ? <p><strong>الاستعجال:</strong> {labelForValue(RM_URGENCY_OPTIONS, snapshot.urgency)}</p> : null}
          {snapshot.budget_context ? <p><strong>الميزانية:</strong> {snapshot.budget_context}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'building_materials') {
    const bmSnapshot = snapshot as ServiceRequestIntakeSnapshot & {
      material_category?: string;
      project_context?: string;
      delivery_location?: string;
      quantity_scope?: string;
      specifications_context?: string;
      budget_context?: string;
      supplier_context?: string;
    };
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>هدف التوريد:</strong> {labelForValue(BM_PROCUREMENT_GOAL_OPTIONS, bmSnapshot.procurement_goal)}</p>
          <p><strong>فئة المواد:</strong> {labelForValue(MATERIAL_CATEGORY_OPTIONS, bmSnapshot.material_category)}</p>
          <p><strong>سياق المشروع:</strong> {bmSnapshot.project_context ?? '—'}</p>
          <p><strong>موقع التسليم:</strong> {bmSnapshot.delivery_location ?? '—'}</p>
          <p><strong>نطاق الكميات:</strong> {labelForValue(QUANTITY_SCOPE_OPTIONS, bmSnapshot.quantity_scope)}</p>
          {bmSnapshot.specifications_context ? <p><strong>المواصفات:</strong> {bmSnapshot.specifications_context}</p> : null}
          {bmSnapshot.target_timeline ? <p><strong>الجدول:</strong> {bmSnapshot.target_timeline}</p> : null}
          {bmSnapshot.urgency ? <p><strong>الاستعجال:</strong> {labelForValue(BM_URGENCY_OPTIONS, bmSnapshot.urgency)}</p> : null}
          {bmSnapshot.budget_context ? <p><strong>الميزانية:</strong> {bmSnapshot.budget_context}</p> : null}
          {bmSnapshot.supplier_context ? <p><strong>المورد:</strong> {bmSnapshot.supplier_context}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'equipment') {
    const eqSnapshot = snapshot as ServiceRequestIntakeSnapshot & {
      equipment_need?: string;
      equipment_category?: string;
      usage_context?: string;
      engagement_type?: string;
      specifications_context?: string;
      budget_context?: string;
      readiness_context?: string;
    };
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>حاجة المعدات:</strong> {labelForValue(EQUIPMENT_NEED_OPTIONS, eqSnapshot.equipment_need)}</p>
          <p><strong>فئة المعدات:</strong> {labelForValue(EQUIPMENT_CATEGORY_OPTIONS, eqSnapshot.equipment_category)}</p>
          <p><strong>سياق الاستخدام:</strong> {eqSnapshot.usage_context ?? '—'}</p>
          <p><strong>الموقع:</strong> {eqSnapshot.location ?? '—'}</p>
          <p><strong>نوع التعاقد:</strong> {labelForValue(ENGAGEMENT_TYPE_OPTIONS, eqSnapshot.engagement_type)}</p>
          {eqSnapshot.specifications_context ? <p><strong>المواصفات:</strong> {eqSnapshot.specifications_context}</p> : null}
          {eqSnapshot.target_timeline ? <p><strong>الجدول:</strong> {eqSnapshot.target_timeline}</p> : null}
          {eqSnapshot.urgency ? <p><strong>الاستعجال:</strong> {labelForValue(EQ_URGENCY_OPTIONS, eqSnapshot.urgency)}</p> : null}
          {eqSnapshot.budget_context ? <p><strong>الميزانية:</strong> {eqSnapshot.budget_context}</p> : null}
          {eqSnapshot.readiness_context ? <p><strong>الجاهزية:</strong> {eqSnapshot.readiness_context}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'government_services') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>نوع الخدمة:</strong> {snapshot.service_category ?? '—'}</p>
          <p><strong>الموقع:</strong> {snapshot.property_location ?? '—'}</p>
          <p><strong>نوع العقار:</strong> {snapshot.property_type ?? '—'}</p>
          <p><strong>وصف الطلب:</strong> {snapshot.request_summary ?? '—'}</p>
          <p><strong>المستندات:</strong> {snapshot.documents_status ?? '—'}</p>
          {snapshot.urgency ? <p><strong>الأولوية:</strong> {snapshot.urgency}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'facility_management') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>نوع المنشأة:</strong> {labelForValue(FM_FACILITY_TYPE_OPTIONS, snapshot.facility_type)}</p>
          <p><strong>الموقع:</strong> {snapshot.location ?? '—'}</p>
          <p><strong>نطاق المرافق:</strong> {labelForValue(FM_FACILITY_SCOPE_OPTIONS, snapshot.facility_scope)}</p>
          <p><strong>التحدي التشغيلي:</strong> {labelForValue(FM_OPERATIONAL_CHALLENGE_OPTIONS, snapshot.operational_challenge)}</p>
          <p><strong>نضج الخدمة:</strong> {labelForValue(FM_SERVICE_MATURITY_OPTIONS, snapshot.service_maturity)}</p>
          <p><strong>هدف التعاقد:</strong> {labelForValue(FM_ENGAGEMENT_GOAL_OPTIONS, snapshot.engagement_goal)}</p>
          {snapshot.target_timeline ? <p><strong>الجدول:</strong> {snapshot.target_timeline}</p> : null}
          {snapshot.urgency ? <p><strong>الاستعجال:</strong> {labelForValue(FM_URGENCY_OPTIONS, snapshot.urgency)}</p> : null}
          {snapshot.current_readiness ? <p><strong>الجاهزية الحالية:</strong> {snapshot.current_readiness}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'smart_maintenance') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>نوع الصيانة:</strong> {labelForValue(MAINTENANCE_CATEGORY_OPTIONS, snapshot.maintenance_category)}</p>
          <p><strong>الموقع:</strong> {snapshot.location ?? '—'}</p>
          <p><strong>وصف المشكلة:</strong> {snapshot.issue_description ?? '—'}</p>
          <p><strong>درجة الأولوية:</strong> {labelForValue(SEVERITY_OPTIONS, snapshot.severity_level)}</p>
          <p><strong>جاهزية الوصول:</strong> {labelForValue(ACCESS_OPTIONS, snapshot.access_readiness)}</p>
          {snapshot.system_notes ? <p><strong>ملاحظات النظام:</strong> {snapshot.system_notes}</p> : null}
          {snapshot.prior_maintenance != null ? (
            <p><strong>سجل صيانة سابق:</strong> {snapshot.prior_maintenance ? 'نعم' : 'لا'}</p>
          ) : null}
          {snapshot.service_notes ? <p><strong>ملاحظات الصيانة:</strong> {snapshot.service_notes}</p> : null}
          <p><strong>هدف الخدمة:</strong> {labelForValue(MAINTENANCE_ENGAGEMENT_GOAL_OPTIONS, snapshot.engagement_goal)}</p>
          {snapshot.desired_timeline ? <p><strong>الجدول الزمني:</strong> {snapshot.desired_timeline}</p> : null}
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'real_estate_valuation') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>غرض التقييم:</strong> {labelForValue(VALUATION_PURPOSE_OPTIONS, snapshot.valuation_purpose)}</p>
          <p><strong>نوع الأصل:</strong> {labelForValue(ASSET_TYPE_OPTIONS, snapshot.asset_type)}</p>
          <p><strong>الوصف:</strong> {snapshot.asset_description ?? '—'}</p>
          <p><strong>الموقع:</strong> {snapshot.location ?? '—'}</p>
          {snapshot.area_sqm != null ? <p><strong>المساحة:</strong> {snapshot.area_sqm} م²</p> : null}
          <p><strong>الملكية:</strong> {labelForValue(OWNERSHIP_OPTIONS, snapshot.ownership_status)}</p>
          <p><strong>جاهزية المعاينة:</strong> {labelForValue(INSPECTION_OPTIONS, snapshot.inspection_readiness)}</p>
          <p><strong>هدف الخدمة:</strong> {labelForValue(ENGAGEMENT_GOAL_OPTIONS, snapshot.engagement_goal)}</p>
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  if (journeyType === 'engineering_consulting') {
    return (
      <div className="space-y-4 font-tajawal text-sm">
        <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
          <p><strong>المشكلة / الطلب:</strong> {snapshot.problem_statement ?? '—'}</p>
          {snapshot.desired_outcome ? <p><strong>النتيجة المرجوة:</strong> {snapshot.desired_outcome}</p> : null}
          <p><strong>التخصص:</strong> {labelForValue(DISCIPLINE_OPTIONS, snapshot.discipline)}</p>
          <p><strong>الموقع:</strong> {snapshot.location ?? '—'}</p>
          <p><strong>الهدف:</strong> {snapshot.objective ?? '—'}</p>
        </div>
        {brief ? <PreliminaryBriefCard brief={brief} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4 font-tajawal text-sm">
      <div className="space-y-2 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-4">
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
      {brief ? <PreliminaryBriefCard brief={brief} /> : null}
    </div>
  );
}
