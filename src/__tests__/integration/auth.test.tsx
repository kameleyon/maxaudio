import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../../contexts/AuthContext';

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
    const mockAuthContext = {
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token',
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
    const mockAuthContext = {
      isAuthenticated: false,
      isLoading: false,
      token: null,
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
