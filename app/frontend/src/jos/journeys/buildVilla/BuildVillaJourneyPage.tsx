import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useJourney } from '@/jos/useJourney';
import BuildVillaStepPanel, { type BuildVillaStepValues } from '@/jos/journeys/buildVilla/BuildVillaStepPanel';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
} from '@/jos/journeys/buildVilla/errors';
import type { BuildVillaContext } from '@/jos/journeys/buildVilla/types';
import { getStepNumber, getTotalSteps } from '@/jos/journeys/buildVilla/constants';
import { BUILD_VILLA_JOURNEY_TYPE } from '@/jos/journeys/buildVilla/types';

const emptyStepValues = (): BuildVillaStepValues => ({
  city: '',
  landOwnershipType: '',
  landAreaSqm: '',
  hasDocuments: null,
  documentNotes: '',
  desiredService: '',
});

export default function BuildVillaJourneyPage() {
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<BuildVillaStepValues>(emptyStepValues);

  const context = (currentInstance?.context ?? {}) as BuildVillaContext;
  const currentStep = currentInstance?.current_step_key ?? null;
  const isCompleted = currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance) {
      return;
    }
    setStepValues({
      city: context.city ?? '',
      landOwnershipType: context.land_ownership_type ?? '',
      landAreaSqm: context.land_area_sqm != null ? String(context.land_area_sqm) : '',
      hasDocuments: context.has_documents ?? null,
      documentNotes: context.document_notes ?? '',
      desiredService: context.desired_service ?? '',
    });
  }, [currentInstance, context.city, context.desired_service, context.document_notes, context.has_documents, context.land_area_sqm, context.land_ownership_type]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: BUILD_VILLA_JOURNEY_TYPE });
    } catch (error) {
      setFormError('تعذر بدء الرحلة. يرجى المحاولة مرة أخرى.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance) {
      return;
    }
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    const input = buildAdvanceInput(currentStep, stepValues);
    try {
      await advance(currentInstance.id, { input });
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      setFormError(getErrorMessage(errors, 'تعذر إرسال هذه الخطوة. يرجى مراجعة البيانات.'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [advance, currentInstance, currentStep, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance) {
      return;
    }
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch (error) {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') {
      return getTotalSteps();
    }
    return getStepNumber(currentStep);
  }, [currentStep]);

  return (
    <Layout>
      <section className="py-16 md:py-24 bg-white dark:bg-[#6B6B6B] min-h-[70vh]">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="gold-text text-3xl md:text-4xl font-bold font-playfair mb-3">رحلة بناء فيلا</h1>
            <p className="text-gray-600 dark:text-white/70 font-tajawal">
              جمع معلومات أولية لبدء مشروعك — خطوة واحدة في كل مرة.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-gray-50 dark:bg-white/5 p-6 md:p-8">
            {!currentInstance && !isCompleted && (
              <div className="text-center space-y-6">
                <p className="font-tajawal text-gray-600 dark:text-white/70">
                  ابدأ رحلة جمع المعلومات لمعرفة احتياجات مشروع بناء الفيلا.
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-tajawal font-semibold text-white disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  بدء الرحلة
                </button>
              </div>
            )}

            {currentInstance && !isCompleted && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-white/60 font-tajawal mb-2">
                  <span>الخطوة {Math.min(stepProgress, getTotalSteps())} من {getTotalSteps()}</span>
                  <span>{currentStep}</span>
                </div>
                <BuildVillaStepPanel
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
              </div>
            )}

            {isCompleted && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold font-tajawal">تم إكمال رحلة جمع المعلومات</h2>
                <p className="font-tajawal text-gray-600 dark:text-white/70">
                  تم حفظ مسودة الطلب الأولية. سيتم متابعة الخطوات التشغيلية في مرحلة لاحقة.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
