import { createPortal } from 'react-dom';
import { useCallback, useState } from 'react';
import HomeAIWorkspace from '@/components/home/HomeAIWorkspace';
import { useAssistantDockHeightVar } from '@/hooks/useAssistantDockHeightVar';

/** Fixed smart assistant — centered bottom bar, portaled to body for reliable stacking. */
export default function HomeFixedAssistantDock() {
  const [dockEl, setDockEl] = useState<HTMLDivElement | null>(null);
  const dockRef = useCallback((node: HTMLDivElement | null) => {
    setDockEl(node);
  }, []);
  useAssistantDockHeightVar(dockEl);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={dockRef}
      className="home-assistant-dock pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-4"
      aria-hidden={false}
      data-global-assistant="dock"
    >
      <div className="pointer-events-auto flex w-full justify-center">
        <HomeAIWorkspace layout="dock" />
      </div>
    </div>,
    document.body,
  );
}
