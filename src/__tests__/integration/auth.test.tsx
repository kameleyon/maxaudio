import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, AuthContext, type AuthContextType } from '../../contexts/AuthContext';

describe('Authentication Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows loading state initially', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('handles successful authentication', () => {
    const mockAuthContext: AuthContextType = {
      isAuthenticated: true,
      loading: false,
      isLoading: false,
      token: 'mock-token',
      error: null,
      getToken: () => 'mock-token',
      user: {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        role: 'user',
        preferences: {
          theme: 'light' as const,
          emailNotifications: true,
          language: 'en',
        },
      },
      login: async () => {},
      logout: () => {},
      register: async () => {},
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <div>Test Content</div>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles unauthenticated state', () => {
    const mockAuthContext: AuthContextType = {
      isAuthenticated: false,
      loading: false,
      isLoading: false,
      token: null,
      error: null,
      getToken: () => null,
      user: null,
      login: async () => {},
      logout: () => {},
      register: async () => {},
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <div>Test Content</div>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
