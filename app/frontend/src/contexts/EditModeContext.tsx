import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

/** Inline editing in dev, or when explicitly enabled (e.g. staging preview). */
export const isDevEditModeEnabled =
  import.meta.env.DEV || import.meta.env.VITE_SITE_EDITOR === 'true';

interface EditModeContextType {
  isEditMode: boolean;
  isAuthenticated: boolean;
  isDevEditModeAvailable: boolean;
  toggleEditMode: () => void;
  login: (password: string) => boolean;
  logout: () => void;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};

interface EditModeProviderProps {
  children: ReactNode;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = useCallback(() => {
    if (!isDevEditModeEnabled) {
      toast.message('محرر المحتوى غير متاح', {
        description: 'شغّل npm run dev أو فعّل VITE_SITE_EDITOR=true ثم أعد البناء.',
      });
      return;
    }
    setIsEditMode((prev) => {
      const next = !prev;
      if (next) {
        toast.message('وضع التحرير مفعّل', {
          description: 'انقر على عنوان أو فقرة أو صورة في الصفحة.',
        });
      }
      return next;
    });
  }, []);

  const login = useCallback((_password: string): boolean => false, []);

  const logout = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode: isDevEditModeEnabled && isEditMode,
        isAuthenticated: isDevEditModeEnabled && isEditMode,
        isDevEditModeAvailable: isDevEditModeEnabled,
        toggleEditMode,
        login,
        logout,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};
