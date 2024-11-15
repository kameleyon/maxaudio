import axios, { AxiosError } from 'axios';
import api from './api';

interface UserPreferences {
  preferredLanguage?: string;
  emailNotifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  preferences?: UserPreferences;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

interface ApiError {
  error: string;
}

interface AvailabilityResponse {
  available: boolean;
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    // Try to get tokens from localStorage
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');

    // Set up axios interceptor for token refresh
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not a refresh token request
        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
          }

          try {
            const newToken = await this.refreshPromise;
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            originalRequest._retry = true;
            return api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout user
            this.logout();
            throw refreshError;
          } finally {
            this.refreshPromise = null;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await api.post<RefreshResponse>('/auth/refresh', {
        refreshToken: this.refreshToken
      });
      this.setTokens(response.data.token, response.data.refreshToken);
      return response.data.token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      this.setTokens(response.data.token, response.data.refreshToken);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to login');
      }
      throw new Error('Failed to login');
    }
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      this.setTokens(response.data.token, response.data.refreshToken);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to register');
      }
      throw new Error('Failed to register');
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await api.get<AvailabilityResponse>(`/auth/check-username/${username}`);
      return response.data.available;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await api.get<AvailabilityResponse>(`/auth/check-email/${email}`);
      return response.data.available;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('welcome_seen');
    this.token = null;
    this.refreshToken = null;

    // Call logout endpoint to invalidate refresh token
    api.post('/auth/logout').catch(console.error);
  }

  isAuthenticated(): boolean {
    // Check both localStorage and instance variables
    const localToken = localStorage.getItem('token');
    const localRefreshToken = localStorage.getItem('refreshToken');
    
    if (localToken && localRefreshToken && !this.token) {
      this.token = localToken;
      this.refreshToken = localRefreshToken;
    }
    
    return !!this.token && !!this.refreshToken;
  }

  getToken(): string | null {
    // Ensure token is in sync with localStorage
    const localToken = localStorage.getItem('token');
    if (localToken && !this.token) {
      this.token = localToken;
    }
    return this.token;
  }

  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    this.token = token;
    this.refreshToken = refreshToken;
  }

  async getCurrentUser(): Promise<User> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to get user');
      }
      throw new Error('Failed to get user');
    }
  }

  async updatePreferences(preferences: UserPreferences): Promise<User> {
    try {
      const response = await api.put<User>('/user/preferences', { preferences });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to update preferences');
      }
      throw new Error('Failed to update preferences');
    }
  }
}

export const authService = new AuthService();
export type { RegisterData, User, UserPreferences };
