import {
  Building2,
  HardHat,
  Landmark,
  TrendingUp,
  Home,
  Wallet,
  Briefcase,
  ShoppingBag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BUILD_VILLA_QUICK_ACTION_LABEL } from '@/features/ai-workspace/types';

type QuickActionItem = {
  label: string;
  icon: LucideIcon;
};

const suggestions: QuickActionItem[] = [
  { label: 'أحتاج جهة هندسية', icon: Building2 },
  { label: 'أحتاج جهة تنفيذية', icon: HardHat },
  { label: BUILD_VILLA_QUICK_ACTION_LABEL, icon: Home },
  { label: 'أحتاج شقة', icon: Home },
  { label: 'أحتاج خدمة حكومية', icon: Landmark },
  { label: 'أحتاج تمويل', icon: Wallet },
  { label: 'أبحث عن استثمار', icon: TrendingUp },
  { label: 'أمثل شركة أو جهة', icon: Briefcase },
  { label: 'مواد بناء أو أثاث', icon: ShoppingBag },
];

interface QuickActionsProps {
  onSelect?: (label: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="home-quick-actions">
      {suggestions.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} type="button" onClick={() => onSelect?.(item.label)}>
            <Icon size={14} strokeWidth={1.75} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
