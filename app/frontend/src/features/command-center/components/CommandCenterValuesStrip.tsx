import {
  Handshake,
  Heart,
  Leaf,
  Rocket,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const VALUE_ITEMS = [
  { key: 'commandCenter.values.trust' as const, icon: Shield },
  { key: 'commandCenter.values.customer' as const, icon: Heart },
  { key: 'commandCenter.values.innovation' as const, icon: Sparkles },
  { key: 'commandCenter.values.partnerships' as const, icon: Handshake },
  { key: 'commandCenter.values.growth' as const, icon: Leaf },
] as const;

export default function CommandCenterValuesStrip() {
  const { t } = useLanguage();

  return (
    <footer className="command-center-brand-footer" aria-label={t('commandCenter.values.aria')}>
      <div className="command-center-brand-footer__inner">
        <img src="/assets/logo.png" alt="" className="command-center-brand-footer__logo" />
        <div className="command-center-brand-footer__values" role="list">
          {VALUE_ITEMS.map(({ key, icon: Icon }) => (
            <span key={key} role="listitem" className="command-center-brand-footer__value">
              <Icon size={14} strokeWidth={1.75} aria-hidden className="text-gold-400" />
              {t(key)}
            </span>
          ))}
        </div>
        <p className="command-center-brand-footer__vision" role="listitem">
          <Rocket size={14} strokeWidth={1.75} aria-hidden className="text-gold-400" />
          {t('commandCenter.values.vision')}
        </p>
      </div>
    </footer>
  );
}
