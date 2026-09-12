import { Link } from 'react-router-dom';
import { Award, Leaf, Lightbulb, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { HOME_ABOUT_MEDIA_IMAGE } from '@/data/homeAssets';

const VALUES = [
  { label: 'التميّز', icon: Award },
  { label: 'المصداقية', icon: ShieldCheck },
  { label: 'الاستدامة', icon: Leaf },
  { label: 'الابتكار', icon: Lightbulb },
];

export default function AboutEAMSection() {
  const reveal = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      id="home-about"
      data-home-section="about"
      className="border-t border-[var(--eam-home-border)]/40 bg-[var(--eam-home-cream-light)] py-16 md:py-20"
      aria-label="نبذة عن EAM"
    >
      <div className="container mx-auto px-4">
        <div
          ref={reveal.ref}
          className={`grid gap-10 lg:grid-cols-2 lg:items-center ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="text-right" dir="rtl">
            <h2 className="font-tajawal text-3xl font-bold text-[var(--eam-home-ink)] md:text-4xl">
              EAM .. لإعمار حياة أفضل
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--eam-home-ink)]/80 md:text-base">
              <span className="font-bold text-[var(--eam-home-gold-deep)]">
                منصة هندسية واستثمارية ورقمية متكاملة.
              </span>{' '}
              تجمع إعمار الأصالة والمعاصرة بين الاستشارات الهندسية، التطوير العقاري،
              الاستثمار، والخدمات التنفيذية في مسار واحد يربط الفكرة بالتسليم.
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-3">
              {VALUES.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-[var(--eam-home-border)] bg-white/80 px-3 py-2.5"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[var(--eam-home-gold-deep)]" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-[var(--eam-home-ink)]">{label}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/about"
              className="mt-8 inline-flex rounded-xl border border-[var(--eam-home-border)] px-6 py-2.5 text-sm font-semibold text-[var(--eam-home-gold-deep)] transition hover:border-[var(--eam-home-gold)] hover:bg-[var(--eam-home-cream)]"
            >
              تعرّف على EAM
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--eam-home-border)] bg-white shadow-[0_4px_20px_rgba(139,77,0,0.08)]">
            <div className="relative aspect-video w-full">
              <img
                src={HOME_ABOUT_MEDIA_IMAGE}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#2B2118]/75 to-transparent p-4">
                <p className="text-sm font-semibold text-white">EAM في 90 ثانية — وسائط قابلة للاستبدال</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
