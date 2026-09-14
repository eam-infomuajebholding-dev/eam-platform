import Layout from '@/components/Layout';
import ImagePageHero from '@/components/page/ImagePageHero';
import PageCtaSection from '@/components/page/PageCtaSection';
import ServiceDetailGrid from '@/components/services/ServiceDetailGrid';
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

const ENGINEERING_IMAGE =
  'https://mgx-backend-cdn.metadl.com/generate/images/1200196/2026-05-07/och7nlqaagqa/engineering-services-blueprints.png';

export default function EngineeringServices() {
  return (
    <Layout>
      <ImagePageHero
        titleKey="page.engineering.hero.title"
        subtitleKey="page.engineering.hero.subtitle"
        backgroundImage={ENGINEERING_IMAGE}
        ctaTo="/journeys/engineering-consulting"
        ctaKey="page.sector.startEc"
      />

      <ServiceDetailGrid services={services} titleKey="page.services.engineering.title" />

      <PageCtaSection
        titleKey="page.engineering.cta.title"
        descKey="page.engineering.cta.desc"
        buttonKey="common.contactUs"
        buttonTo="/contact-card"
      />
    </Layout>
  );
}
