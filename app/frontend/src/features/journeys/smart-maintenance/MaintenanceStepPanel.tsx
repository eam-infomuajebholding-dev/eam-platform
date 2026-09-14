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
  ACCESS_OPTIONS,
  ENGAGEMENT_GOAL_OPTIONS,
  MAINTENANCE_CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  STEP_LABELS,
} from './constants';
import { type MaintenanceStepValues } from './errors';
import type { SmartMaintenanceContext } from './types';

type Props = JourneyStepPanelProps<MaintenanceStepValues, SmartMaintenanceContext>;

export default function MaintenanceStepPanel({
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
  const update = (patch: Partial<MaintenanceStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'maintenance_category':
        return (
          <JourneySelectField
            label="نوع الصيانة"
            value={values.maintenanceCategory}
            options={MAINTENANCE_CATEGORY_OPTIONS}
            onChange={(maintenanceCategory) => update({ maintenanceCategory })}
          />
        );
      case 'asset_location':
        return (
          <JourneyTextField
            value={values.location}
            onChange={(location) => update({ location })}
            placeholder="المدينة / الموقع / المبنى"
          />
        );
      case 'issue_description':
        return (
          <JourneyTextArea
            value={values.issueDescription}
            onChange={(issueDescription) => update({ issueDescription })}
            placeholder="صف المشكلة أو عطل الصيانة المطلوب..."
          />
        );
      case 'severity_level':
        return (
          <JourneySelectField
            label="درجة الأولوية"
            value={values.severityLevel}
            options={SEVERITY_OPTIONS}
            onChange={(severityLevel) => update({ severityLevel })}
          />
        );
      case 'access_readiness':
        return (
          <JourneySelectField
            label="جاهزية الوصول"
            value={values.accessReadiness}
            options={ACCESS_OPTIONS}
            onChange={(accessReadiness) => update({ accessReadiness })}
          />
        );
      case 'system_context':
        return (
          <JourneyTextArea
            value={values.systemNotes}
            onChange={(systemNotes) => update({ systemNotes })}
            placeholder="نوع النظام / العمر / ملاحظات فنية (اختياري)"
            minHeight="80px"
          />
        );
      case 'prior_service_context':
        return (
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.priorMaintenance === true}
                onChange={(e) => update({ priorMaintenance: e.target.checked })}
              />
              <span>يوجد سجل صيانة سابق</span>
            </label>
            <JourneyTextArea
              value={values.serviceNotes}
              onChange={(serviceNotes) => update({ serviceNotes })}
              placeholder="ملاحظات عن الصيانة السابقة (اختياري)"
              minHeight="80px"
            />
          </div>
        );
      case 'engagement_goal':
        return (
          <JourneySelectField
            label="هدف الخدمة"
            value={values.engagementGoal}
            options={ENGAGEMENT_GOAL_OPTIONS}
            onChange={(engagementGoal) => update({ engagementGoal })}
          />
        );
      case 'timeline_context':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.desiredTimeline}
              onChange={(desiredTimeline) => update({ desiredTimeline })}
              placeholder="متى تحتاج المعالجة؟"
            />
            <JourneySelectField
              label="الاستعجال (اختياري)"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(urgency) => update({ urgency })}
            />
          </div>
        );
      case 'summary_review':
        return (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>{values.issueDescription}</p>
            <p>الموقع: {values.location}</p>
            <p>النوع: {values.maintenanceCategory}</p>
          </div>
        );
      case 'readiness_brief':
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
