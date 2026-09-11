import { Bot, Globe2, Layers, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const REASONS: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Layers,
    title: 'منصة متكاملة',
    description: 'رحلة واحدة تربط الاستشارة، التصميم، التنفيذ، والاستثمار دون انقطاع',
  },
  {
    icon: Bot,
    title: 'ذكاء يوجّه الرحلة',
    description: 'مساعد EAM الذكي يفهم احتياجك ويوصلك للمسار المناسب فوراً',
  },
  {
    icon: Globe2,
    title: '16 قطاعاً مترابطاً',
    description: 'من التطوير العقاري إلى التسليم — شبكة خدمات تحت سقف واحد',
  },
  {
    icon: ShieldCheck,
    title: 'موثوقية وشفافية',
    description: 'معايير مهنية، مسارات واضحة، ومتابعة لحظية لحالة مشروعك',
  },
];

export default function WhyEAMSection() {
  const titleReveal = useScrollReveal({ threshold: 0.2 });
  const gridReveal = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="home-why-eam"
      data-home-section="why-eam"
      className="bg-[#2B2118] py-16 text-white md:py-20"
      aria-label="لماذا EAM"
    >
      <div className="container mx-auto px-4">
        <div ref={titleReveal.ref} className={titleReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}>
          <h2 className="mb-12 text-center font-tajawal text-3xl font-bold text-[var(--eam-home-gold-soft)] md:text-4xl">
            لماذا EAM؟
          </h2>
        </div>

        <div
          ref={gridReveal.ref}
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ${gridReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          {REASONS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[var(--eam-home-gold)]/25 bg-white/5 p-5 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--eam-home-gold)]/15">
                <item.icon className="h-6 w-6 text-[var(--eam-home-gold-soft)]" strokeWidth={1.75} />
              </div>
              <h3 className="font-tajawal text-lg font-bold text-[var(--eam-home-gold-soft)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/75">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
