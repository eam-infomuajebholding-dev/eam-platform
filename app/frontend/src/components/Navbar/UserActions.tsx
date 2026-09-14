import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Sun, Moon } from "lucide-react";
import LanguageSelector from "@/components/Navbar/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { client } from "@/lib/api";
import { saveAuthReturnTo } from "@/features/auth/utils/authReturnTo";

const iconBtnClass = 'site-nav-icon-btn';
const textLinkClass = 'site-nav-text-btn';
const primaryBtnClass = 'site-nav-cta-btn';
const commandCenterBtnClass = 'site-nav-command-center-btn';

function CommandCenterEntry({
  variant,
  onNavigate,
  label,
}: {
  variant: 'desktop' | 'mobile';
  onNavigate?: () => void;
  label: string;
}) {
  const className =
    variant === 'mobile'
      ? `${commandCenterBtnClass} site-nav-command-center-btn--mobile w-full`
      : commandCenterBtnClass;

  return (
    <Link to="/command-center" onClick={onNavigate} className={className}>
      <LayoutDashboard size={variant === 'mobile' ? 18 : 16} strokeWidth={2} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

type UserActionsProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function UserActions({ variant = "desktop", onNavigate }: UserActionsProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { user, logout, canAccessCommandCenter } = useAuth();

  const handleAuthEntry = async () => {
    onNavigate?.();
    saveAuthReturnTo(`${location.pathname}${location.search}`);
    await client.auth.toLogin();
  };

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
  };

  const authControls =
    variant === "mobile" ? (
      <div className="flex flex-col gap-2">
        {user ? (
          <>
            {canAccessCommandCenter ? (
              <CommandCenterEntry variant="mobile" onNavigate={onNavigate} label={t('auth.commandCenter')} />
            ) : null}
            <Link
              to="/my-requests"
              onClick={onNavigate}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-ink/80 transition-colors hover:text-deep-gold hover:bg-primary-gold/10 dark:text-white/80"
            >
              {t('auth.myRequests')}
            </Link>
            <button type="button" onClick={() => void handleLogout()} className={`${primaryBtnClass} w-full`}>
              {t('auth.logout')}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void handleAuthEntry()}
              className="block w-full rounded-lg px-4 py-3 text-sm font-medium text-ink/80 transition-colors hover:text-deep-gold hover:bg-primary-gold/10 dark:text-white/80"
            >
              {t('auth.login')}
            </button>
            <button type="button" onClick={() => void handleAuthEntry()} className={`${primaryBtnClass} w-full`}>
              {t('auth.signup')}
            </button>
          </>
        )}
      </div>
    ) : user ? (
      <>
        {canAccessCommandCenter ? (
          <CommandCenterEntry variant="desktop" label={t('auth.commandCenter')} />
        ) : null}
        <Link
          to="/my-requests"
          className={`${textLinkClass} site-nav-text-btn--always`}
        >
          {t('auth.myRequests')}
        </Link>
        <button type="button" onClick={() => void handleLogout()} className={primaryBtnClass}>
          {t('auth.logout')}
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={() => void handleAuthEntry()}
          className={`${textLinkClass} site-nav-text-btn--always`}
        >
          {t('auth.login')}
        </button>
        <button type="button" onClick={() => void handleAuthEntry()} className={primaryBtnClass}>
          {t('auth.signup')}
        </button>
      </>
    );

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-2">
        <LanguageSelector variant="mobile" onNavigate={onNavigate} />
        {authControls}
      </div>
    );
  }

  return (
    <div className="site-nav-actions whitespace-nowrap">
      <LanguageSelector />
      <button type="button" onClick={toggleTheme} aria-label={t('aria.toggleTheme')} className={iconBtnClass}>
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <span className="site-nav-actions-divider" aria-hidden="true" />
      {authControls}
    </div>
  );
}
