import { useLocation } from 'react-router-dom';
import { isAssistantVisible } from '@/config/globalAssistant';
import HomeFixedAssistantDock from '@/components/home/HomeFixedAssistantDock';

/**
 * GLOBAL EAM COPILOT — single platform-wide entry (persistent bottom dock).
 * Visible on all routes except auth, admin, command-center, and payment.
 * Renders outside AppErrorBoundary so route crashes do not remove the assistant.
 */
export default function GlobalAssistantDock() {
  const { pathname } = useLocation();

  if (!isAssistantVisible(pathname)) {
    return null;
  }

  return <HomeFixedAssistantDock />;
}
