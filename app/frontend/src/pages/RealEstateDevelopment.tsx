import Layout from '@/components/Layout';
import ImagePageHero from '@/components/page/ImagePageHero';
import PageCtaSection from '@/components/page/PageCtaSection';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
import {
  Building2,
  TrendingUp,
  PenTool,
  Briefcase,
  Home,
  Landmark,
  Lightbulb,
} from 'lucide-react';

const services = [
  {
    icon: Building2,
    name: 'تطوير المشاريع السكنية والتجارية',
    description:
      'تطوير مشاريع عقارية متكاملة تشمل المجمعات السكنية والأبراج التجارية بمواصفات عالمية.',
  },
  {
    icon: TrendingUp,
    name: 'دراسات الجدوى الاقتصادية',
    description:
      'إعداد دراسات جدوى شاملة تحلل العائد الاستثماري والمخاطر وفرص السوق لضمان نجاح المشروع.',
  },
  {
    icon: PenTool,
    name: 'تخطيط وتصميم المشاريع العقارية',
    description:
      'تخطيط معماري وحضري متكامل يراعي احتياجات السوق والبيئة المحيطة ومتطلبات الجهات التنظيمية.',
  },
  {
    icon: Briefcase,
    name: 'إدارة التطوير من المفهوم إلى التسليم',
    description:
      'إدارة شاملة لدورة حياة المشروع العقاري من الفكرة الأولية وحتى التسليم النهائي للمستفيدين.',
  },
  {
    icon: Home,
    name: 'تطوير المجمعات السكنية والأبراج',
    description:
      'تصميم وتنفيذ مجمعات سكنية حديثة وأبراج شاهقة بمرافق خدمية متكاملة ومساحات خضراء.',
  },
  {
    icon: Landmark,
    name: 'تطوير المراكز التجارية والمكتبية',
    description:
      'إنشاء مراكز تجارية ومكتبية عصرية تلبي احتياجات الأعمال مع أحدث التقنيات والتصاميم.',
  },
  {
    icon: Lightbulb,
    name: 'الاستشارات العقارية الاستراتيجية',
    description:
      'تقديم استشارات استراتيجية للمستثمرين والمطورين تشمل تحليل السوق وتحديد الفرص الاستثمارية.',
  },
];

export default function RealEstateDevelopment() {
  return (
    <Layout>
      <ImagePageHero
        titleKey="page.red.hero.title"
        subtitleKey="page.red.hero.subtitle"
        titleEditableId="red-hero-title"
        subtitleEditableId="red-hero-subtitle"
      />

      <ServiceDetailGrid services={services} titleKey="page.services.development.title" />

      <PageCtaSection
        titleKey="page.red.cta.title"
        descKey="page.red.cta.desc"
        buttonKey="page.services.cta.button"
        buttonTo="/consultation"
      />
    </Layout>
  );
}
