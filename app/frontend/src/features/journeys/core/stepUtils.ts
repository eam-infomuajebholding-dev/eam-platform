/** Step order helpers — pass each journey's STEP_ORDER once. */

export function createStepHelpers(stepOrder: readonly string[]) {
  const terminalStep = stepOrder[stepOrder.length - 1];

  function getStepNumber(stepKey: string): number {
    const index = stepOrder.indexOf(stepKey);
    if (index < 0) {
      return 0;
    }
    return index + 1;
  }

  function getTotalSteps(): number {
    return Math.max(stepOrder.length - 1, 1);
  }

  function isProgressTerminal(stepKey: string | null): boolean {
    return stepKey === terminalStep || stepKey === 'intake_complete' || stepKey === 'handoff_complete';
  }

  function resolveStepProgress(stepKey: string | null): number {
    if (!stepKey || isProgressTerminal(stepKey)) {
      return getTotalSteps();
    }
    return getStepNumber(stepKey);
  }

  return {
    terminalStep,
    getStepNumber,
    getTotalSteps,
    isProgressTerminal,
    resolveStepProgress,
  };
}
