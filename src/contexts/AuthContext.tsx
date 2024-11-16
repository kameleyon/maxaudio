import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  stripeCustomerId?: string;
  subscription?: {
    id: string;
    status: string;
    plan: string;
    currentPeriodEnd: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    language: string;
  };
  metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { email: string; password: string; username: string }) => Promise<void>;
  getToken: () => string | null;
}

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  getToken: () => null,
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentToken = authService.getToken();
        if (currentToken) {
          const userData = await authService.validateToken(currentToken);
          setUser(userData);
          setToken(currentToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout request fails
      setUser(null);
      setToken(null);
    }
  };

  const register = async (data: { email: string; password: string; username: string }) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const getToken = () => token;

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    token,
    login,
    logout,
    register,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
