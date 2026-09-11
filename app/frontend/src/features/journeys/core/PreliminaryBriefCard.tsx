interface BriefLike {
  title?: string;
  status?: string;
  assistance?: string;
  professional_review_required?: boolean;
  disclaimer?: string;
  project_objective?: string;
  understood_request?: string;
  discipline_label?: string;
  location?: { city?: string };
  project_intent?: {
    city?: string;
    desired_service_label?: string;
  };
  land_summary?: {
    ownership_label?: string;
    area_sqm?: number;
    city?: string;
  };
  household_summary?: {
    household_size?: number;
    use_summary?: string;
  };
  space_program_summary?: {
    floors?: number;
    bedrooms?: number;
    selected_spaces?: string[];
  };
  budget_context?: {
    budget_range_label?: string;
  };
  timeline_context?: {
    desired_start_label?: string;
    urgency?: string;
  };
  design_direction?: {
    design_style_label?: string;
  };
  requested_eam_scope?: {
    desired_service_label?: string;
  };
  preliminary_considerations?: string[];
  missing_information?: string[];
  recommended_next_step?: string;
  regulatory_disclaimer?: string;
  information_gaps?: string[];
  diligence_checklist?: string[];
}

interface Props {
  brief: BriefLike;
  className?: string;
}

export default function PreliminaryBriefCard({ brief, className = '' }: Props) {
  const city = brief.location?.city ?? brief.project_intent?.city;
  const serviceLabel =
    brief.requested_eam_scope?.desired_service_label ?? brief.project_intent?.desired_service_label;

  return (
    <div
      className={`space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/20 p-4 text-sm font-tajawal text-ink dark:text-white/90 ${className}`}
      dir="rtl"
    >
      <p className="font-bold text-amber-900 dark:text-amber-200">{brief.title}</p>
      <p className="text-xs text-amber-800 dark:text-amber-300/90">
        {brief.status}
        {brief.assistance ? ` · ${brief.assistance}` : ''}
        {brief.professional_review_required ? ' · مراجعة مهنية مطلوبة' : ''}
      </p>

      {brief.disclaimer || brief.regulatory_disclaimer ? (
        <p className="rounded-lg bg-amber-100/70 dark:bg-amber-900/20 px-3 py-2 text-xs leading-relaxed">
          {brief.disclaimer ?? brief.regulatory_disclaimer}
        </p>
      ) : null}

      {brief.project_objective ? <p><strong>هدف المشروع:</strong> {brief.project_objective}</p> : null}
      {brief.understood_request ? <p>{brief.understood_request}</p> : null}
      {brief.discipline_label ? <p><strong>التخصص:</strong> {brief.discipline_label}</p> : null}

      {city ? <p><strong>المدينة:</strong> {city}</p> : null}
      {serviceLabel ? <p><strong>الخدمة المطلوبة:</strong> {serviceLabel}</p> : null}

      {brief.land_summary ? (
        <div className="space-y-1 text-ink/90 dark:text-white/80">
          {brief.land_summary.ownership_label ? (
            <p><strong>حالة الأرض:</strong> {brief.land_summary.ownership_label}</p>
          ) : null}
          {brief.land_summary.area_sqm != null ? (
            <p><strong>المساحة:</strong> {brief.land_summary.area_sqm} م²</p>
          ) : null}
        </div>
      ) : null}

      {brief.household_summary?.use_summary ? (
        <p><strong>احتياجات الأسرة:</strong> {brief.household_summary.use_summary}</p>
      ) : null}

      {brief.space_program_summary?.selected_spaces?.length ? (
        <p>
          <strong>برنامج المساحات:</strong>{' '}
          {brief.space_program_summary.selected_spaces.join('، ')}
        </p>
      ) : null}

      {brief.budget_context?.budget_range_label ? (
        <p><strong>نطاق الميزانية:</strong> {brief.budget_context.budget_range_label}</p>
      ) : null}

      {brief.timeline_context?.desired_start_label ? (
        <p><strong>البدء المتوقع:</strong> {brief.timeline_context.desired_start_label}</p>
      ) : null}

      {brief.design_direction?.design_style_label ? (
        <p><strong>تفضيل التصميم:</strong> {brief.design_direction.design_style_label}</p>
      ) : null}

      {brief.information_gaps && brief.information_gaps.length > 0 ? (
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-200">فجوات معلوماتية:</p>
          <ul className="mt-1 list-disc ps-5 text-ink/80 dark:text-white/70">
            {brief.information_gaps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {brief.diligence_checklist && brief.diligence_checklist.length > 0 ? (
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-200">قائمة تحقق أولية:</p>
          <ul className="mt-1 list-disc ps-5 text-ink/80 dark:text-white/70">
            {brief.diligence_checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {brief.missing_information && brief.missing_information.length > 0 ? (
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-200">معلومات إضافية مطلوبة لاحقاً:</p>
          <ul className="mt-1 list-disc ps-5 text-ink/80 dark:text-white/70">
            {brief.missing_information.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {brief.preliminary_considerations?.map((line) => (
        <p key={line} className="text-ink/80 dark:text-white/70">
          • {line}
        </p>
      ))}

      {brief.recommended_next_step ? <p className="font-medium">{brief.recommended_next_step}</p> : null}
    </div>
  );
}
