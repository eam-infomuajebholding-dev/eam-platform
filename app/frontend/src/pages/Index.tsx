import { Link } from "react-router-dom";
import { Award, Clock, BadgeCheck, Banknote } from "lucide-react";

import Layout from "@/components/Layout";
import { useScrollReveal } from "@/hooks/useScrollReveal";

import HeroBackground from "@/components/home/HeroBackground";
import HeroHeader from "@/components/sections/Hero/HeroHeader";
import HeroChat from "@/components/sections/Hero/HeroChat";
import QuickActions from "@/components/home/QuickActions";
import SectionTitle from "@/components/EAM-ui/SectionTitle";
import { WorkspaceProvider, useWorkspace } from "@/ai/WorkspaceContext";
import { BUILD_VILLA_QUICK_ACTION_LABEL } from "@/ai/types";

const ENGINEERING_IMAGE =
  "https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7nlqaagqa/engineering-services-blueprints.png";

const GOVERNMENT_IMAGE =
  "https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7mxiaagpq/government-services-documents.png";

const whyChooseUs = [
  {
    icon: Award,
    title: "خبرة واسعة",
    description:
      "فريق من المهندسين المتخصصين بخبرة تمتد لسنوات في مختلف المجالات الهندسية",
  },
  {
    icon: BadgeCheck,
    title: "جودة عالية",
    description:
      "نلتزم بأعلى معايير الجودة العالمية والمحلية في جميع مشاريعنا",
  },
  {
    icon: Clock,
    title: "الالتزام بالمواعيد",
    description:
      "نحرص على تسليم المشاريع في الوقت المحدد دون أي تأخير",
  },
  {
    icon: Banknote,
    title: "أسعار تنافسية",
    description:
      "نقدم أفضل الأسعار مع الحفاظ على أعلى مستويات الجودة",
  },
];

function HomepageWorkspace() {
  const { startBuildVillaFromQuickAction } = useWorkspace();

  return (
    <>
      <HeroHeader />
      <HeroChat />
      <QuickActions
        onSelect={(label) => {
          if (label === BUILD_VILLA_QUICK_ACTION_LABEL) {
            void startBuildVillaFromQuickAction();
          }
        }}
      />
    </>
  );
}

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
          {/* ===========================
          EAM AI Workspace
      ============================ */}

        <section className="relative overflow-hidden bg-background pt-0 pb-2">
  
        <HeroBackground />
  
         <div className="relative z-10 mx-auto max-w-7xl px-6">
  
            <WorkspaceProvider>
              <HomepageWorkspace />
            </WorkspaceProvider>
  
        </div>
  
      </section>
  
      {/* ========================= */}
      {/* About Section */}
      {/* ========================= */}

<section className="relative overflow-hidden py-20 bg-background">

<div className="container mx-auto px-4">

  <div
    ref={aboutReveal.ref}
    className={`${
      aboutReveal.isVisible
        ? "reveal-visible"
        : "reveal-hidden"
    }`}
  >

    <div className="max-w-4xl mx-auto text-center">

    <SectionTitle>
    <span data-editable-id="home-about-title">
      من نحن
    </span>
  </SectionTitle>

  <div className="mx-auto max-w-4xl rounded-3xl border border-[#E5E7EB] bg-white p-10 md:p-14 shadow-lg">
                   <p
          data-editable-id="home-about-desc"
          className="font-tajawal text-[20px] md:text-[22px] leading-10 text-[#4B5563] font-normal"
        >
          نقدم خدمات استشارية هندسية متكاملة، ملتزمون بأعلى معايير
          الجودة والاحترافية في تقديم الحلول الهندسية المبتكرة.
          نسعى لتحقيق رؤية عملائنا وفق أعلى المعايير الهندسية
          المعتمدة في المملكة العربية السعودية.
        </p>

      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
      </div>

    </div>

  </div>

</div>

</section>

{/* ========================= */}
{/* Services Section */}
{/* ========================= */}
<section
        id="services"
        className="py-20 md:py-28 bg-background"
      >
        <div className="container mx-auto px-4">

          <div
            ref={servicesTitleReveal.ref}
            className={`${
              servicesTitleReveal.isVisible
                ? "reveal-visible"
                : "reveal-hidden"
            }`}
          >
            <h2
              data-editable-id="home-services-title"
              className="mb-10 text-center font-tajawal text-4xl md:text-5xl font-bold text-[#2F3645]"            >
              خدماتنا
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            <div
              ref={servicesCard1Reveal.ref}
              className={`${
                servicesCard1Reveal.isVisible
                  ? "reveal-visible-right"
                  : "reveal-hidden-right"
              }`}
            >
              <Link
                to="/engineering-services"
                className="group relative block h-80 md:h-96 overflow-hidden rounded-2xl border border-gold/20 transition-all duration-500 hover:scale-[1.02] hover:border-gold/60"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${ENGINEERING_IMAGE})`,
                  }}
                />

                <div className="absolute inset-0 bg-black/60" />

                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">

                  <h3 className="font-tajawal text-3xl font-bold gold-text mb-3">
                    الخدمات الهندسية
                  </h3>

                  <p className="text-white/70 leading-7">
                    تصميم المخططات المعمارية والإنشائية والكهربائية
                    والميكانيكية وفق الكود السعودي مع مناظير ثلاثية
                    الأبعاد.
                  </p>

                  <span className="mt-5 text-gold font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    اكتشف المزيد →
                  </span>

                </div>

              </Link>
            </div>

            <div
              ref={servicesCard2Reveal.ref}
              className={`${
                servicesCard2Reveal.isVisible
                  ? "reveal-visible-left"
                  : "reveal-hidden-left"
              }`}
            >
              <Link
                to="/government-services"
                className="group relative block h-80 md:h-96 overflow-hidden rounded-2xl border border-gold/20 transition-all duration-500 hover:scale-[1.02] hover:border-gold/60"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${GOVERNMENT_IMAGE})`,
                  }}
                />

                <div className="absolute inset-0 bg-black/60" />

                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">

                  <h3 className="font-tajawal text-3xl font-bold gold-text mb-3">
                    الخدمات الحكومية
                  </h3>

                  <p className="text-white/70 leading-7">
                    إصدار رخص البناء، تحديث الصكوك، الفرز العقاري،
                    تصحيح المخالفات، وشهادات الإشغال.
                  </p>

                  <span className="mt-5 text-gold font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    اكتشف المزيد →
                  </span>

                </div>

              </Link>
            </div>

          </div>

        </div>

      </section>

      {/* ========================= */}
      {/* Why Choose Us */}
      {/* ========================= */}
      <section className="relative overflow-hidden bg-gray-800 py-20 md:py-28 dark:bg-dark">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />

        <div className="container relative z-10 mx-auto px-4">

          <div
            ref={whyTitleReveal.ref}
            className={`${
              whyTitleReveal.isVisible
                ? "reveal-visible"
                : "reveal-hidden"
            }`}
          >
            <h2
              data-editable-id="home-why-title"
              className="mb-16 text-center font-tajawal text-3xl font-bold gold-text md:text-4xl"
            >
              لماذا تختارنا
            </h2>
          </div>

          <div
            ref={whyCardsReveal.ref}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >

            {whyChooseUs.map((item, index) => (

              <div
                key={item.title}
                className={`group rounded-2xl border border-gold/20  p-6 text-center shadow-md shadow-gold/5 transition-all duration-300 hover:-translate-y-2 hover:border-gold hover:shadow-[0_10px_40px_rgba(201,168,76,0.25)]
                ${
                  whyCardsReveal.isVisible
                    ? "reveal-visible-scale"
                    : "reveal-hidden-scale"
                }`}
                style={{
                  transitionDelay: whyCardsReveal.isVisible
                    ? `${index * 120}ms`
                    : "0ms",
                }}
              >

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">

                  <item.icon className="h-8 w-8 text-gold" />

                </div>

                <h3 className="mb-3 font-tajawal text-xl font-bold text-gold">
                  {item.title}
                </h3>

                <p className="leading-7 text-gray-600">
                  {item.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ========================= */}
      {/* CTA Section */}
      {/* ========================= */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28 dark:bg-dark-lighter">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06)_0%,transparent_60%)]" />

        <div
          ref={ctaReveal.ref}
          className={`container relative z-10 mx-auto px-4 text-center ${
            ctaReveal.isVisible
              ? "reveal-visible"
              : "reveal-hidden"
          }`}
        >

          <h2
            data-editable-id="home-cta-title"
            className="mb-6 font-tajawal text-3xl font-bold gold-text md:text-4xl"
          >
            تواصل معنا اليوم
          </h2>

          <p
            data-editable-id="home-cta-desc"
            className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-gray-600 dark:text-white/70"
          >
            نقدم حلولاً هندسية متكاملة تدعم الجهات الحكومية والقطاع الخاص
            والمستثمرين في تنفيذ مشاريعهم بكفاءة وجودة وفق أعلى المعايير
            المهنية.
            <br />
            <br />
            تواصل معنا لنناقش احتياجات مشروعك ونقدم الحلول المناسبة.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">

          
            <Link
              to="/contact"
              className="rounded-xl border-2 border-[#C9A84C] px-8 py-4 font-bold text-[#C9A84C] transition hover:bg-[#C9A84C] hover:text-white"
            >
              تواصل معنا
            </Link>

          </div>

        </div>

      </section>

    </Layout>
  );
}