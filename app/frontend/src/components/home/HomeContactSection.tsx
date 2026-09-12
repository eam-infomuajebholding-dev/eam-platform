import { Link } from 'react-router-dom';
import { Bell, Mail } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/** Final CTA — routes to real contact; no fake newsletter backend (WO-021 B19) */
export default function HomeContactSection() {
  const reveal = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      id="home-contact"
      data-home-section="contact"
      className="relative overflow-hidden border-t border-[var(--eam-home-border)]/40 bg-[#1a2634] py-16 text-white md:py-20"
      aria-label="كن على اطلاع"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(26,38,52,0.95), rgba(26,38,52,0.6)), url(/images/eam/home/hero-architecture.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="container relative mx-auto px-4">
        <div
          ref={reveal.ref}
          className={`mx-auto max-w-2xl text-center ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--eam-home-gold)]/20">
            <Bell className="h-6 w-6 text-[var(--eam-home-gold-soft)]" strokeWidth={1.75} />
          </div>
          <h2 className="font-tajawal text-3xl font-bold text-[var(--eam-home-gold-soft)] md:text-4xl">
            كن على اطلاع دائم
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/80 md:text-base">
            تابع آخر تحديثات المنصة والفرص — تواصل معنا مباشرة دون اشتراك وهمي أو
            إرسال بيانات إلى نقطة نهاية غير مفعّلة.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--eam-home-gold)] px-6 py-3 text-sm font-semibold text-[#2B2118] transition hover:bg-[var(--eam-home-gold-soft)]"
            >
              <Mail className="h-4 w-4" />
              تواصل معنا
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-[var(--eam-home-gold)] hover:text-[var(--eam-home-gold-soft)]"
            >
              تعرّف على EAM
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
