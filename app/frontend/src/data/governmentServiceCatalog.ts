import {
  AlertTriangle,
  Building,
  Building2,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Key,
  Map,
  Plus,
  Scissors,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export type GovernmentServiceEntry = {
  id: string;
  icon: LucideIcon;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

export const GOVERNMENT_SERVICE_CATALOG: GovernmentServiceEntry[] = [
  {
    id: 'deed-update',
    icon: FileText,
    nameAr: 'تحديث صكوك وما يعادله',
    nameEn: 'Deed updates & equivalents',
    descriptionAr:
      'خدمة تحديث وتوثيق الصكوك العقارية وما يعادلها وفقاً للأنظمة والتشريعات المعتمدة في المملكة',
    descriptionEn: 'Update and certify property deeds per KSA regulations',
  },
  {
    id: 'cadastral',
    icon: Map,
    nameAr: 'إصدار كروكيات "إرشادي - تنظيمي"',
    nameEn: 'Guidance / regulatory sketches',
    descriptionAr: 'إعداد وإصدار الكروكيات الإرشادية والتنظيمية المعتمدة للمواقع والأراضي بدقة عالية',
    descriptionEn: 'Approved cadastral and regulatory sketches for sites and land',
  },
  {
    id: 'building-permits',
    icon: Key,
    nameAr: 'رخص البناء (سكني / تجاري / إداري)',
    nameEn: 'Building permits (residential / commercial)',
    descriptionAr:
      'استخراج رخص البناء لجميع أنواع المباني السكنية والتجارية والإدارية وفق الاشتراطات البلدية',
    descriptionEn: 'Building permits for all building types per municipal rules',
  },
  {
    id: 'subdivision',
    icon: Scissors,
    nameAr: 'الفرز العقاري والدمج العقاري',
    nameEn: 'Property subdivision & merger',
    descriptionAr: 'خدمات فرز ودمج العقارات وتقسيم الأراضي وفقاً للأنظمة العقارية المعتمدة',
    descriptionEn: 'Subdivision, merger, and land partitioning services',
  },
  {
    id: 'demolition',
    icon: Building,
    nameAr: 'رخص هدم / ترميم',
    nameEn: 'Demolition / renovation permits',
    descriptionAr: 'إصدار رخص الهدم والترميم للمباني القائمة مع إعداد جميع المستندات والدراسات المطلوبة',
    descriptionEn: 'Demolition and renovation permits with required studies',
  },
  {
    id: 'violations',
    icon: AlertTriangle,
    nameAr: 'تصحيح أوضاع المخالفات',
    nameEn: 'Violation regularization',
    descriptionAr: 'معالجة وتصحيح أوضاع المخالفات البنائية وتقديم الحلول المناسبة وفق الأنظمة المعمول بها',
    descriptionEn: 'Building violation correction per applicable regulations',
  },
  {
    id: 'occupancy',
    icon: CheckCircle,
    nameAr: 'شهادات الإشغال',
    nameEn: 'Occupancy certificates',
    descriptionAr:
      'استخراج شهادات الإشغال للمباني المكتملة بعد التأكد من مطابقتها للمواصفات والمعايير المطلوبة',
    descriptionEn: 'Occupancy certificates after compliance verification',
  },
  {
    id: 'legacy-licenses',
    icon: Plus,
    nameAr: 'إضافة الرخص القديمة',
    nameEn: 'Legacy license registration',
    descriptionAr: 'خدمة إضافة وتحديث الرخص القديمة في النظام الإلكتروني وربطها بالسجلات الحالية',
    descriptionEn: 'Register and link legacy licenses in electronic systems',
  },
  {
    id: 'lift-ban',
    icon: ShieldCheck,
    nameAr: 'طلبات رفع الحضر',
    nameEn: 'Lift suspension requests',
    descriptionAr: 'تقديم ومتابعة طلبات رفع الحضر عن العقارات والأراضي لدى الجهات المختصة',
    descriptionEn: 'Submit and track property suspension lift requests',
  },
  {
    id: 'group-housing',
    icon: Building2,
    nameAr: 'إصدار رخص السكن الجماعي',
    nameEn: 'Group housing permits',
    descriptionAr: 'استخراج رخص السكن الجماعي للعمال والموظفين وفق اشتراطات وزارة الشؤون البلدية',
    descriptionEn: 'Group housing permits per municipal requirements',
  },
  {
    id: 'insurance',
    icon: ClipboardCheck,
    nameAr: 'إصدار التأمين للمباني',
    nameEn: 'Building insurance issuance',
    descriptionAr: 'إصدار وثائق التأمين اللازمة للمباني والمنشآت بالتعاون مع شركات التأمين المعتمدة',
    descriptionEn: 'Building insurance documents via approved insurers',
  },
];

export function governmentServicesForDetailGrid(language: string) {
  const isAr = language.startsWith('ar');
  return GOVERNMENT_SERVICE_CATALOG.map((entry) => ({
    icon: entry.icon,
    name: isAr ? entry.nameAr : entry.nameEn,
    description: isAr ? entry.descriptionAr : entry.descriptionEn,
  }));
}
