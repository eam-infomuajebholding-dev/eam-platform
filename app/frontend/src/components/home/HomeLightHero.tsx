import HeroChat from '@/components/sections/Hero/HeroChat';
import QuickActions from '@/components/home/QuickActions';
import { HOME_HERO_IMAGE } from '@/data/homeAssets';
import { useWorkspace } from '@/features/ai-workspace/WorkspaceContext';
import { BUILD_VILLA_QUICK_ACTION_LABEL } from '@/features/ai-workspace/types';

function HeroQuickActions() {
  const { startBuildVillaFromQuickAction } = useWorkspace();

  return (
    <QuickActions
      onSelect={(label) => {
        if (label === BUILD_VILLA_QUICK_ACTION_LABEL) {
          void startBuildVillaFromQuickAction();
        }
      }}
    />
  );
}

/** Approved light homepage hero — full-width imagery + EAM AI panel */
export default function HomeLightHero() {
  return (
    <section
      id="home-hero"
      role="region"
      data-home-section="hero"
      className="home-light-hero relative overflow-hidden rounded-[20px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)] shadow-[0_4px_24px_rgba(139,77,0,0.08)]"
      aria-label="من الفكرة إلى الأثر"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={HOME_HERO_IMAGE}
          alt=""
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#fff9f1]/96 via-[#fff9f1]/78 to-[#fff9f1]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e7]/90 via-transparent to-[#fff9f1]/40" />
      </div>

      <div className="relative z-10 grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-8 lg:p-8">
        <div className="min-w-0 text-right" dir="rtl">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--eam-home-gold-deep)]">
            EAM — إعمار الأصالة والمعاصرة
          </p>
          <h1 className="font-tajawal text-3xl font-bold leading-tight text-[var(--eam-home-ink)] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
            من الفكرة إلى{' '}
            <span className="text-[var(--eam-home-gold-deep)]">الأثر</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--eam-home-ink)]/75 sm:text-base">
            منصة هندسية واستثمارية ورقمية تجمع الاستشارات، التطوير، التنفيذ، والاستثمار
            في مسار واحد — بدعم ذكاء EAM الذي يوجّه رحلتك من اللحظة الأولى.
          </p>
        </div>

        <div
          role="region"
          className="min-w-0 rounded-[18px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/95 p-3 shadow-[0_2px_16px_rgba(139,77,0,0.1)] backdrop-blur-sm sm:p-4"
          aria-label="مساحة العمل الذكية"
        >
          <HeroChat variant="homepage" />
          <div className="mt-2 border-t border-[var(--eam-home-border)]/60 pt-2">
            <HeroQuickActions />
          </div>
        </div>
      </div>
    </section>
  );
}
