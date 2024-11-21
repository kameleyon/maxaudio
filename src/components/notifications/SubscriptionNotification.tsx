import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';

interface NotificationProps {
  type: 'upgrade' | 'limit';
  onClose: () => void;
}

export function SubscriptionNotification({ type, onClose }: NotificationProps) {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add slight delay for animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  const getContent = () => {
    if (type === 'upgrade') {
      return {
        title: 'Upgrade Your Experience',
        message: 'Get access to advanced features and higher usage limits with our Pro plan.',
        buttonText: 'View Plans'
      };
    } else {
      return {
        title: 'Usage Limit Reached',
        message: 'You\'ve reached your monthly usage limit. Upgrade now to continue using AudioMax.',
        buttonText: 'Buy More Credits'
      };
    }
  };

  const content = getContent();

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm w-full transition-opacity duration-300 z-50 
        ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-white/10 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
          <p className="text-white/60">{content.message}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            Later
          </button>
          <button
            onClick={() => {
              // Navigate to pricing page or show upgrade modal
              window.location.href = '/settings#subscription';
              handleClose();
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          >
            {content.buttonText}
          </button>
        </div>

        {/* Usage Progress (only for limit notification) */}
        {type === 'limit' && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/60 mb-1">
              <span>Monthly Usage</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
