import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  ClipboardList,
  Cog,
  Factory,
  Globe2,
  HardHat,
  Home,
  Landmark,
  LayoutGrid,
  Mail,
  Megaphone,
  Newspaper,
  Package,
  Ruler,
  Settings,
  ShoppingBag,
  Sofa,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import type { HomeMessageKey } from '@/i18n/homeMessages';
import type { MessageKey } from '@/i18n/messages';

export type PlatformModuleTint =
  | 'cc-tint-blue'
  | 'cc-tint-red'
  | 'cc-tint-cyan'
  | 'cc-tint-orange'
  | 'cc-tint-purple'
  | 'cc-tint-green'
  | 'cc-tint-gold'
  | 'cc-tint-slate';

export type CommandCenterPlatformModule = {
  id: string;
  route: string;
  icon: LucideIcon;
  tint: PlatformModuleTint;
  labelKey: HomeMessageKey | MessageKey;
  labelEn: string;
  /** Match journey_metrics / sector slug for live counts */
  countSlug?: string;
  /** Agreed mockup tile badge when live metrics are empty (preview / dev shell) */
  showcaseCount?: number;
};

/** 24 tiles — order matches agreed Command Center mockup */
export const COMMAND_CENTER_PLATFORM_MODULES: CommandCenterPlatformModule[] = [
  { id: 'about', route: '/about', icon: Globe2, tint: 'cc-tint-gold', labelKey: 'nav.about', labelEn: 'About EAM', showcaseCount: 8 },
  {
    id: 'engineering-design',
    route: '/journeys/build-villa',
    icon: Ruler,
    tint: 'cc-tint-blue',
    labelKey: 'commandCenter.modules.engineeringDesign',
    labelEn: 'Engineering Design',
    countSlug: 'build-villa',
    showcaseCount: 24,
  },
  {
    id: 'real-estate-development',
    route: '/services/real-estate-development',
    icon: Building2,
    tint: 'cc-tint-red',
    labelKey: 'sector.real-estate-development',
    labelEn: 'Real Estate Dev',
    countSlug: 'real-estate-development',
    showcaseCount: 18,
  },
  {
    id: 'investment',
    route: '/invest',
    icon: TrendingUp,
    tint: 'cc-tint-green',
    labelKey: 'sector.investment',
    labelEn: 'Real Estate Investment',
    countSlug: 'investment',
    showcaseCount: 16,
  },
  {
    id: 'real-estate-marketing',
    route: '/services/real-estate-marketing',
    icon: Megaphone,
    tint: 'cc-tint-orange',
    labelKey: 'sector.real-estate-marketing',
    labelEn: 'Real Estate Marketing',
    countSlug: 'real-estate-marketing',
    showcaseCount: 14,
  },
  {
    id: 'real-estate-valuation',
    route: '/sectors/real-estate-valuation',
    icon: Home,
    tint: 'cc-tint-cyan',
    labelKey: 'sector.real-estate-valuation',
    labelEn: 'Real Estate Valuation',
    countSlug: 'real-estate-valuation',
    showcaseCount: 12,
  },
  {
    id: 'government-services',
    route: '/government-services',
    icon: Landmark,
    tint: 'cc-tint-slate',
    labelKey: 'sector.government-services',
    labelEn: 'Government Services',
    countSlug: 'government-services',
    showcaseCount: 9,
  },
  {
    id: 'project-management',
    route: '/sectors/project-management',
    icon: ClipboardList,
    tint: 'cc-tint-blue',
    labelKey: 'sector.project-management',
    labelEn: 'Project Management',
    countSlug: 'project-management',
    showcaseCount: 22,
  },
  {
    id: 'engineering-consulting',
    route: '/engineering-services',
    icon: Ruler,
    tint: 'cc-tint-purple',
    labelKey: 'sector.engineering-consulting',
    labelEn: 'Engineering Consulting',
    countSlug: 'engineering-consulting',
    showcaseCount: 15,
  },
  {
    id: 'contracting',
    route: '/services/contracting',
    icon: HardHat,
    tint: 'cc-tint-gold',
    labelKey: 'sector.contracting',
    labelEn: 'Contracting & Execution',
    countSlug: 'contracting',
    showcaseCount: 17,
  },
  {
    id: 'building-materials',
    route: '/sectors/building-materials',
    icon: Package,
    tint: 'cc-tint-orange',
    labelKey: 'sector.building-materials',
    labelEn: 'Building Materials',
    countSlug: 'building-materials',
    showcaseCount: 11,
  },
  {
    id: 'equipment',
    route: '/sectors/equipment',
    icon: Cog,
    tint: 'cc-tint-cyan',
    labelKey: 'sector.equipment',
    labelEn: 'Equipment & Machinery',
    countSlug: 'equipment',
    showcaseCount: 10,
  },
  {
    id: 'factories-suppliers',
    route: '/sectors/factories-suppliers',
    icon: Factory,
    tint: 'cc-tint-green',
    labelKey: 'sector.factories-suppliers',
    labelEn: 'Factories & Suppliers',
    countSlug: 'factories-suppliers',
    showcaseCount: 8,
  },
  {
    id: 'smart-maintenance',
    route: '/services/maintenance',
    icon: Wrench,
    tint: 'cc-tint-blue',
    labelKey: 'sector.smart-maintenance',
    labelEn: 'Operations & Maintenance',
    countSlug: 'smart-maintenance',
    showcaseCount: 13,
  },
  {
    id: 'facility-management',
    route: '/sectors/facility-management',
    icon: Building2,
    tint: 'cc-tint-red',
    labelKey: 'sector.facility-management',
    labelEn: 'Facility Management',
    countSlug: 'facility-management',
    showcaseCount: 9,
  },
  {
    id: 'furnishing',
    route: '/sectors/furnishing',
    icon: Sofa,
    tint: 'cc-tint-orange',
    labelKey: 'sector.furnishing',
    labelEn: 'Interior Fitout',
    countSlug: 'furnishing',
    showcaseCount: 7,
  },
  {
    id: 'delivery-warranty',
    route: '/sectors/delivery-warranty',
    icon: Truck,
    tint: 'cc-tint-purple',
    labelKey: 'sector.delivery-warranty',
    labelEn: 'Handover & After-Sales',
    countSlug: 'delivery-warranty',
    showcaseCount: 6,
  },
  { id: 'projects', route: '/projects', icon: BarChart3, tint: 'cc-tint-gold', labelKey: 'nav.projects', labelEn: 'Projects', showcaseCount: 4 },
  { id: 'marketplace', route: '/market', icon: ShoppingBag, tint: 'cc-tint-purple', labelKey: 'nav.market', labelEn: 'Marketplace', showcaseCount: 5 },
  { id: 'careers', route: '/careers', icon: Users, tint: 'cc-tint-cyan', labelKey: 'nav.careers', labelEn: 'Careers', showcaseCount: 3 },
  { id: 'blog', route: '/blog', icon: Newspaper, tint: 'cc-tint-green', labelKey: 'nav.blog', labelEn: 'Blog', showcaseCount: 2 },
  { id: 'contact', route: '/contact', icon: Mail, tint: 'cc-tint-slate', labelKey: 'nav.contact', labelEn: 'Contact Us', showcaseCount: 1 },
  {
    id: 'platform-admin',
    route: '/admin',
    icon: Settings,
    tint: 'cc-tint-gold',
    labelKey: 'commandCenter.nav.settings',
    labelEn: 'Platform Management',
    showcaseCount: 6,
  },
  {
    id: 'analytics',
    route: '/command-center#platform-sections',
    icon: LayoutGrid,
    tint: 'cc-tint-blue',
    labelKey: 'commandCenter.nav.analytics',
    labelEn: 'Analytics & Reports',
    showcaseCount: 5,
  },
];
