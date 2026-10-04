import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isCommandCenterOpenAccessEnabled } from '@/config/commandCenterDevAccess';
import { authApi } from '@/features/auth/api/auth';
import { clearCustomerSensitiveQueries } from '@/features/auth/api/clearCustomerCache';

export type CommandCenterAccess = {
  role: 'owner' | 'delegate';
  permissions: string[];
  delegation_id?: number | null;
  expires_at?: string | null;
};

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  last_login?: string;
  command_center?: CommandCenterAccess | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (returnTo?: string | null) => Promise<void>;
  register: (returnTo?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
  isAdmin: boolean;
  canAccessCommandCenter: boolean;
  isCommandCenterOwner: boolean;
  commandCenterAccess: CommandCenterAccess | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (returnTo?: string | null) => {
    try {
      setError(null);
      authApi.login(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const register = async (returnTo?: string | null) => {
    try {
      setError(null);
      authApi.register(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      clearCustomerSensitiveQueries(queryClient);
      await authApi.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const commandCenterAccess = user?.command_center ?? null;
  const isAdmin = user?.role === 'admin';
  const canAccessCommandCenter =
    isCommandCenterOpenAccessEnabled || Boolean(commandCenterAccess) || isAdmin;
  const isCommandCenterOwner =
    isCommandCenterOpenAccessEnabled ||
    commandCenterAccess?.role === 'owner' ||
    (isAdmin && commandCenterAccess?.role !== 'delegate');

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refetch: checkAuthStatus,
    isAdmin,
    canAccessCommandCenter,
    isCommandCenterOwner,
    commandCenterAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
