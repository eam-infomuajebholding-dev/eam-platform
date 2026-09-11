import { Link } from 'react-router-dom';
import SectionTitle from '@/components/EAM-ui/SectionTitle';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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
        <div ref={reveal.ref} className={reveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}>
          <SectionTitle className="text-[var(--eam-home-ink)]">نبذة عن EAM</SectionTitle>

          <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--eam-home-border)] bg-white/90 p-8 text-center shadow-[0_2px_14px_rgba(139,77,0,0.06)] md:p-12">
            <p className="font-tajawal text-lg leading-8 text-[var(--eam-home-ink)]/85 md:text-xl md:leading-9">
              <span className="font-bold text-[var(--eam-home-gold-deep)]">
                منصة هندسية واستثمارية ورقمية متكاملة.
              </span>{' '}
              تجمع إعمار الأصالة والمعاصرة بين الاستشارات الهندسية، التطوير العقاري،
              الاستثمار، والخدمات التنفيذية في مسار واحد يربط الفكرة بالتسليم — بدعم
              ذكاء اصطناعي يوجّه رحلتك من اللحظة الأولى.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/about"
              className="rounded-xl border border-[var(--eam-home-border)] px-6 py-2.5 text-sm font-semibold text-[var(--eam-home-gold-deep)] transition hover:border-[var(--eam-home-gold)] hover:bg-[var(--eam-home-cream)]"
            >
              تعرّف على EAM
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
