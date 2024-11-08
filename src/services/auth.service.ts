import axios from 'axios';

export interface AuthResponse {
  authenticated: boolean;
  message: string;
  voicesAvailable?: number;
}

export async function checkGoogleAuth(): Promise<AuthResponse> {
  try {
    const response = await axios.get<AuthResponse>('/api/auth/google-token');
    return {
      authenticated: Boolean(response.data.authenticated),
      message: String(response.data.message),
      voicesAvailable: response.data.voicesAvailable ? Number(response.data.voicesAvailable) : undefined
    };
  } catch (error) {
    return {
      authenticated: false,
      message: error instanceof Error ? String(error.message) : 'Authentication failed'
    };
  }
}
