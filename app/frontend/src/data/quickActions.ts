import {
  Building2,
  ClipboardList,
  HardHat,
  House,
  Package,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { HomeMessageKey } from '@/i18n/homeMessages';

export type QuickActionDefinition = {
  id: string;
  labelKey: HomeMessageKey;
  icon: LucideIcon;
  href: string;
};

/** Homepage quick links — routes verified against App routes and sector registry */
export const QUICK_ACTIONS: QuickActionDefinition[] = [
  {
    id: 'buildVilla',
    labelKey: 'quickActions.buildVilla',
    icon: House,
    href: '/journeys/build-villa',
  },
  {
    id: 'createProject',
    labelKey: 'quickActions.createProject',
    icon: ClipboardList,
    href: '/sectors/project-management',
  },
  {
    id: 'engineering',
    labelKey: 'quickActions.engineering',
    icon: Building2,
    href: '/engineering-services',
  },
  {
    id: 'investment',
    labelKey: 'quickActions.investment',
    icon: TrendingUp,
    href: '/invest',
  },
  {
    id: 'contractor',
    labelKey: 'quickActions.contractor',
    icon: HardHat,
    href: '/services/contracting',
  },
  {
    id: 'buyProduct',
    labelKey: 'quickActions.buyProduct',
    icon: Package,
    href: '/sectors/building-materials',
  },
];
