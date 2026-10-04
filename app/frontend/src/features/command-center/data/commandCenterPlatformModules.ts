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
};

/** 24 tiles — order matches agreed Command Center mockup */
export const COMMAND_CENTER_PLATFORM_MODULES: CommandCenterPlatformModule[] = [
  { id: 'about', route: '/about', icon: Globe2, tint: 'cc-tint-gold', labelKey: 'nav.about', labelEn: 'About EAM' },
  {
    id: 'engineering-design',
    route: '/journeys/build-villa',
    icon: Ruler,
    tint: 'cc-tint-blue',
    labelKey: 'commandCenter.modules.engineeringDesign',
    labelEn: 'Engineering Design',
    countSlug: 'build-villa',
  },
  {
    id: 'real-estate-development',
    route: '/services/real-estate-development',
    icon: Building2,
    tint: 'cc-tint-red',
    labelKey: 'sector.real-estate-development',
    labelEn: 'Real Estate Dev',
    countSlug: 'real-estate-development',
  },
  {
    id: 'investment',
    route: '/invest',
    icon: TrendingUp,
    tint: 'cc-tint-green',
    labelKey: 'sector.investment',
    labelEn: 'Real Estate Investment',
    countSlug: 'investment',
  },
  {
    id: 'real-estate-marketing',
    route: '/services/real-estate-marketing',
    icon: Megaphone,
    tint: 'cc-tint-orange',
    labelKey: 'sector.real-estate-marketing',
    labelEn: 'Real Estate Marketing',
    countSlug: 'real-estate-marketing',
  },
  {
    id: 'real-estate-valuation',
    route: '/sectors/real-estate-valuation',
    icon: Home,
    tint: 'cc-tint-cyan',
    labelKey: 'sector.real-estate-valuation',
    labelEn: 'Real Estate Valuation',
    countSlug: 'real-estate-valuation',
  },
  {
    id: 'government-services',
    route: '/government-services',
    icon: Landmark,
    tint: 'cc-tint-slate',
    labelKey: 'sector.government-services',
    labelEn: 'Government Services',
    countSlug: 'government-services',
  },
  {
    id: 'project-management',
    route: '/sectors/project-management',
    icon: ClipboardList,
    tint: 'cc-tint-blue',
    labelKey: 'sector.project-management',
    labelEn: 'Project Management',
    countSlug: 'project-management',
  },
  {
    id: 'engineering-consulting',
    route: '/engineering-services',
    icon: Ruler,
    tint: 'cc-tint-purple',
    labelKey: 'sector.engineering-consulting',
    labelEn: 'Engineering Consulting',
    countSlug: 'engineering-consulting',
  },
  {
    id: 'contracting',
    route: '/services/contracting',
    icon: HardHat,
    tint: 'cc-tint-gold',
    labelKey: 'sector.contracting',
    labelEn: 'Contracting & Execution',
    countSlug: 'contracting',
  },
  {
    id: 'building-materials',
    route: '/sectors/building-materials',
    icon: Package,
    tint: 'cc-tint-orange',
    labelKey: 'sector.building-materials',
    labelEn: 'Building Materials',
    countSlug: 'building-materials',
  },
  {
    id: 'equipment',
    route: '/sectors/equipment',
    icon: Cog,
    tint: 'cc-tint-cyan',
    labelKey: 'sector.equipment',
    labelEn: 'Equipment & Machinery',
    countSlug: 'equipment',
  },
  {
    id: 'factories-suppliers',
    route: '/sectors/factories-suppliers',
    icon: Factory,
    tint: 'cc-tint-green',
    labelKey: 'sector.factories-suppliers',
    labelEn: 'Factories & Suppliers',
    countSlug: 'factories-suppliers',
  },
  {
    id: 'smart-maintenance',
    route: '/services/maintenance',
    icon: Wrench,
    tint: 'cc-tint-blue',
    labelKey: 'sector.smart-maintenance',
    labelEn: 'Operations & Maintenance',
    countSlug: 'smart-maintenance',
  },
  {
    id: 'facility-management',
    route: '/sectors/facility-management',
    icon: Building2,
    tint: 'cc-tint-red',
    labelKey: 'sector.facility-management',
    labelEn: 'Facility Management',
    countSlug: 'facility-management',
  },
  {
    id: 'furnishing',
    route: '/sectors/furnishing',
    icon: Sofa,
    tint: 'cc-tint-orange',
    labelKey: 'sector.furnishing',
    labelEn: 'Interior Fitout',
    countSlug: 'furnishing',
  },
  {
    id: 'delivery-warranty',
    route: '/sectors/delivery-warranty',
    icon: Truck,
    tint: 'cc-tint-purple',
    labelKey: 'sector.delivery-warranty',
    labelEn: 'Handover & After-Sales',
    countSlug: 'delivery-warranty',
  },
  { id: 'projects', route: '/projects', icon: BarChart3, tint: 'cc-tint-gold', labelKey: 'nav.projects', labelEn: 'Projects' },
  { id: 'marketplace', route: '/market', icon: ShoppingBag, tint: 'cc-tint-purple', labelKey: 'nav.market', labelEn: 'Marketplace' },
  { id: 'careers', route: '/careers', icon: Users, tint: 'cc-tint-cyan', labelKey: 'nav.careers', labelEn: 'Careers' },
  { id: 'blog', route: '/blog', icon: Newspaper, tint: 'cc-tint-green', labelKey: 'nav.blog', labelEn: 'Blog' },
  { id: 'contact', route: '/contact', icon: Mail, tint: 'cc-tint-slate', labelKey: 'nav.contact', labelEn: 'Contact Us' },
  {
    id: 'platform-admin',
    route: '/admin',
    icon: Settings,
    tint: 'cc-tint-gold',
    labelKey: 'commandCenter.nav.settings',
    labelEn: 'Platform Management',
  },
  {
    id: 'analytics',
    route: '/command-center#finance',
    icon: LayoutGrid,
    tint: 'cc-tint-blue',
    labelKey: 'commandCenter.nav.analytics',
    labelEn: 'Analytics & Reports',
  },
];
