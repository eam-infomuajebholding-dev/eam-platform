import HeroChat from '@/components/sections/Hero/HeroChat';
import QuickActions from '@/components/home/QuickActions';
import { useWorkspace } from '@/features/ai-workspace/WorkspaceContext';
import { BUILD_VILLA_QUICK_ACTION_LABEL } from '@/features/ai-workspace/types';

/** Home EAM AI workspace — presentation shell over canonical AI Core (HeroChat). */
export default function HomeAIWorkspace() {
  const { startBuildVillaFromQuickAction } = useWorkspace();

  return (
    <div
      role="region"
      className="home-ai-workspace min-w-0 rounded-[18px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/95 p-3 shadow-[0_2px_16px_rgba(139,77,0,0.1)] backdrop-blur-sm sm:p-4"
      aria-label="مساحة العمل الذكية"
    >
      <p className="mb-1 text-center text-[11px] text-[var(--eam-home-ink)]/60">
        مساعد ذكي يوجّهك إلى المسار المناسب
      </p>
      <HeroChat variant="homepage" />
      <div className="mt-2 border-t border-[var(--eam-home-border)]/60 pt-2" aria-label="اقتراحات سريعة">
        <QuickActions
          onSelect={(label) => {
            if (label === BUILD_VILLA_QUICK_ACTION_LABEL) {
              void startBuildVillaFromQuickAction();
            }
          }}
        />
      </div>
    </div>
  );
}
