import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock Clerk hooks
jest.mock('@clerk/clerk-react', () => ({
  useUser: jest.fn()
}))

const mockUseUser = useUser as jest.Mock

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>

  beforeEach(() => {
    // Reset mock before each test
    mockUseUser.mockReset()
  })

  it('shows nothing when clerk is not loaded', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: false
    })

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('redirects to home when user is not signed in', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false
    })

    const { container } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          } />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(container).toHaveTextContent('Home Page')
  })

  it('renders protected content for authenticated users', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
