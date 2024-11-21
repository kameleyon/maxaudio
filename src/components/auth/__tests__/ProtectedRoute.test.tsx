import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../../contexts/AuthContext';
import { ProtectedRoute } from '../ProtectedRoute';

describe('ProtectedRoute', () => {
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

  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    const loadingContext = {
      ...mockAuthContext,
      loading: true,
      isLoading: true,
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={loadingContext}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children for authenticated user', () => {
    const authenticatedContext = {
      ...mockAuthContext,
      isAuthenticated: true,
      loading: false,
      isLoading: false,
      token: 'mock-token',
      error: null,
      getToken: () => 'mock-token',
      user: {
        id: '123',
        email: 'user@example.com',
        username: 'user',
        name: 'Regular User',
        role: 'user',
        preferences: {
          theme: 'light' as const,
          emailNotifications: true,
          language: 'en',
        },
      },
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={authenticatedContext}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
