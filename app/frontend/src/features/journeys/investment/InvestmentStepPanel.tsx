import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import {
  isStandardConfirmStep,
  useJourneyStandardConfirmStep,
} from '@/features/journeys/core/JourneyStandardConfirmSteps';
import { useUrgencyOptions } from '@/features/journeys/core/journeySharedOptions';
import { JourneySelectField, JourneyTextArea, JourneyTextField } from '@/features/journeys/core/JourneyFieldControls';
import {
  CAPITAL_HORIZON_OPTIONS,
  DOCUMENTS_READINESS_OPTIONS,
  INTEREST_FOCUS_OPTIONS,
  INVESTOR_PROFILE_OPTIONS,
  RISK_COMFORT_OPTIONS,
  STEP_LABELS,
  STEP_ORDER,
} from './constants';
import type { InvestmentStepValues } from './errors';
import type { InvestmentContext } from './types';

type Props = JourneyStepPanelProps<InvestmentStepValues, InvestmentContext>;

export default function InvestmentStepPanel(props: Props) {
  const {
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
  } = props;
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<InvestmentStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;
    if (isStandardConfirmStep(currentStep) && standardConfirm) return standardConfirm;

    switch (currentStep) {
      case 'investor_profile':
        return (
          <JourneySelectField
            label="صفة المستثمر"
            value={values.investorProfile}
            options={INVESTOR_PROFILE_OPTIONS}
            onChange={(v) => update({ investorProfile: v })}
            error={fieldErrors.investor_profile}
          />
        );
      case 'interest_focus':
        return (
          <JourneySelectField
            label="محور الاهتمام"
            value={values.interestFocus}
            options={INTEREST_FOCUS_OPTIONS}
            onChange={(v) => update({ interestFocus: v })}
            error={fieldErrors.interest_focus}
          />
        );
      case 'capital_horizon':
        return (
          <JourneySelectField
            label="أفق رأس المال"
            value={values.capitalHorizon}
            options={CAPITAL_HORIZON_OPTIONS}
            onChange={(v) => update({ capitalHorizon: v })}
            error={fieldErrors.capital_horizon}
          />
        );
      case 'geography_focus':
        return (
          <JourneyTextField
            label="التركيز الجغرافي"
            value={values.geographyFocus}
            onChange={(v) => update({ geographyFocus: v })}
            error={fieldErrors.geography_focus}
          />
        );
      case 'risk_comfort':
        return (
          <JourneySelectField
            label="الراحة مع المخاطر"
            value={values.riskComfort}
            options={RISK_COMFORT_OPTIONS}
            onChange={(v) => update({ riskComfort: v })}
            error={fieldErrors.risk_comfort}
          />
        );
      case 'compliance_context':
        return (
          <JourneyTextArea
            label="ملاحظات امتثال (اختياري)"
            value={values.regulatoryNotes}
            onChange={(v) => update({ regulatoryNotes: v })}
            error={fieldErrors.regulatory_notes}
          />
        );
      case 'documents_readiness':
        return (
          <JourneySelectField
            label="جاهزية المستندات"
            value={values.documentsReadiness}
            options={DOCUMENTS_READINESS_OPTIONS}
            onChange={(v) => update({ documentsReadiness: v })}
            error={fieldErrors.documents_readiness}
          />
        );
      case 'timeline_context':
        return (
          <>
            <JourneyTextField
              label="الجدول المستهدف"
              value={values.targetTimeline}
              onChange={(v) => update({ targetTimeline: v })}
              error={fieldErrors.target_timeline}
            />
            <JourneySelectField
              label="الاستعجال"
              value={values.urgency}
              options={urgencyOptions}
              onChange={(v) => update({ urgency: v })}
              error={fieldErrors.urgency}
              optional
            />
          </>
        );
      case 'investment_interest_brief':
        return brief ? <PreliminaryBriefCard brief={brief} /> : null;
      default:
        return null;
    }
  };

  return (
    <JourneyStepPanelShell
      currentStep={currentStep}
      stepLabels={STEP_LABELS}
      stepOrder={STEP_ORDER}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      isTerminal={isTerminal}
      isCompleted={isCompleted}
      completedMessage={completedMessage}
      onAdvance={onAdvance}
      onComplete={onComplete}
      onRevisit={onRevisit}
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
