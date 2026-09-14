import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import {
  useJourneyStandardConfirmStep,
  isStandardConfirmStep,
} from '@/features/journeys/core/JourneyStandardConfirmSteps';
import { useUrgencyOptions } from '@/features/journeys/core/journeySharedOptions';
import {
  JourneySelectField,
  JourneyTextArea,
  JourneyTextField,
} from '@/features/journeys/core/JourneyFieldControls';
import {
  DOCUMENTS_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  STEP_LABELS,
} from './constants';
import { type GovernmentServicesStepValues } from './errors';
import type { GovernmentServicesContext } from './types';

type Props = JourneyStepPanelProps<GovernmentServicesStepValues, GovernmentServicesContext>;

export default function GovernmentServicesStepPanel({
  currentStep,
  context,
  values,
  onChange,
  fieldErrors,
  formError,
  isLoading,
  isTerminal,
  isCompleted,
  onAdvance,
  onComplete,
  completedMessage,
  sectorId,
}: Props) {
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<GovernmentServicesStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'service_category':
        return (
          <JourneySelectField
            label="ما نوع الخدمة الحكومية المطلوبة؟"
            value={values.serviceCategory}
            options={SERVICE_CATEGORY_OPTIONS}
            onChange={(serviceCategory) => update({ serviceCategory })}
          />
        );
      case 'property_location':
        return (
          <JourneyTextField
            value={values.propertyLocation}
            onChange={(propertyLocation) => update({ propertyLocation })}
            placeholder="أين يقع العقار؟ (المدينة/الحي)"
          />
        );
      case 'property_type':
        return (
          <JourneySelectField
            label="نوع العقار"
            value={values.propertyType}
            options={PROPERTY_TYPE_OPTIONS}
            onChange={(propertyType) => update({ propertyType })}
          />
        );
      case 'request_summary':
        return (
          <JourneyTextArea
            value={values.requestSummary}
            onChange={(requestSummary) => update({ requestSummary })}
            placeholder="صف طلبك باختصار — ما الذي تحتاج إنجازه؟"
          />
        );
      case 'documents_status':
        return (
          <JourneySelectField
            label="ما حالة المستندات المتاحة؟"
            value={values.documentsStatus}
            options={DOCUMENTS_STATUS_OPTIONS}
            onChange={(documentsStatus) => update({ documentsStatus })}
          />
        );
      case 'urgency_context':
        return (
          <JourneySelectField
            label="ما مستوى الأولوية؟"
            value={values.urgency}
            options={urgencyOptions}
            onChange={(urgency) => update({ urgency })}
          />
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>راجع ملخص طلبك قبل عرض خارطة المهام الأولية.</p>
            <ul className="list-disc pr-5">
              <li>الخدمة: {values.serviceCategory || '—'}</li>
              <li>الموقع: {values.propertyLocation || '—'}</li>
              <li>نوع العقار: {values.propertyType || '—'}</li>
            </ul>
          </div>
        );
      case 'task_roadmap_brief':
        return brief ? <PreliminaryBriefCard brief={brief} /> : null;
      default:
        return null;
    }
  };

  return (
    <JourneyStepPanelShell
      currentStep={currentStep}
      stepLabels={STEP_LABELS}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      isTerminal={isTerminal}
      isCompleted={isCompleted}
      completedMessage={completedMessage}
      onAdvance={onAdvance}
      onComplete={onComplete}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
