import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

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
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { email: string; password: string; username: string; name: string }) => Promise<void>;
  getToken: () => string | null;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  isLoading: true,
  isAuthenticated: false,
  token: null,
  error: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  getToken: () => null
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.getToken()) {
          const userData = await authService.validateToken();
          if (userData && typeof userData === 'object') {
            setUser(userData as unknown as User);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Session expired. Please login again.');
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      if (response && response.user && response.token) {
        setUser(response.user as unknown as User);
        setToken(response.token);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; username: string; name: string }) => {
    try {
      setError(null);
      const response = await authService.register(data);
      if (response && response.user && response.token) {
        setUser(response.user as unknown as User);
        setToken(response.token);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const getToken = () => token;

  const value: AuthContextType = {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    token,
    error,
    login,
    logout,
    register,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
