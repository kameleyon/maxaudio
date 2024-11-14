import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User, type RegisterData } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        if (mounted) {
          setUser(userData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to get user data:', err);
        if (mounted) {
          authService.logout();
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
