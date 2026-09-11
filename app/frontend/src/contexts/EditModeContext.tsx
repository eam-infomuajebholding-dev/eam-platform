import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/** Dev-only inline editing — not production admin auth. */
export const isDevEditModeEnabled = import.meta.env.DEV;

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
    if (isDevEditModeEnabled) {
      setIsEditMode((prev) => !prev);
    }
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
