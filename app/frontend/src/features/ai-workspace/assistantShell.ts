/** Dock UI preference — compact launcher vs full composer (same tab only). */
export const ASSISTANT_MINIMIZED_KEY = 'eam-assistant-minimized';

export const ASSISTANT_RESTORE_EVENT = 'eam-assistant-restore';

/** Fired when dock panel expands/collapses so homepage hero can re-measure. */
export const ASSISTANT_LAYOUT_EVENT = 'eam-assistant-layout-changed';

/** Full composer by default — commercial entry must be visible on load. */
export function readAssistantMinimized(): boolean {
  return false;
}

export function restoreGlobalAssistant(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(ASSISTANT_MINIMIZED_KEY);
  window.dispatchEvent(new CustomEvent(ASSISTANT_RESTORE_EVENT));
}
