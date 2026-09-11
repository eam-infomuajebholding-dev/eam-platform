import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  FileText, Map, Key, Scissors, Building, AlertTriangle,
  CheckCircle, Plus, ShieldCheck, Building2, ClipboardCheck,
} from 'lucide-react';

const GOVERNMENT_IMAGE =
  'https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7mxiaagpq/government-services-documents.png';

const services = [
  {
    icon: FileText,
    name: 'تحديث صكوك وما يعادله',
    description: 'خدمة تحديث وتوثيق الصكوك العقارية وما يعادلها وفقاً للأنظمة والتشريعات المعتمدة في المملكة',
  },
  {
    icon: Map,
    name: 'إصدار كروكيات "إرشادي - تنظيمي"',
    description: 'إعداد وإصدار الكروكيات الإرشادية والتنظيمية المعتمدة للمواقع والأراضي بدقة عالية',
  },
  {
    icon: Key,
    name: 'رخص البناء (سكني / تجاري / إداري)',
    description: 'استخراج رخص البناء لجميع أنواع المباني السكنية والتجارية والإدارية وفق الاشتراطات البلدية',
  },
  {
    icon: Scissors,
    name: 'الفرز العقاري والدمج العقاري',
    description: 'خدمات فرز ودمج العقارات وتقسيم الأراضي وفقاً للأنظمة العقارية المعتمدة',
  },
  {
    icon: Building,
    name: 'رخص هدم / ترميم',
    description: 'إصدار رخص الهدم والترميم للمباني القائمة مع إعداد جميع المستندات والدراسات المطلوبة',
  },
  {
    icon: AlertTriangle,
    name: 'تصحيح أوضاع المخالفات',
    description: 'معالجة وتصحيح أوضاع المخالفات البنائية وتقديم الحلول المناسبة وفق الأنظمة المعمول بها',
  },
  {
    icon: CheckCircle,
    name: 'شهادات الإشغال',
    description: 'استخراج شهادات الإشغال للمباني المكتملة بعد التأكد من مطابقتها للمواصفات والمعايير المطلوبة',
  },
  {
    icon: Plus,
    name: 'إضافة الرخص القديمة',
    description: 'خدمة إضافة وتحديث الرخص القديمة في النظام الإلكتروني وربطها بالسجلات الحالية',
  },
  {
    icon: ShieldCheck,
    name: 'طلبات رفع الحضر',
    description: 'تقديم ومتابعة طلبات رفع الحضر عن العقارات والأراضي لدى الجهات المختصة',
  },
  {
    icon: Building2,
    name: 'إصدار رخص السكن الجماعي',
    description: 'استخراج رخص السكن الجماعي للعمال والموظفين وفق اشتراطات وزارة الشؤون البلدية',
  },
  {
    icon: ClipboardCheck,
    name: 'إصدار التأمين للمباني',
    description: 'إصدار وثائق التأمين اللازمة للمباني والمنشآت بالتعاون مع شركات التأمين المعتمدة',
  },
];

export default function GovernmentServices() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${GOVERNMENT_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-dark/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">
            الخدمات الحكومية
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            نقدم خدمات حكومية شاملة لتسهيل إجراءاتكم العقارية والبنائية
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
                  className="group relative bg-white/5 backdrop-blur-sm border border-gold/10 rounded-xl p-6 border-r-4 border-r-gold/50 transition-all duration-300 hover:scale-[1.02] hover:border-gold/30 hover:shadow-[0_0_20px_rgba(201,168,76,0.12)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold font-tajawal text-base md:text-lg leading-relaxed group-hover:text-gold-light transition-colors duration-300 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-white/55 text-sm leading-relaxed font-tajawal">
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
            هل تحتاج إلى خدمة حكومية؟
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto font-tajawal">
            فريقنا المتخصص جاهز لمساعدتك في جميع الإجراءات الحكومية
          </p>
          <Link
            to="/journeys/government-services"
            className="inline-block px-8 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold font-tajawal rounded-lg text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:scale-105"
          >
            ابدأ رحلة الخدمات الحكومية
          </Link>
        </div>
      </section>
    </Layout>
  );
}