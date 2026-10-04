import { useEffect } from 'react';
import { ASSISTANT_LAYOUT_EVENT } from '@/features/ai-workspace/assistantShell';

const CSS_VAR = '--home-assistant-dock-height';
const PROMO_HEIGHT_VAR = '--home-hero-promo-height';

function cssVarTarget(): HTMLElement {
  return document.querySelector<HTMLElement>('.eam-home') ?? document.documentElement;
}

/** Keeps homepage hero flush with the top edge of the fixed assistant dock. */
export function useAssistantDockHeightVar(container: HTMLElement | null) {
  useEffect(() => {
    if (!container) {
      return;
    }

    const panelWindow = () =>
      container.querySelector<HTMLElement>('.home-ai-workspace-panel') ??
      container.querySelector<HTMLElement>('.home-ai-workspace') ??
      container;

    const apply = () => {
      const panelTop = panelWindow().getBoundingClientRect().top;
      const reserve = Math.ceil(window.innerHeight - panelTop);
      const target = cssVarTarget();
      target.style.setProperty(CSS_VAR, `${reserve}px`);

      const promoStack = document.querySelector<HTMLElement>(
        '.eam-home .home-first-screen__stack--video-full',
      );
      if (promoStack) {
        const stackTop = promoStack.getBoundingClientRect().top;
        /* Full viewport band so section 02 starts below the fold (dock overlays this tail) */
        const promoHeight = Math.max(0, Math.floor(window.innerHeight - stackTop));
        target.style.setProperty(PROMO_HEIGHT_VAR, `${promoHeight}px`);
      } else {
        target.style.removeProperty(PROMO_HEIGHT_VAR);
      }
    };

    const applySoon = () => {
      apply();
      requestAnimationFrame(apply);
    };

    applySoon();
    const observer = new ResizeObserver(applySoon);
    observer.observe(container);
    const panelEl = panelWindow();
    if (panelEl !== container) {
      observer.observe(panelEl);
    }
    window.addEventListener('resize', applySoon);
    window.addEventListener(ASSISTANT_LAYOUT_EVENT, applySoon);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applySoon);
      window.removeEventListener(ASSISTANT_LAYOUT_EVENT, applySoon);
      const target = cssVarTarget();
      target.style.removeProperty(CSS_VAR);
      target.style.removeProperty(PROMO_HEIGHT_VAR);
    };
  }, [container]);
}
