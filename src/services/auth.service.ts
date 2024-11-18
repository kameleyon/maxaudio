import api from './api';
import { User } from '../contexts/AuthContext';
import { AxiosError } from 'axios';

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
      const { data } = await api.post<AuthResponse>('/auth/login', { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      this.setToken(data.token);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Login error:', {
        message: axiosError.message,
        code: axiosError.code,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });

      // Provide more specific error messages
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else if (axiosError.response?.status === 401) {
        throw new Error('Invalid email or password.');
      } else if (axiosError.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else {
        throw new Error('Login failed. Please try again later.');
      }
    }
  }

  async register(userData: { email: string; password: string; username: string }): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      this.setToken(data.token);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Registration error:', axiosError);
      
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else if (axiosError.response?.status === 409) {
        throw new Error('Email or username already exists.');
      } else {
        throw new Error('Registration failed. Please try again later.');
      }
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const { data } = await api.get<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Token validation error:', axiosError);
      this.logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const { data } = await api.post<{ token: string }>('/auth/refresh', {}, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      this.setToken(data.token);
      return data.token;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Token refresh error:', axiosError);
      this.logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const { data } = await api.get<{ available: boolean }>(`/auth/check-username/${username}`, {
        timeout: 5000
      });
      return data.available;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Username availability check error:', axiosError);
      throw new Error('Unable to check username availability. Please try again.');
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const { data } = await api.get<{ available: boolean }>(`/auth/check-email/${email}`, {
        timeout: 5000
      });
      return data.available;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Email availability check error:', axiosError);
      throw new Error('Unable to check email availability. Please try again.');
    }
  }

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<User> {
    try {
      const { data } = await api.patch<User>('/auth/preferences', preferences, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Update preferences error:', axiosError);
      throw new Error('Unable to update preferences. Please try again.');
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
