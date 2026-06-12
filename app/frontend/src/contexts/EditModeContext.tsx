import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const ADMIN_PASSWORD = 'eam2024';
const AUTH_STORAGE_KEY = 'edit_mode_authenticated';

interface EditModeContextType {
  isEditMode: boolean;
  isAuthenticated: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setIsEditMode(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setIsEditMode(false);
  }, []);

  const toggleEditMode = useCallback(() => {
    if (isAuthenticated) {
      setIsEditMode((prev) => !prev);
    }
  }, [isAuthenticated]);

  return (
    <EditModeContext.Provider value={{ isEditMode, isAuthenticated, toggleEditMode, login, logout }}>
      {children}
    </EditModeContext.Provider>
  );
};