import { priorRevisitableSteps } from '@/features/journeys/core/journeyRevisit';

type Props = {
  stepOrder: readonly string[];
  currentStep: string | null;
  stepLabels: Record<string, string>;
  onRevisit?: (targetStep: string) => void;
  isLoading?: boolean;
};

export default function JourneyStepRevisitBar({
  stepOrder,
  currentStep,
  stepLabels,
  onRevisit,
  isLoading,
}: Props) {
  if (!onRevisit) {
    return null;
  }

  const priorSteps = priorRevisitableSteps(stepOrder, currentStep);
  if (priorSteps.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-gold/15 bg-surface-alt/80 px-3 py-2 text-xs"
      dir="rtl"
    >
      <p className="text-ink-secondary mb-2">العودة لتعديل خطوة سابقة:</p>
      <div className="flex flex-wrap gap-2">
        {priorSteps.map((stepKey) => (
          <button
            key={stepKey}
            type="button"
            disabled={isLoading}
            onClick={() => onRevisit(stepKey)}
            className="rounded-md border border-gold/30 px-2 py-1 font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            {stepLabels[stepKey] ?? stepKey}
          </button>
        ))}
      </div>
    </div>
  );
}
