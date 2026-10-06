import { useLocation } from 'react-router-dom';
import { isAssistantVisible } from '@/config/globalAssistant';
import { useEditMode } from '@/contexts/EditModeContext';
import HomeFixedAssistantDock from '@/components/home/HomeFixedAssistantDock';

/**
 * GLOBAL EAM COPILOT — single platform-wide entry (persistent bottom dock).
 * Visible on all routes except auth, admin, command-center, and payment.
 * Wrapped in AppErrorBoundary so assistant render errors do not blank the whole app.
 */
export default function GlobalAssistantDock() {
  const { pathname } = useLocation();
  const { isEditMode, isDevEditModeAvailable } = useEditMode();

  if (!isAssistantVisible(pathname)) {
    return null;
  }

  return <HomeFixedAssistantDock editModeActive={isDevEditModeAvailable && isEditMode} />;
}
