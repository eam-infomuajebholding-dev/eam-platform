import { Link } from "react-router-dom";
import { Globe, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { client } from "@/lib/api";

const iconBtnClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-soft-border text-ink/70 transition-all duration-200 hover:border-primary-gold hover:bg-cream-soft hover:text-deep-gold dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10";

type UserActionsProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function UserActions({ variant = "desktop", onNavigate }: UserActionsProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();

  const handleAuthEntry = async () => {
    onNavigate?.();
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
            {isAdmin ? (
              <Link
                to="/command-center"
                onClick={onNavigate}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-ink/80 transition-colors hover:text-deep-gold hover:bg-primary-gold/10 dark:text-white/80"
              >
                لوحة القيادة
              </Link>
            ) : null}
            <Link
              to="/my-requests"
              onClick={onNavigate}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-ink/80 transition-colors hover:text-deep-gold hover:bg-primary-gold/10 dark:text-white/80"
            >
              طلباتي
            </Link>
            <button type="button" onClick={() => void handleLogout()} className="eam-btn-primary w-full">
              تسجيل الخروج
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void handleAuthEntry()}
              className="block w-full rounded-lg px-4 py-3 text-sm font-medium text-ink/80 transition-colors hover:text-deep-gold hover:bg-primary-gold/10 dark:text-white/80"
            >
              تسجيل الدخول
            </button>
            <button type="button" onClick={() => void handleAuthEntry()} className="eam-btn-primary w-full">
              إنشاء حساب
            </button>
          </>
        )}
      </div>
    ) : user ? (
      <>
        {isAdmin ? (
          <Link
            to="/command-center"
            className="rounded-lg px-2.5 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:text-deep-gold dark:text-white/80"
          >
            لوحة القيادة
          </Link>
        ) : null}
        <Link
          to="/my-requests"
          className="rounded-lg px-2.5 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:text-deep-gold dark:text-white/80"
        >
          طلباتي
        </Link>
        <button type="button" onClick={() => void handleLogout()} className="eam-btn-primary">
          تسجيل الخروج
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={() => void handleAuthEntry()}
          className="rounded-lg px-2.5 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:text-deep-gold dark:text-white/80"
        >
          تسجيل الدخول
        </button>
        <button type="button" onClick={() => void handleAuthEntry()} className="eam-btn-primary">
          إنشاء حساب
        </button>
      </>
    );

  if (variant === "mobile") {
    return authControls;
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <button type="button" aria-label="تغيير اللغة" className={iconBtnClass}>
        <Globe size={18} />
      </button>

      <button type="button" onClick={toggleTheme} aria-label="تبديل الوضع" className={iconBtnClass}>
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {authControls}
    </div>
  );
}
