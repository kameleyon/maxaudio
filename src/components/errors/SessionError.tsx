import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function SessionError() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/5 rounded-lg border border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-center mb-2">Session Error</h2>
          <p className="text-white/60 text-center">
            There was an issue with your session. Please sign in again.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  );
}
