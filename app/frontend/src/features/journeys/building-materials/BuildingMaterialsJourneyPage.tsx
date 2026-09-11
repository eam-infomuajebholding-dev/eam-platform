import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import BuildingMaterialsStepPanel from './BuildingMaterialsStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type BuildingMaterialsStepValues,
} from './errors';
import { BUILDING_MATERIALS_JOURNEY_TYPE, type BuildingMaterialsContext } from './types';

const emptyValues = (): BuildingMaterialsStepValues => ({
  procurementGoal: '',
  materialCategory: '',
  projectContext: '',
  deliveryLocation: '',
  quantityScope: '',
  specificationsContext: '',
  targetTimeline: '',
  urgency: '',
  budgetContext: '',
  supplierContext: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function BuildingMaterialsJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<BuildingMaterialsStepValues>(emptyValues);

  const isBmInstance = currentInstance?.journey_type === BUILDING_MATERIALS_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as BuildingMaterialsContext;
  const currentStep = isBmInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isBmInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isBmInstance) return;
    setStepValues({
      procurementGoal: context.procurement_goal ?? '',
      materialCategory: context.material_category ?? '',
      projectContext: context.project_context ?? '',
      deliveryLocation: context.delivery_location ?? '',
      quantityScope: context.quantity_scope ?? '',
      specificationsContext: context.specifications_context ?? '',
      targetTimeline: context.target_timeline ?? '',
      urgency: context.urgency ?? '',
      budgetContext: context.budget_context ?? '',
      supplierContext: context.supplier_context ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isBmInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: BUILDING_MATERIALS_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة مواد البناء. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isBmInstance) return;
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await advance(currentInstance.id, { input: buildAdvanceInput(currentStep, stepValues) });
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      setFormError(getErrorMessage(errors, 'تعذر إرسال هذه الخطوة.'));
    } finally {
      setIsLoading(false);
    }
  }, [advance, currentInstance, currentStep, isBmInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isBmInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isBmInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isBmInstance && !isCompleted;

  return (
    <JourneyShell
      title="مواد البناء"
      description="رحلة جاهزية توريد مواد البناء — من فهم احتياج التوريد والمواصفات إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة مواد البناء"
      onStart={handleStart}
      isLoading={isLoading}
      showStart={showStart}
      isCompleted={isCompleted}
      stepProgress={stepProgress}
      totalSteps={getTotalSteps()}
      progressVariant="bar"
      footer={
        isCompleted && user ? (
          <Link to="/my-requests" className="mt-6 block text-center text-gold hover:underline font-tajawal">
            الانتقال إلى طلباتي
          </Link>
        ) : null
      }
    >
      {isBmInstance && currentInstance ? (
        <BuildingMaterialsStepPanel
          currentStep={currentStep}
          context={context}
          values={stepValues}
          onChange={setStepValues}
          fieldErrors={fieldErrors}
          formError={formError}
          isLoading={isLoading}
          isTerminal={isTerminal}
          isCompleted={isCompleted}
          onAdvance={handleAdvance}
          onComplete={handleComplete}
        />
      ) : null}
    </JourneyShell>
  );
}
