import { Link } from 'react-router-dom';
import { Award, Clock, BadgeCheck, Banknote } from 'lucide-react';
import Layout from '@/components/Layout';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const HERO_IMAGE =
  'https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7hyiaagqq/hero-banner-luxury-architecture.png';
const ENGINEERING_IMAGE =
  'https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7nlqaagqa/engineering-services-blueprints.png';
const GOVERNMENT_IMAGE =
  'https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7mxiaagpq/government-services-documents.png';

const whyChooseUs = [
  {
    icon: Award,
    title: 'خبرة واسعة',
    description: 'فريق من المهندسين المتخصصين بخبرة تمتد لسنوات في مختلف المجالات الهندسية',
  },
  {
    icon: BadgeCheck,
    title: 'جودة عالية',
    description: 'نلتزم بأعلى معايير الجودة العالمية والمحلية في جميع مشاريعنا',
  },
  {
    icon: Clock,
    title: 'التزام بالمواعيد',
    description: 'نحرص على تسليم المشاريع في الوقت المحدد دون أي تأخير',
  },
  {
    icon: Banknote,
    title: 'أسعار تنافسية',
    description: 'نقدم أفضل الأسعار مع الحفاظ على أعلى مستويات الجودة',
  },
];

export default function Index() {
  const aboutReveal = useScrollReveal({ threshold: 0.15 });
  const servicesTitleReveal = useScrollReveal({ threshold: 0.2 });
  const servicesCard1Reveal = useScrollReveal({ threshold: 0.15 });
  const servicesCard2Reveal = useScrollReveal({ threshold: 0.15 });
  const whyTitleReveal = useScrollReveal({ threshold: 0.2 });
  const whyCardsReveal = useScrollReveal({ threshold: 0.1 });
  const ctaReveal = useScrollReveal({ threshold: 0.15 });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Background Video */}
<video
  autoPlay
  muted
  loop
  playsInline
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/video.mp4" type="video/mp4" />
</video>

{/* Dark Overlay */}
<div className="absolute inset-0 mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[16px] font-normal text-[#2D2A1E] bg-[#00000099] opacity-100" />

        {/* Content */}
        <div className="relative z-10 px-4 animate-[fadeInUp_1s_ease-out] mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[16px] pb-[0px] pl-[16px] rounded-none text-[16px] font-normal text-center text-[#2D2A1E] bg-[#00000000] opacity-100">
          <div className="mx-auto mb-6 w-56 h-72 md:w-72 md:h-96 rounded-xl border-4 border-gold/60 shadow-[0_0_40px_rgba(201,168,76,0.3)] overflow-hidden bg-white flex items-center justify-center">
            <img
              src="/assets/logo.jpeg"
              alt="إعمار الأصالة والمعاصرة"
              className="w-full h-full object-contain p-3"
            />
          </div>
          <h1 className="font-tajawal md:text-5xl lg:text-6xl gold-text mt-[0px] mr-[0px] mb-[16px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[24px] font-bold text-center bg-[#00000000] opacity-100">
            إعمار الأصالة والمعاصرة<br />Emmar Al Asala Wa Al Muasara<br />
          </h1>
          <h2 className="font-tajawal md:text-2xl mt-[0px] mr-[0px] mb-[8px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[24px] font-normal text-center text-[#E8D48BCC] bg-[#00000000] opacity-100">
            للاستشارات الهندسية
          </h2>
          <p className="dark:text-white/70 md:text-xl max-w-2xl mx-auto mt-[24px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[20px] font-normal text-center text-[#FFFFFFB3] bg-[#00000000] opacity-100">
            شريكك الموثوق في الاستشارات الهندسية
          </p>
          <a
            href="#services"
            className="inline-block mt-10 px-8 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold text-lg rounded-lg hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-105"
          >
            اكتشف خدماتنا
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-gold rounded-full animate-[fadeInUp_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-dark relative overflow-hidden">
        {/* Decorative Elements */}
        
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 dark:bg-gold/5 rounded-full blur-3xl" />

        <div
          ref={aboutReveal.ref}
          className={`container mx-auto px-4 relative z-10 ${
            aboutReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Gold Decorative Line */}
            

            <h2 className="font-tajawal md:text-4xl gold-text mt-[0px] mr-[0px] mb-[32px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[36px] font-bold text-center bg-[#00000000] opacity-100">
              من نحن
            </h2>

            <div className="border border-gold/30 dark:border-gold/20 p-8 md:p-12 dark:bg-dark-lighter/50 backdrop-blur-sm shadow-lg shadow-gold/5 dark:shadow-none mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[48px] pr-[48px] pb-[48px] pl-[48px] rounded-2xl text-[16px] font-normal text-center text-[#2D2A1E] bg-[#FFFFFFCC] opacity-100">
              <p className="dark:text-white/80 md:text-xl font-tajawal mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[12px] font-normal text-center text-[#3D3520] bg-[#00000000] opacity-100">
                نقدم خدمات استشارية هندسية متكاملة تجمع بين الأصالة والمعاصرة، ملتزمون بأعلى معايير
                الجودة والاحترافية في تقديم الحلول الهندسية المبتكرة. نسعى لتحقيق رؤية عملائنا
                بأفضل المعايير الهندسية المعتمدة في المملكة العربية السعودية.
              </p>
            </div>

            {/* Gold Decorative Line */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
              <div className="w-3 h-3 rotate-45 border border-gold" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section id="services" className="py-20 md:py-28 dark:bg-dark-lighter relative mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[80px] pr-[0px] pb-[80px] pl-[0px] rounded-none text-[16px] font-normal text-[#2D2A1E] bg-[#FFFFFF] opacity-100">
        <div className="container mx-auto px-4">
          <div
            ref={servicesTitleReveal.ref}
            className={`${
              servicesTitleReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'
            }`}
          >
            <h2 className="font-tajawal text-3xl md:text-4xl font-bold gold-text text-center mb-16">
              خدماتنا
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Engineering Services Card */}
            <div
              ref={servicesCard1Reveal.ref}
              className={`${
                servicesCard1Reveal.isVisible ? 'reveal-visible-right' : 'reveal-hidden-right'
              }`}
              style={{ transitionDelay: servicesCard1Reveal.isVisible ? '150ms' : '0ms' }}
            >
              <Link
                to="/engineering-services"
                className="group relative h-80 md:h-96 rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(201,168,76,0.15)] block"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${ENGINEERING_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                  <h3 className="font-tajawal text-2xl md:text-3xl font-bold gold-text mb-3">
                    الخدمات الهندسية
                  </h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-sm">
                    تصميم المخططات المعمارية والإنشائية والكهربائية والميكانيكية وفق الكود السعودي
                    الجديد مع مناظير ثلاثية الأبعاد
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    اكتشف المزيد ←
                  </span>
                </div>
              </Link>
            </div>

            {/* Government Services Card */}
            <div
              ref={servicesCard2Reveal.ref}
              className={`${
                servicesCard2Reveal.isVisible ? 'reveal-visible-left' : 'reveal-hidden-left'
              }`}
              style={{ transitionDelay: servicesCard2Reveal.isVisible ? '300ms' : '0ms' }}
            >
              <Link
                to="/government-services"
                className="group relative h-80 md:h-96 rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(201,168,76,0.15)] block"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${GOVERNMENT_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                  <h3 className="font-tajawal text-2xl md:text-3xl font-bold gold-text mb-3">
                    الخدمات الحكومية
                  </h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-sm">
                    إصدار رخص البناء وتحديث الصكوك والفرز العقاري وتصحيح المخالفات وشهادات الإشغال
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    اكتشف المزيد ←
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05)_0%,transparent_70%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div
            ref={whyTitleReveal.ref}
            className={`${
              whyTitleReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'
            }`}
          >
            <h2 className="font-tajawal text-3xl md:text-4xl font-bold gold-text text-center mb-16">
              لماذا تختارنا
            </h2>
          </div>

          <div
            ref={whyCardsReveal.ref}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {whyChooseUs.map((item, index) => (
              <div
                key={item.title}
                className={`group p-6 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-gold/20 dark:border-gold/10 hover:border-[#C9A84C] dark:hover:border-gold/60 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(201,168,76,0.3),0_4px_15px_rgba(201,168,76,0.15)] dark:hover:shadow-[0_10px_40px_rgba(201,168,76,0.25),0_4px_15px_rgba(201,168,76,0.1)] shadow-md shadow-gold/5 dark:shadow-none text-center ${
                  whyCardsReveal.isVisible ? 'reveal-visible-scale' : 'reveal-hidden-scale'
                }`}
                style={{ transitionDelay: whyCardsReveal.isVisible ? `${index * 120}ms` : '0ms' }}
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-tajawal text-xl font-bold text-gold mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-dark-lighter relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.08)_0%,transparent_60%)]" />

        <div
          ref={ctaReveal.ref}
          className={`container mx-auto px-4 relative z-10 text-center ${
            ctaReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'
          }`}
        >
          <h2 className="font-tajawal text-3xl md:text-4xl font-bold gold-text mb-6">
            تواصل معنا اليوم
          </h2>
          <p className="text-gray-600 dark:text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            نحن هنا لمساعدتك في تحقيق مشروعك الهندسي. تواصل معنا للحصول على استشارة مجانية
          </p>
          <Link
            to="/contact-card"
            className="inline-block px-10 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold text-lg rounded-lg hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-105"
          >
            بطاقة التواصل
          </Link>
        </div>
      </section>

    </Layout>
  );
}