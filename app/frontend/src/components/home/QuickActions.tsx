import { Link } from 'react-router-dom';
import HorizontalMarquee from '@/components/home/HorizontalMarquee';
import { QUICK_ACTIONS } from '@/data/quickActions';
import { useLanguage } from '@/contexts/LanguageContext';

export default function QuickActions() {
  const { t } = useLanguage();

  return (
    <HorizontalMarquee speed={0.38} trackClassName="home-quick-actions flex w-max gap-2">
      {QUICK_ACTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.id} to={item.href} className="home-quick-action-pill">
            <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </HorizontalMarquee>
  );
}
