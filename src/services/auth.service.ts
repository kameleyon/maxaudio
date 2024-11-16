import axios from 'axios';
import { User } from '../contexts/AuthContext';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  language: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/auth';
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: { email: string; password: string; username: string }): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/register`, data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const response = await axios.get(`${this.baseUrl}/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: UserPreferences): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('/api/auth/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/check-username/${username}`);
      return response.data.available;
    } catch (error) {
      console.error('Username check error:', error);
      throw error;
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/check-email/${email}`);
      return response.data.available;
    } catch (error) {
      console.error('Email check error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
