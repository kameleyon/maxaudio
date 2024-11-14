import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../services/auth.service';

export function WelcomeModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser() as { user: User | null };
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate('/studio');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 rounded-lg max-w-xl w-full mx-4 border border-white/10 shadow-xl">
        {/* Welcome Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">
            HI {user?.username?.toUpperCase()}
          </h2>
          <p className="text-white/80 text-lg mb-6">
            I am so glad to have you here, I am looking forward to see what is on your mind and translate it into reality to share it with the world.
          </p>
          <p className="text-white/80 text-lg mb-6">
            let's check your creator potential; your current subscription is as follow:
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white">BASIC FREE</h3>
          </div>
          <ul className="space-y-2 ml-2">
            <li className="text-white/80">• 100,000 tokens per month</li>
            <li className="text-white/80">• Up to 3 voice clones</li>
            <li className="text-white/80">• Standard support</li>
            <li className="text-white/80">• Basic analytics</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors text-white font-semibold text-lg w-full sm:w-auto"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
