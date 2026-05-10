import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  Ruler,
  Building2,
  Layers,
  Zap,
  Wind,
  Cpu,
  Box,
  Home,
  RotateCcw,
  FileSearch,
  HardHat,
  FlaskConical,
  MapPin,
  TrendingUp,
  Calculator,
  PenTool,
} from 'lucide-react';

const services = [
  { icon: Ruler, name: 'تصميم مخططات حسب الكود السعودي الجديد' },
  { icon: Building2, name: 'مخططات معمارية معتمدة' },
  { icon: Layers, name: 'مخططات انشائية + نوته حسابية' },
  { icon: Zap, name: 'مخططات كهربائية متكاملة' },
  { icon: Wind, name: 'مخططات ميكانيكية متكاملة' },
  { icon: Cpu, name: 'مخططات النظام الذكي' },
  { icon: Box, name: 'مناظير خارجية 3D Exterior' },
  { icon: Home, name: 'مناظير داخلية 3D Interior' },
  { icon: RotateCcw, name: 'مناظير 360 درجة' },
  { icon: FileSearch, name: 'مراجعة / دراسة / تعديل مخططات' },
  { icon: PenTool, name: 'معماري / انشائي مع نوتة حسابية' },
  { icon: HardHat, name: 'إشراف هندسي / عظم / تشطيب' },
  { icon: FlaskConical, name: 'اختبار تربة' },
  { icon: MapPin, name: 'رفع مساحي' },
  { icon: TrendingUp, name: 'دراسة جدوى' },
  { icon: Calculator, name: 'حساب كميات' },
];

export default function EngineeringServices() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7nlqaagqa/engineering-services-blueprints.png)',
          }}
        />
        <div className="absolute inset-0 bg-dark/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">
            الخدمات الهندسية
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            نقدم حلولاً هندسية متكاملة بأعلى معايير الجودة والاحترافية
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
                             hover:scale-[1.03] hover:border-gold/30 hover:shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold font-tajawal text-base md:text-lg leading-relaxed group-hover:text-gold-light transition-colors duration-300">
                        {service.name}
                      </h3>
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
            هل تحتاج إلى خدمة هندسية؟
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto font-tajawal">
            فريقنا من المهندسين المتخصصين جاهز لمساعدتك في تحقيق مشروعك
          </p>
          <Link
            to="/contact-card"
            className="inline-block px-8 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold font-tajawal rounded-lg text-lg
                       transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:scale-105"
          >
            تواصل معنا
          </Link>
        </div>
      </section>

    </Layout>
  );
}