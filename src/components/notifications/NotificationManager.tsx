import { useNotifications } from '../../contexts/NotificationContext';
import { WelcomeModal } from '../auth/WelcomeModal';
import { SubscriptionNotification } from './SubscriptionNotification';

export function NotificationManager() {
  const {
    showWelcomeModal,
    showUpgradeNotification,
    showLimitNotification,
    dismissWelcomeModal,
    dismissUpgradeNotification,
    dismissLimitNotification
  } = useNotifications();

  return (
    <>
      {/* Welcome Modal for new users */}
      {showWelcomeModal && (
        <WelcomeModal onClose={dismissWelcomeModal} />
      )}

      {/* Upgrade Notification for free users */}
      {showUpgradeNotification && (
        <SubscriptionNotification
          type="upgrade"
          onClose={dismissUpgradeNotification}
        />
      )}

      {/* Usage Limit Notification */}
      {showLimitNotification && (
        <SubscriptionNotification
          type="limit"
          onClose={dismissLimitNotification}
        />
      )}
    </>
  );
}
