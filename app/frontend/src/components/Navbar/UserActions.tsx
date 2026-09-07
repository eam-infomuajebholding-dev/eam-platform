import { Link } from "react-router-dom";
import { Globe, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { client } from "@/lib/api";

export default function UserActions() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleAuthEntry = async () => {
    await client.auth.toLogin();
  };

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">

      {/* Language */}
      <button
        type="button"
        aria-label="تغيير اللغة"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
      >
        <Globe size={18} />
      </button>

      {/* Theme */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="تبديل الوضع"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {user ? (
        <>
          <Link
            to="/my-requests"
            className="rounded-lg px-2.5 py-2 text-[15px] font-medium text-gray-700 transition-colors duration-200 hover:text-[#B9923F] dark:text-white/80 dark:hover:text-white"
          >
            طلباتي
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-xl bg-[#6B7280] px-5 py-2 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#40485d]"
          >
            تسجيل الخروج
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={handleAuthEntry}
            className="rounded-lg px-2.5 py-2 text-[15px] font-medium text-gray-700 transition-colors duration-200 hover:text-[#B9923F] dark:text-white/80 dark:hover:text-white"
          >
            تسجيل الدخول
          </button>

          <button
            type="button"
            onClick={handleAuthEntry}
            className="rounded-xl bg-[#6B7280] px-5 py-2 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#40485d]"
          >
            إنشاء حساب
          </button>
        </>
      )}

    </div>
  );
}
