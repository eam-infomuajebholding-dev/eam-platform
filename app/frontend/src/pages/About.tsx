import Layout from '@/components/Layout';
import { CheckCircle, Award, Eye, TrendingUp } from 'lucide-react';

const commitments = [
  'الالتزام بأعلى معايير الجودة في كل مشروع',
  'فريق من المهندسين والخبراء المتخصصين',
  'استخدام أحدث التقنيات والأنظمة العالمية',
  'التسليم في الوقت المحدد وضمن الميزانية',
  'خدمة ما بعد البيع وضمان شامل',
];

const values = [
  {
    icon: Award,
    title: 'جودة معتمدة',
    description: 'حاصلون على شهادات الأيزو العالمية',
  },
  {
    icon: Eye,
    title: 'رؤية واضحة',
    description: 'نسعى لنكون الرائدين إقليمياً',
  },
  {
    icon: TrendingUp,
    title: 'نمو مستدام',
    description: 'نمو سنوي متواصل منذ التأسيس',
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-dark-lighter">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">من نحن</h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            تعرّف على قصتنا ورؤيتنا وقيمنا
          </p>
        </div>
      </section>

      {/* Company Intro */}
      <section className="py-16 md:py-24 bg-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="border border-gold/20 rounded-2xl p-8 md:p-12 bg-white/5 backdrop-blur-sm">
              <p className="text-white/85 text-lg md:text-xl leading-loose font-tajawal mb-8">
                تأسست شركة <span className="text-gold font-bold">إعمار الأصالة والمعاصرة للاستشارات الهندسية</span> عام
                <span className="text-gold font-bold"> ٢٠٠٥</span> لتكون نموذجاً يحتذى به في تقديم الاستشارات الهندسية
                المتكاملة، نمزج بين أصالة الموروث المعماري وحداثة التصميم العصري، بفريق من أفضل المهندسين والاستشاريين
                المتخصصين، ونعمل بشغف لتحويل رؤى عملائنا إلى مشاريع رائدة على أرض الواقع.
              </p>

              {/* Commitments */}
              <h3 className="text-gold font-bold text-xl mb-6 font-tajawal">التزاماتنا</h3>
              <ul className="space-y-4">
                {commitments.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-base md:text-lg font-tajawal leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-dark-lighter">
        <div className="container mx-auto px-4">
          <h2 className="gold-text text-3xl md:text-4xl font-bold font-playfair text-center mb-14">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                  <v.icon className="w-10 h-10 text-gold" />
                </div>
                <h3 className="text-gold font-bold text-xl mb-3 font-tajawal">{v.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed font-tajawal">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}