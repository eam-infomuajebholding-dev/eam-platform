import { createPortal } from 'react-dom';
import HomeAIWorkspace from '@/components/home/HomeAIWorkspace';

/** Fixed smart assistant — centered bottom bar, portaled to body for reliable stacking. */
export default function HomeFixedAssistantDock() {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="home-assistant-dock pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-4"
      aria-hidden={false}
      data-global-assistant="dock"
    >
      <div className="pointer-events-auto w-full max-w-[42rem]">
        <HomeAIWorkspace layout="dock" />
      </div>
    </div>,
    document.body,
  );
}
