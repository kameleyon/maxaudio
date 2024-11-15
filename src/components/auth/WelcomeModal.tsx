import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function WelcomeModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();

  const navigate = useNavigate();

  const handleContinue = () => {
    localStorage.setItem('welcome_seen', 'true');
    onClose();
    navigate('/studio');
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-tr from-[#0e2c53] to-[#1c6f8275] p-6 rounded-lg max-w-4xl w-full mx-4 border border-white/10 shadow-xl">
        {/* Welcome Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Hello there {user?.username?.toUpperCase()}!
          </h2>
          <p className="text-white/80 text-lg mb-6">
            I am so glad to have you here, I am looking forward to see what is on your mind and translate it into reality to share it with the world.
          </p>
          <p className="text-white/80 text-lg mb-6">
            let's check your creator potential; your current subscription is as follow:
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Free Trial */}
          <div className="bg-white/5 rounded-lg p-4 relative border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Free Trial</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-2">$0/month</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• 3 days full Professional access</li>
              <li>• 3 free generations (3 min each)</li>
              <li>• 200,000 characters/month after trial</li>
              <li>• Standard voices only</li>
              <li>• Standard support</li>
            </ul>
            <div className="mt-4 text-xs text-white/60">
              Token Purchase: $9.99 per 500,000 characters
            </div>
          </div>

          {/* Professional */}
          <div className="bg-white/5 rounded-lg p-4 relative border border-white/10">
            <div className="absolute -top-2 -right-2">
              <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                UPDATE NOW!
              </button>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
            <div className="text-2xl font-bold text-white mb-2">$39.99/month</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• WaveNet & Neural2 voices</li>
              <li>• 3 custom voice clones</li>
              <li>• 1M characters/month</li>
              <li>• 5 simultaneous generations</li>
              <li>• Standard support</li>
            </ul>
            <div className="mt-4 text-xs text-white/60">
              Token Purchase: $4.99 per 500,000 characters
            </div>
          </div>

          {/* Premium */}
          <div className="bg-white/5 rounded-lg p-4 relative border border-white/10">
            <div className="absolute -top-2 -right-2">
              <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                UPDATE NOW!
              </button>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Premium</h3>
            <div className="text-2xl font-bold text-white mb-2">$79.99/month</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• All voice collections</li>
              <li>• 5 custom voice clones</li>
              <li>• 2M characters/month</li>
              <li>• 10 simultaneous generations</li>
              <li>• Priority 24/7 support</li>
            </ul>
            <div className="mt-4 text-xs text-white/60">
              Token Purchase: $4.99 per 500,000 characters
            </div>
          </div>

          {/* Enterprise */}
          <div className="bg-white/5 rounded-lg p-4 relative border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
            <div className="text-2xl font-bold text-white mb-2">$149.99/month</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• All voices + exclusive access</li>
              <li>• 10 custom voice clones</li>
              <li>• 5M characters/month</li>
              <li>• 20 simultaneous generations</li>
              <li>• Dedicated account manager</li>
            </ul>
            <div className="mt-4 text-xs text-white/60">
              Token Purchase: $4.99 per 1M characters
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors text-white font-semibold text-lg w-full sm:w-auto uppercase"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
