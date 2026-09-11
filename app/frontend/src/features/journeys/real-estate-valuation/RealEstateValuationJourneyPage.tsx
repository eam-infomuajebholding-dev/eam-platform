import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import ValuationStepPanel from './ValuationStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type ValuationStepValues,
} from './errors';
import { REAL_ESTATE_VALUATION_JOURNEY_TYPE, type RealEstateValuationContext } from './types';

const emptyValues = (): ValuationStepValues => ({
  valuationPurpose: '',
  assetType: '',
  location: '',
  assetDescription: '',
  areaSqm: '',
  ownershipStatus: '',
  deedAvailable: null,
  titleDocsAvailable: null,
  rentRollAvailable: null,
  plansAvailable: null,
  documentNotes: '',
  inspectionReadiness: '',
  desiredTimeline: '',
  urgency: '',
  engagementGoal: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function RealEstateValuationJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<ValuationStepValues>(emptyValues);

  const isValuationInstance = currentInstance?.journey_type === REAL_ESTATE_VALUATION_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as RealEstateValuationContext;
  const currentStep = isValuationInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isValuationInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isValuationInstance) return;
    setStepValues({
      valuationPurpose: context.valuation_purpose ?? '',
      assetType: context.asset_type ?? '',
      location: context.location ?? '',
      assetDescription: context.asset_description ?? '',
      areaSqm: context.area_sqm != null ? String(context.area_sqm) : '',
      ownershipStatus: context.ownership_status ?? '',
      deedAvailable: context.deed_available ?? null,
      titleDocsAvailable: context.title_docs_available ?? null,
      rentRollAvailable: context.rent_roll_available ?? null,
      plansAvailable: context.plans_available ?? null,
      documentNotes: context.document_notes ?? '',
      inspectionReadiness: context.inspection_readiness ?? '',
      desiredTimeline: context.desired_timeline ?? '',
      urgency: context.urgency ?? '',
      engagementGoal: context.engagement_goal ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isValuationInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: REAL_ESTATE_VALUATION_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة التقييم العقاري. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isValuationInstance) return;
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
  }, [advance, currentInstance, currentStep, isValuationInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isValuationInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isValuationInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isValuationInstance && !isCompleted;

  return (
    <JourneyShell
      title="التقييم العقاري"
      description="رحلة جاهزية التقييم — من فهم الأصل إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة جاهزية التقييم العقاري"
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
      {isValuationInstance && currentInstance ? (
        <ValuationStepPanel
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
