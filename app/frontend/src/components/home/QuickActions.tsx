import { useNavigate } from 'react-router-dom';
import {
  Building2,
  HardHat,
  Home,
  ShoppingBag,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { BUILD_VILLA_QUICK_ACTION_LABEL } from '@/features/ai-workspace/types';

type QuickActionItem = {
  label: string;
  icon: LucideIcon;
  route?: string;
};

/** WO-021 B09 — suggestions aligned with real platform routes where available */
const suggestions: QuickActionItem[] = [
  { label: 'أريد إنشاء مشروع', icon: Home, route: '/sectors/project-management' },
  { label: 'أحتاج خدمة هندسية', icon: Building2, route: '/engineering-services' },
  { label: 'أبحث عن فرصة استثمارية', icon: TrendingUp, route: '/invest' },
  { label: 'أبحث عن مقاول', icon: HardHat, route: '/services/contracting' },
  { label: BUILD_VILLA_QUICK_ACTION_LABEL, icon: Home },
  { label: 'أريد شراء منتج هندسي', icon: ShoppingBag, route: '/sectors/building-materials' },
];

interface QuickActionsProps {
  onSelect?: (label: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleClick = (item: QuickActionItem) => {
    if (item.route) {
      navigate(item.route);
      return;
    }
    onSelect?.(item.label);
  };

  return (
    <div className="home-quick-actions">
      {suggestions.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} type="button" onClick={() => handleClick(item)}>
            <Icon size={14} strokeWidth={1.75} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
