import { useState, useRef, useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { PenSquare, Lock, X } from 'lucide-react';

export default function EditToolbar() {
  const { isEditMode, isAuthenticated, toggleEditMode, login, logout } = useEditMode();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when popup opens
  useEffect(() => {
    if (showLoginPopup && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showLoginPopup]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowLoginPopup(false);
        setPassword('');
        setLoginError('');
      }
    };
    if (showLoginPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLoginPopup]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setShowLoginPopup(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleToggleClick = () => {
    if (isAuthenticated) {
      toggleEditMode();
    } else {
      setShowLoginPopup(true);
    }
  };

  return (
    <>
      {/* Toggle Button - fixed bottom-left */}
      {!isEditMode && (
        <div className="fixed bottom-6 left-6 z-[9999]">
          <button
            onClick={handleToggleClick}
            className="w-12 h-12 rounded-full bg-[#1a1a2e]/90 border border-[#D3B051]/40 shadow-lg shadow-[#D3B051]/10 flex items-center justify-center hover:bg-[#D3B051]/20 hover:border-[#D3B051]/70 transition-all duration-300 group"
            aria-label="تفعيل وضع التحرير"
          >
            {isAuthenticated ? (
              <PenSquare className="h-5 w-5 text-[#D3B051] group-hover:scale-110 transition-transform" />
            ) : (
              <Lock className="h-5 w-5 text-[#D3B051]/70 group-hover:text-[#D3B051] group-hover:scale-110 transition-all" />
            )}
          </button>

          {/* Inline Login Popup */}
          {showLoginPopup && (
            <div
              ref={popupRef}
              className="absolute bottom-14 left-0 w-64 p-4 rounded-lg bg-[#1a1a2e]/95 border border-[#D3B051]/40 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
              dir="rtl"
            >
              <p className="text-[#D3B051] text-sm font-bold mb-3 text-center">
                دخول وضع التحرير
              </p>
              <form onSubmit={handleLoginSubmit} className="space-y-2">
                <input
                  ref={inputRef}
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-[#D3B051]/30 text-white text-sm text-center placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D3B051]/50"
                />
                {loginError && (
                  <p className="text-xs text-red-400 text-center">{loginError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-2 rounded-md bg-[#D3B051] text-[#1a1a2e] text-sm font-bold hover:bg-[#D3B051]/80 transition-colors"
                >
                  دخول
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Edit Mode Active Banner - fixed at top */}
      {isEditMode && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#D3B051]/95 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-[#1a1a2e] text-sm font-bold">
                وضع التحرير نشط
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  logout();
                }}
                className="text-[#1a1a2e]/70 text-xs hover:text-[#1a1a2e] underline transition-colors"
              >
                تسجيل الخروج
              </button>
              <button
                onClick={toggleEditMode}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#1a1a2e] text-[#D3B051] text-sm font-bold hover:bg-[#1a1a2e]/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                إيقاف التحرير
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}