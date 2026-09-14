import Layout from '@/components/Layout';
import ImagePageHero from '@/components/page/ImagePageHero';
import PageCtaSection from '@/components/page/PageCtaSection';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
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
      <ImagePageHero
        titleKey="page.contracting.hero.title"
        subtitleKey="page.contracting.hero.subtitle"
      />

      <ServiceDetailGrid services={services} titleKey="page.services.contracting.title" />

      <PageCtaSection
        titleKey="page.contracting.cta.title"
        descKey="page.contracting.cta.desc"
        buttonKey="page.services.cta.button"
        buttonTo="/consultation"
      />
    </Layout>
  );
}
