import Layout from '@/components/Layout';
import ImagePageHero from '@/components/page/ImagePageHero';
import PageCtaSection from '@/components/page/PageCtaSection';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
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
      <ImagePageHero
        titleKey="page.government.hero.title"
        subtitleKey="page.government.hero.subtitle"
        backgroundImage={GOVERNMENT_IMAGE}
      />

      <ServiceDetailGrid services={services} titleKey="page.services.government.title" />

      <PageCtaSection
        titleKey="page.government.cta.title"
        descKey="page.government.cta.desc"
        buttonKey="page.sector.startGs"
        buttonTo="/journeys/government-services"
      />
    </Layout>
  );
}
