import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  Building2,
  HardHat,
  Landmark,
  Layers,
  Route,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';

const services = [
  {
    icon: Building2,
    name: 'مقاولات البناء العامة',
    description:
      'تنفيذ مشاريع البناء بجميع أنواعها من الأساسات حتى التسليم النهائي وفق أعلى معايير الجودة والسلامة.',
  },
  {
    icon: Landmark,
    name: 'مقاولات المباني السكنية والتجارية',
    description:
      'بناء الفلل والعمائر السكنية والمجمعات التجارية بتصاميم عصرية ومواد بناء عالية الجودة.',
  },
  {
    icon: HardHat,
    name: 'إدارة مشاريع البناء',
    description:
      'إدارة شاملة للمشاريع تشمل التخطيط والجدولة الزمنية ومراقبة التكاليف وضمان الجودة.',
  },
  {
    icon: Layers,
    name: 'أعمال الهيكل الإنشائي والتشطيبات',
    description:
      'تنفيذ الهياكل الخرسانية والمعدنية وأعمال التشطيبات الداخلية والخارجية بأعلى مستويات الدقة.',
  },
  {
    icon: Route,
    name: 'مقاولات البنية التحتية والطرق والجسور',
    description:
      'تنفيذ مشاريع البنية التحتية شاملة شبكات المياه والصرف الصحي والطرق والجسور والأنفاق.',
  },
  {
    icon: Warehouse,
    name: 'أعمال الطرق والجسور',
    description:
      'إنشاء وصيانة الطرق السريعة والجسور والمعابر مع الالتزام بالمواصفات الفنية المعتمدة.',
  },
  {
    icon: ShieldCheck,
    name: 'التنفيذ وفق المواصفات والمعايير الدولية',
    description:
      'الالتزام الكامل بالمواصفات السعودية والمعايير الدولية ISO في جميع مراحل التنفيذ مع ضمان الجودة.',
  },
];

export default function ContractingServices() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-dark-lighter" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.1)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">
            المقاولات
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            خدمات مقاولات شاملة بأعلى معايير الجودة والاحترافية لتنفيذ مشاريعكم بنجاح
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-dark-card/60 backdrop-blur-sm border border-gold/10 rounded-lg p-6
                             border-r-4 border-r-gold/60
                             transition-all duration-300 ease-out
                             hover:-translate-y-2 hover:border-[#C9A84C]/40 hover:shadow-[0_10px_40px_rgba(201,168,76,0.3),0_4px_15px_rgba(201,168,76,0.15)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold font-tajawal text-base md:text-lg leading-relaxed group-hover:text-gold-light transition-colors duration-300 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-white/60 text-sm font-tajawal leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-dark-lighter">
        <div className="container mx-auto px-4 text-center">
          <h2 className="gold-text text-3xl md:text-4xl font-bold font-playfair mb-6">
            هل تحتاج إلى خدمات مقاولات؟
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto font-tajawal">
            فريقنا من المهندسين والمقاولين المتخصصين جاهز لتنفيذ مشروعك بأعلى جودة
          </p>
          <Link
            to="/consultation"
            className="inline-block px-8 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold font-tajawal rounded-lg text-lg
                       transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:scale-105"
          >
            طلب استشارة
          </Link>
        </div>
      </section>
    </Layout>
  );
}