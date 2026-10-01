import PreliminaryBriefCard from '@/features/journeys/core/PreliminaryBriefCard';
import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import { isStandardConfirmStep, useJourneyStandardConfirmStep } from '@/features/journeys/core/JourneyStandardConfirmSteps';
import { useUrgencyOptions } from '@/features/journeys/core/journeySharedOptions';
import { JourneySelectField, JourneyTextArea, JourneyTextField } from '@/features/journeys/core/JourneyFieldControls';
import {
  PARTNERSHIP_OPTIONS,
  QUALITY_OPTIONS,
  STEP_LABELS,
  STEP_ORDER,
  SUPPLIER_ROLE_OPTIONS,
} from './constants';
import type { FactoriesSuppliersStepValues } from './errors';
import type { FactoriesSuppliersContext } from './types';

type Props = JourneyStepPanelProps<FactoriesSuppliersStepValues, FactoriesSuppliersContext>;

export default function FactoriesSuppliersStepPanel(props: Props) {
  const { currentStep, context, values, onChange, fieldErrors, formError, isLoading, isTerminal, isCompleted, onAdvance, onComplete, onRevisit, completedMessage, sectorId } = props;
  const urgencyOptions = useUrgencyOptions();
  const update = (patch: Partial<FactoriesSuppliersStepValues>) => onChange({ ...values, ...patch });
  const standardConfirm = useJourneyStandardConfirmStep(sectorId, currentStep, values, update);
  const brief = context.preliminary_brief;

  const renderFields = () => {
    if (!currentStep) return null;
    if (isStandardConfirmStep(currentStep) && standardConfirm) return standardConfirm;
    switch (currentStep) {
      case 'supplier_role':
        return <JourneySelectField label="دور المورد" value={values.supplierRole} options={SUPPLIER_ROLE_OPTIONS} onChange={(v) => update({ supplierRole: v })} error={fieldErrors.supplier_role} />;
      case 'product_category':
        return <JourneyTextField label="فئة المنتج" value={values.productCategory} onChange={(v) => update({ productCategory: v })} error={fieldErrors.product_category} />;
      case 'supply_coverage':
        return <JourneyTextField label="نطاق التوريد" value={values.supplyCoverage} onChange={(v) => update({ supplyCoverage: v })} error={fieldErrors.supply_coverage} />;
      case 'quality_standards':
        return <JourneySelectField label="معايير الجودة" value={values.qualityStandards} options={QUALITY_OPTIONS} onChange={(v) => update({ qualityStandards: v })} error={fieldErrors.quality_standards} />;
      case 'partnership_intent':
        return <JourneySelectField label="نية الشراكة" value={values.partnershipIntent} options={PARTNERSHIP_OPTIONS} onChange={(v) => update({ partnershipIntent: v })} error={fieldErrors.partnership_intent} />;
      case 'timeline_context':
        return (
          <>
            <JourneyTextField label="الجدول" value={values.targetTimeline} onChange={(v) => update({ targetTimeline: v })} error={fieldErrors.target_timeline} />
            <JourneySelectField label="الاستعجال" value={values.urgency} options={urgencyOptions} onChange={(v) => update({ urgency: v })} optional />
          </>
        );
      case 'readiness_context':
        return <JourneyTextArea label="الوضع الحالي (اختياري)" value={values.currentReadiness} onChange={(v) => update({ currentReadiness: v })} />;
      case 'supplier_readiness_brief':
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
