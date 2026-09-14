import Layout from '@/components/Layout';
import ImagePageHero from '@/components/page/ImagePageHero';
import PageCtaSection from '@/components/page/PageCtaSection';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
import {
  Megaphone,
  Camera,
  BarChart3,
  FileText,
  Users,
  Target,
  Globe,
} from 'lucide-react';

const services = [
  {
    icon: Globe,
    name: 'التسويق الرقمي للعقارات',
    description:
      'حملات تسويق رقمية متكاملة عبر منصات التواصل الاجتماعي ومحركات البحث للوصول لأكبر شريحة من المشترين.',
  },
  {
    icon: Megaphone,
    name: 'إدارة حملات البيع والتأجير',
    description:
      'تخطيط وتنفيذ حملات بيع وتأجير احترافية تحقق أعلى معدلات التحويل وأسرع فترات البيع.',
  },
  {
    icon: Camera,
    name: 'تصوير احترافي وجولات افتراضية',
    description:
      'تصوير عقاري احترافي بتقنيات حديثة وجولات افتراضية 360° تمنح العملاء تجربة مشاهدة واقعية.',
  },
  {
    icon: BarChart3,
    name: 'دراسات السوق العقاري وتحليل المنافسين',
    description:
      'تحليل شامل للسوق العقاري يشمل دراسة المنافسين والأسعار والاتجاهات لاتخاذ قرارات مدروسة.',
  },
  {
    icon: FileText,
    name: 'إعداد المواد التسويقية والعروض',
    description:
      'تصميم بروشورات وعروض تقديمية ومواد تسويقية جذابة تبرز مميزات المشروع العقاري.',
  },
  {
    icon: Users,
    name: 'إدارة علاقات العملاء (CRM)',
    description:
      'أنظمة متقدمة لإدارة علاقات العملاء وتتبع العملاء المحتملين وتحسين تجربة المشتري.',
  },
  {
    icon: Target,
    name: 'استراتيجيات التسعير والترويج',
    description:
      'وضع استراتيجيات تسعير تنافسية وخطط ترويجية مبتكرة تضمن تحقيق أفضل عائد استثماري.',
  },
];

export default function RealEstateMarketing() {
  return (
    <Layout>
      <ImagePageHero
        titleKey="page.rem.hero.title"
        subtitleKey="page.rem.hero.subtitle"
      />

      <ServiceDetailGrid services={services} titleKey="page.services.marketing.title" />

      <PageCtaSection
        titleKey="page.rem.cta.title"
        descKey="page.rem.cta.desc"
        buttonKey="page.services.cta.button"
        buttonTo="/consultation"
      />
    </Layout>
  );
}
