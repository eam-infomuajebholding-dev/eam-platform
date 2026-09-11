import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import EquipmentStepPanel from './EquipmentStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type EquipmentStepValues,
} from './errors';
import { EQUIPMENT_JOURNEY_TYPE, type EquipmentContext } from './types';

const emptyValues = (): EquipmentStepValues => ({
  equipmentNeed: '',
  equipmentCategory: '',
  usageContext: '',
  location: '',
  engagementType: '',
  specificationsContext: '',
  targetTimeline: '',
  urgency: '',
  budgetContext: '',
  readinessContext: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function EquipmentJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<EquipmentStepValues>(emptyValues);

  const isEqInstance = currentInstance?.journey_type === EQUIPMENT_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as EquipmentContext;
  const currentStep = isEqInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isEqInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isEqInstance) return;
    setStepValues({
      equipmentNeed: context.equipment_need ?? '',
      equipmentCategory: context.equipment_category ?? '',
      usageContext: context.usage_context ?? '',
      location: context.location ?? '',
      engagementType: context.engagement_type ?? '',
      specificationsContext: context.specifications_context ?? '',
      targetTimeline: context.target_timeline ?? '',
      urgency: context.urgency ?? '',
      budgetContext: context.budget_context ?? '',
      readinessContext: context.readiness_context ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isEqInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: EQUIPMENT_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة المعدات والآلات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isEqInstance) return;
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
  }, [advance, currentInstance, currentStep, isEqInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isEqInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isEqInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isEqInstance && !isCompleted;

  return (
    <JourneyShell
      title="المعدات والآلات"
      description="رحلة جاهزية المعدات والآلات — من فهم احتياج التشغيل والمواصفات إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة المعدات والآلات"
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
      {isEqInstance && currentInstance ? (
        <EquipmentStepPanel
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
