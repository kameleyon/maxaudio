import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { WelcomeModal } from './WelcomeModal';
import { Studio } from '../../pages/Studio';
import { useAuth } from '../../contexts/AuthContext';

export function NewUserRedirect() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Check if this is first time
  useEffect(() => {
    // For OAuth redirects, we need to wait for user to be loaded
    if (isLoading) return;

    const hasSeenWelcome = localStorage.getItem('welcome_seen');

    if (hasSeenWelcome) {
      setShowWelcome(false);
      setShouldRedirect(true);
    } else {
      // Show welcome modal for new users
      setShowWelcome(true);
      setShouldRedirect(false);
    }
  }, [isLoading, location]);

  const handleClose = () => {
    localStorage.setItem('welcome_seen', 'true');
    setShowWelcome(false);
    setShouldRedirect(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/studio" replace />;
  }

  return (
    <>
      {/* Show Studio page in background */}
      <div className={showWelcome ? 'filter blur-sm' : ''}>
        <Studio />
      </div>

      {/* Welcome Modal */}
      {showWelcome && user && <WelcomeModal onClose={handleClose} />}
    </>
  );
}
