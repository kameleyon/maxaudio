import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
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

  constructor() {
    // Try to get token from localStorage
    this.token = localStorage.getItem('token');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', { email, password });
      this.setToken(response.data.token);
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
      const response = await axios.post<RegisterResponse>('/api/auth/register', data);
      this.setToken(response.data.token);
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
      const response = await axios.get<AvailabilityResponse>(`/api/auth/check-username/${username}`);
      return response.data.available;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await axios.get<AvailabilityResponse>(`/api/auth/check-email/${email}`);
      return response.data.available;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('welcome_seen');
    this.token = null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
    this.token = token;
  }

  // Add auth header to requests
  getAuthHeader(): { Authorization: string } | {} {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get<User>('/api/auth/me', {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        throw new Error(apiError.error || 'Failed to get user');
      }
      throw new Error('Failed to get user');
    }
  }
}

export const authService = new AuthService();
export type { RegisterData, User };
