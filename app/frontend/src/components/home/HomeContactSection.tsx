import { Link } from 'react-router-dom';
import { IdCard, Mail } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function HomeContactSection() {
  const reveal = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      id="home-contact"
      data-home-section="contact"
      className="border-t border-[var(--eam-home-border)]/40 bg-[var(--eam-home-cream)] py-16 md:py-20"
      aria-label="تواصل معنا"
    >
      <div className="container mx-auto px-4">
        <div
          ref={reveal.ref}
          className={`mx-auto max-w-2xl text-center ${reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <h2 className="mb-4 font-tajawal text-3xl font-bold text-[var(--eam-home-ink)] md:text-4xl">
            تواصل معنا
          </h2>
          <p className="mb-8 text-sm leading-7 text-[var(--eam-home-ink)]/70 md:text-base">
            نحن هنا لمساعدتك في بدء مشروعك أو استكشاف فرصة استثمارية. اختر الطريقة
            الأنسب — دون أن تنافس مساعد EAM الذكي في الشاشة الأولى.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--eam-home-border)] px-6 py-3 text-sm font-semibold text-[var(--eam-home-gold-deep)] transition hover:border-[var(--eam-home-gold)] hover:bg-[var(--eam-home-cream-light)]"
            >
              <Mail className="h-4 w-4" />
              تواصل معنا
            </Link>
            <Link
              to="/contact-card"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--eam-home-border)] px-6 py-3 text-sm font-semibold text-[var(--eam-home-ink)]/80 transition hover:border-[var(--eam-home-gold)] hover:text-[var(--eam-home-gold-deep)]"
            >
              <IdCard className="h-4 w-4" />
              بطاقة التواصل
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
