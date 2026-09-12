import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/** Homepage investment promotion — not operational Investment journey (#03) */
export default function InvestmentHomeSection() {
  const reveal = useScrollReveal({ threshold: 0.12 });

  return (
    <section
      id="home-investment"
      data-home-section="investment"
      className="relative overflow-hidden bg-[#1a2634] py-16 text-white md:py-20"
      aria-label="الاستثمار"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(to left, rgba(26,38,52,0.92), rgba(26,38,52,0.55)), url(https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="container relative mx-auto px-4">
        <div
          ref={reveal.ref}
          className={`mx-auto max-w-3xl text-center ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--eam-home-gold)]/20">
            <TrendingUp className="h-6 w-6 text-[var(--eam-home-gold-soft)]" strokeWidth={1.75} />
          </div>
          <h2 className="font-tajawal text-3xl font-bold text-[var(--eam-home-gold-soft)] md:text-4xl">
            استثمر في مستقبل واعد
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/80 md:text-base">
            اكتشف مسارات الاستثمار والشراكة مع EAM — فرص مدروسة، شفافية في المتابعة،
            وربط بين رأس المال والمشاريع الحقيقية. لا عوائد مضمونة ولا وعود مالية
            غير موثقة.
          </p>
          <Link
            to="/invest"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--eam-home-gold)] px-6 py-3 text-sm font-semibold text-[#2B2118] transition hover:bg-[var(--eam-home-gold-soft)]"
          >
            استكشف فرص الاستثمار
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
