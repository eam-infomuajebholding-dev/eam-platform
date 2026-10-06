import Layout from '@/components/Layout';
import ImagePageHero from '@/components/page/ImagePageHero';
import PageCtaSection from '@/components/page/PageCtaSection';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
import {
  Wrench,
  ThermometerSun,
  Zap,
  Droplets,
  FileText,
  AlertCircle,
  Cog,
} from 'lucide-react';

const services = [
  {
    icon: Wrench,
    name: 'صيانة المباني الدورية والوقائية',
    description:
      'برامج صيانة دورية ووقائية شاملة للمباني تضمن استمرارية الأداء وإطالة العمر الافتراضي للمنشآت.',
  },
  {
    icon: Cog,
    name: 'تشغيل وإدارة المرافق',
    description:
      'إدارة متكاملة للمرافق تشمل التشغيل اليومي والتنسيق بين الأقسام وضمان بيئة عمل مثالية.',
  },
  {
    icon: ThermometerSun,
    name: 'صيانة أنظمة التكييف والتبريد (HVAC)',
    description:
      'صيانة وإصلاح أنظمة التكييف المركزي والتبريد بجميع أنواعها مع ضمان الكفاءة التشغيلية.',
  },
  {
    icon: Zap,
    name: 'صيانة الأنظمة الكهربائية والسباكة',
    description:
      'فحص وصيانة الشبكات الكهربائية وأنظمة السباكة والتمديدات الصحية بأيدي فنيين متخصصين.',
  },
  {
    icon: FileText,
    name: 'إدارة عقود الصيانة الشاملة',
    description:
      'عقود صيانة سنوية شاملة مصممة حسب احتياجات كل مبنى مع تقارير دورية وجدولة زمنية محكمة.',
  },
  {
    icon: AlertCircle,
    name: 'خدمات الطوارئ والإصلاح العاجل',
    description:
      'فريق طوارئ متاح على مدار الساعة للاستجابة السريعة لأي أعطال طارئة وإصلاحها فوراً.',
  },
  {
    icon: Droplets,
    name: 'صيانة المصاعد والأنظمة الميكانيكية',
    description:
      'صيانة دورية وإصلاح المصاعد والسلالم المتحركة والأنظمة الميكانيكية وفق معايير السلامة.',
  },
];

export default function MaintenanceServices() {
  return (
    <Layout>
      <ImagePageHero
        titleKey="page.maintenance.hero.title"
        subtitleKey="page.maintenance.hero.subtitle"
        titleEditableId="maintenance-hero-title"
        subtitleEditableId="maintenance-hero-subtitle"
      />

      <ServiceDetailGrid services={services} titleKey="page.services.maintenance.title" />

      <PageCtaSection
        titleKey="page.maintenance.cta.title"
        descKey="page.maintenance.cta.desc"
        buttonKey="page.sector.startMaintenance"
        buttonTo="/journeys/smart-maintenance"
      />
    </Layout>
  );
}
