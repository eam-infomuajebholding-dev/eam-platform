import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import {
  useJourneyStandardConfirmStep,
  isStandardConfirmStep,
} from '@/features/journeys/core/JourneyStandardConfirmSteps';
import {
  JourneyRadioGroup,
  JourneySelectField,
  JourneyTextArea,
  JourneyTextField,
} from '@/features/journeys/core/JourneyFieldControls';
import { DISCIPLINE_OPTIONS, PROJECT_TYPE_OPTIONS, STEP_LABELS, STEP_ORDER } from './constants';
import { type EngineeringStepValues } from './errors';
import type { EngineeringConsultingContext } from './types';

type Props = JourneyStepPanelProps<EngineeringStepValues, EngineeringConsultingContext>;

export default function EngineeringConsultingStepPanel({
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
  onRevisit,
  completedMessage,
  sectorId,
}: Props) {
  const update = (patch: Partial<EngineeringStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;

    if (isStandardConfirmStep(currentStep) && standardConfirm) {
      return standardConfirm;
    }

    switch (currentStep) {
      case 'intent':
        return (
          <div className="space-y-3">
            <JourneyTextArea
              value={values.problemStatement}
              onChange={(problemStatement) => update({ problemStatement })}
              placeholder="صف المشكلة أو الاستشارة المطلوبة..."
            />
            <JourneyTextField
              value={values.desiredOutcome}
              onChange={(desiredOutcome) => update({ desiredOutcome })}
              placeholder="النتيجة المرجوة (اختياري)"
            />
          </div>
        );
      case 'discipline':
        return (
          <JourneyRadioGroup
            name="discipline"
            value={values.discipline}
            options={DISCIPLINE_OPTIONS}
            onChange={(discipline) => update({ discipline })}
          />
        );
      case 'qualification':
        return (
          <div className="space-y-3">
            <JourneySelectField
              label="نوع المشروع"
              value={values.projectType}
              options={PROJECT_TYPE_OPTIONS}
              onChange={(projectType) => update({ projectType })}
            />
            <JourneyTextField
              value={values.location}
              onChange={(location) => update({ location })}
              placeholder="الموقع"
            />
            <JourneyTextArea
              value={values.objective}
              onChange={(objective) => update({ objective })}
              placeholder="هدف المشروع"
              minHeight="80px"
            />
          </div>
        );
      case 'documents':
        return (
          <JourneyTextArea
            value={values.documentNotes}
            onChange={(documentNotes) => update({ documentNotes })}
            placeholder="ملاحظات أو روابط للمستندات (اختياري)"
            minHeight="80px"
          />
        );
      case 'brief_review':
        return brief ? <PreliminaryBriefCard brief={brief} /> : null;
      case 'handoff_complete':
        return (
          <p className="text-sm text-ink-secondary">
            تم تجهيز طلب الاستشارة الهندسية. سجّل الدخول لإرسال الطلب ومتابعته في مساحة العمل.
          </p>
        );
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
      stepOrder={STEP_ORDER}
      onAdvance={onAdvance}
      onComplete={onComplete}
      onRevisit={onRevisit}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
