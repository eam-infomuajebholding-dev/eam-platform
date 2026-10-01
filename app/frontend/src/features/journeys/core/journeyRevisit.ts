const TERMINAL_STEPS = new Set(['intake_complete', 'handoff_complete']);

const NON_REVISITABLE_FRAGMENTS = [
  '_confirm',
  'confirm_',
  'brief',
  'summary_review',
  'handoff',
  'procurement_invoice',
];

export function isRevisitBlockedStep(stepKey: string): boolean {
  if (TERMINAL_STEPS.has(stepKey)) {
    return true;
  }
  const lowered = stepKey.toLowerCase();
  return NON_REVISITABLE_FRAGMENTS.some((fragment) => lowered.includes(fragment));
}

export function priorRevisitableSteps(
  stepOrder: readonly string[],
  currentStep: string | null,
): string[] {
  if (!currentStep) {
    return [];
  }
  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex <= 0) {
    return [];
  }
  return stepOrder
    .slice(0, currentIndex)
    .filter((step) => !isRevisitBlockedStep(step));
}

const OPTIONAL_STEP_FRAGMENTS = [
  'documents',
  'requirements',
  'contractor_',
  'summary_review',
  'procurement_invoice',
  'materials_intake',
];

export function isOptionalJourneyStep(stepKey: string | null): boolean {
  if (!stepKey) {
    return false;
  }
  const lowered = stepKey.toLowerCase();
  return OPTIONAL_STEP_FRAGMENTS.some((fragment) => lowered.includes(fragment));
}
