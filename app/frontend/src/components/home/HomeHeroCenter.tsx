import BrandLogo from '@/components/ui/BrandLogo';
import HeroChat from '@/components/sections/Hero/HeroChat';

export default function HomeHeroCenter() {
  return (
    <section
      className="relative flex h-full min-h-[320px] flex-col overflow-hidden lg:min-h-0"
      aria-label="مساحة العمل الذكية"
    >
      <div
        className="pointer-events-none absolute inset-x-[-4%] bottom-0 top-[60px] bg-[url('/images/circuit-bg.svg')] bg-[length:108%_auto] bg-[center_top] bg-no-repeat opacity-[0.20]"
        aria-hidden="true"
      />

      <div className="relative z-10 shrink-0 pt-1">
        <HeroChat variant="homepage" />
      </div>

      <div className="home-hero-emblem relative z-10 flex min-h-0 flex-1 items-center justify-center pb-1 pt-0">
        <BrandLogo size="emblem" showText={false} className="w-full max-w-[280px]" />
      </div>
    </section>
  );
}
