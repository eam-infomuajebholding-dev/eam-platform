import { Link } from 'react-router-dom';
import {
  Building2,
  HardHat,
  House,
  Landmark,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type SolutionItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

/** User outcomes derived from existing routes — not a duplicate of the 16-sector rail */
const SOLUTIONS: SolutionItem[] = [
  {
    title: 'ابنِ مشروعك',
    description: 'رحلة ذكية لبناء المنزل من الفكرة إلى التسليم',
    href: '/journeys/build-villa',
    icon: House,
  },
  {
    title: 'الاستثمار العقاري',
    description: 'فرص استثمارية ومسارات تمويل مرتبطة بالمنصة',
    href: '/invest',
    icon: TrendingUp,
  },
  {
    title: 'الاستشارات الهندسية',
    description: 'تصاميم، دراسات، وإشراف هندسي متكامل',
    href: '/engineering-services',
    icon: Building2,
  },
  {
    title: 'الخدمات الحكومية',
    description: 'تراخيص، تصاريح، ومعاملات عقارية وإنشائية',
    href: '/government-services',
    icon: Landmark,
  },
  {
    title: 'المقاولات والتشييد',
    description: 'تنفيذ موثوق يربط التصميم بالواقع',
    href: '/services/contracting',
    icon: HardHat,
  },
  {
    title: 'التشغيل والصيانة',
    description: 'صيانة ذكية وإدارة مرافق مستدامة',
    href: '/services/maintenance',
    icon: Wrench,
  },
];

export default function SolutionsSection() {
  const titleReveal = useScrollReveal({ threshold: 0.2 });
  const gridReveal = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="home-solutions"
      data-home-section="solutions"
      className="bg-[var(--eam-home-cream)] py-16 md:py-20"
      aria-label="الحلول"
    >
      <div className="container mx-auto px-4">
        <div ref={titleReveal.ref} className={titleReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}>
          <h2 className="mb-10 text-center font-tajawal text-3xl font-bold text-[var(--eam-home-ink)] md:text-4xl">
            الحلول
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-7 text-[var(--eam-home-ink)]/70 md:text-base">
            مسارات جاهزة لاحتياجاتك — من التخطيط إلى التنفيذ — دون تكرار منصات القطاعات أعلاه.
          </p>
        </div>

        <div
          ref={gridReveal.ref}
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${gridReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          {SOLUTIONS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group flex gap-4 rounded-2xl border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/90 p-5 transition hover:-translate-y-0.5 hover:border-[var(--eam-home-gold)] hover:shadow-[0_6px_18px_rgba(198,138,42,0.12)]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--eam-home-gold)]/10">
                <item.icon className="h-5 w-5 text-[var(--eam-home-gold-deep)]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="font-tajawal text-base font-bold text-[var(--eam-home-ink)] group-hover:text-[var(--eam-home-gold-deep)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-6 text-[var(--eam-home-ink)]/65 md:text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="text-sm font-semibold text-[var(--eam-home-gold-deep)] hover:underline"
          >
            استكشف جميع الخدمات
          </Link>
        </div>
      </div>
    </section>
  );
}
