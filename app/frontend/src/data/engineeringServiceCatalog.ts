import {
  Building2,
  Calculator,
  Cpu,
  FileSearch,
  FlaskConical,
  HardHat,
  Home,
  Layers,
  MapPin,
  PenTool,
  RotateCcw,
  Ruler,
  TrendingUp,
  Wind,
  Zap,
  Box,
  type LucideIcon,
} from 'lucide-react';

export type EngineeringServiceEntry = {
  id: string;
  icon: LucideIcon;
  nameAr: string;
  nameEn: string;
};

/** Canonical engineering offerings — core EAM company services */
export const ENGINEERING_SERVICE_CATALOG: EngineeringServiceEntry[] = [
  { id: 'saudi-code', icon: Ruler, nameAr: 'تصميم مخططات حسب الكود السعودي الجديد', nameEn: 'Design per Saudi building code' },
  { id: 'arch-plans', icon: Building2, nameAr: 'مخططات معمارية معتمدة', nameEn: 'Approved architectural plans' },
  { id: 'structural', icon: Layers, nameAr: 'مخططات إنشائية + نوتة حسابية', nameEn: 'Structural plans + calculations' },
  { id: 'electrical', icon: Zap, nameAr: 'مخططات كهربائية متكاملة', nameEn: 'Integrated electrical plans' },
  { id: 'mechanical', icon: Wind, nameAr: 'مخططات ميكانيكية متكاملة', nameEn: 'Integrated mechanical plans' },
  { id: 'smart', icon: Cpu, nameAr: 'مخططات النظام الذكي', nameEn: 'Smart building systems' },
  { id: 'exterior-3d', icon: Box, nameAr: 'مناظير خارجية 3D', nameEn: '3D exterior visuals' },
  { id: 'interior-3d', icon: Home, nameAr: 'مناظير داخلية 3D', nameEn: '3D interior visuals' },
  { id: '360', icon: RotateCcw, nameAr: 'مناظير 360 درجة', nameEn: '360° visuals' },
  { id: 'review', icon: FileSearch, nameAr: 'مراجعة / دراسة / تعديل مخططات', nameEn: 'Plan review & revision' },
  { id: 'arch-struct', icon: PenTool, nameAr: 'معماري / إنشائي مع نوتة حسابية', nameEn: 'Arch / structural with calcs' },
  { id: 'supervision', icon: HardHat, nameAr: 'إشراف هندسي / عظم / تشطيب', nameEn: 'Engineering supervision' },
  { id: 'soil', icon: FlaskConical, nameAr: 'اختبار تربة', nameEn: 'Soil testing' },
  { id: 'survey', icon: MapPin, nameAr: 'رفع مساحي', nameEn: 'Land surveying' },
  { id: 'feasibility', icon: TrendingUp, nameAr: 'دراسة جدوى', nameEn: 'Feasibility studies' },
  { id: 'quantities', icon: Calculator, nameAr: 'حساب كميات', nameEn: 'Quantity surveying' },
];

/** Homepage preview — representative slice of the catalog */
export const HOME_FEATURED_ENGINEERING_SERVICE_IDS = [
  'arch-plans',
  'structural',
  'electrical',
  'mechanical',
  'supervision',
  'feasibility',
  'exterior-3d',
  'review',
] as const;

export function getFeaturedEngineeringServices(): EngineeringServiceEntry[] {
  const byId = new Map(ENGINEERING_SERVICE_CATALOG.map((entry) => [entry.id, entry]));
  return HOME_FEATURED_ENGINEERING_SERVICE_IDS.map((id) => byId.get(id)).filter(
    (entry): entry is EngineeringServiceEntry => Boolean(entry),
  );
}

export function engineeringServicesForDetailGrid(language: string) {
  const isAr = language.startsWith('ar');
  return ENGINEERING_SERVICE_CATALOG.map((entry) => ({
    icon: entry.icon,
    name: isAr ? entry.nameAr : entry.nameEn,
  }));
}
