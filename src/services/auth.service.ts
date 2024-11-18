import api from './api';
import { User } from '../contexts/AuthContext';

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: { email: string; password: string; username: string }): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', userData);
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const { data } = await api.get<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const { data } = await api.post<{ token: string }>('/auth/refresh');
      this.setToken(data.token);
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const { data } = await api.get<{ available: boolean }>(`/auth/check-username/${username}`);
      return data.available;
    } catch (error) {
      console.error('Username availability check error:', error);
      throw error;
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const { data } = await api.get<{ available: boolean }>(`/auth/check-email/${email}`);
      return data.available;
    } catch (error) {
      console.error('Email availability check error:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<User> {
    try {
      const { data } = await api.patch<User>('/auth/preferences', preferences);
      return data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  logout(): void {
    this.removeToken();
    // Clear any other auth-related data from localStorage if needed
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
