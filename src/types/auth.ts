export interface GoogleAuthResponse {
  authenticated: boolean;
  message: string;
  error?: {
    message: string;
    details?: string;
  };
}

export interface AuthState {
  isChecking: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
