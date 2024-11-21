import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { useUsageStats } from '../hooks/useUsageStats';

interface NotificationContextType {
  showWelcomeModal: boolean;
  showUpgradeNotification: boolean;
  showLimitNotification: boolean;
  dismissWelcomeModal: () => void;
  dismissUpgradeNotification: () => void;
  dismissLimitNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const WELCOME_MODAL_KEY = 'welcome_modal_shown';
const UPGRADE_NOTIFICATION_KEY = 'last_upgrade_notification';
const LIMIT_NOTIFICATION_KEY = 'last_limit_notification';

// How often to show upgrade notification (7 days)
const UPGRADE_NOTIFICATION_INTERVAL = 7 * 24 * 60 * 60 * 1000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { stats } = useUsageStats();
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);
  const [showLimitNotification, setShowLimitNotification] = useState(false);

  // Check if user is new (welcome modal)
  useEffect(() => {
    if (user && !localStorage.getItem(WELCOME_MODAL_KEY)) {
      setShowWelcomeModal(true);
    }
  }, [user]);

  // Check if free user should see upgrade notification
  useEffect(() => {
    if (user && user.subscription?.plan === 'free') {
      const lastNotification = localStorage.getItem(UPGRADE_NOTIFICATION_KEY);
      const lastNotificationTime = lastNotification ? parseInt(lastNotification) : 0;
      
      if (Date.now() - lastNotificationTime > UPGRADE_NOTIFICATION_INTERVAL) {
        setShowUpgradeNotification(true);
      }
    }
  }, [user]);

  // Check usage limits
  useEffect(() => {
    if (stats && user) {
      const isNearLimit = stats.current.charactersUsed >= stats.limits.charactersPerMonth * 0.9;
      const lastNotification = localStorage.getItem(LIMIT_NOTIFICATION_KEY);
      const lastNotificationTime = lastNotification ? parseInt(lastNotification) : 0;
      
      // Show notification if near limit and hasn't been shown in last 24 hours
      if (isNearLimit && Date.now() - lastNotificationTime > 24 * 60 * 60 * 1000) {
        setShowLimitNotification(true);
      }
    }
  }, [stats, user]);

  const dismissWelcomeModal = () => {
    localStorage.setItem(WELCOME_MODAL_KEY, 'true');
    setShowWelcomeModal(false);
  };

  const dismissUpgradeNotification = () => {
    localStorage.setItem(UPGRADE_NOTIFICATION_KEY, Date.now().toString());
    setShowUpgradeNotification(false);
  };

  const dismissLimitNotification = () => {
    localStorage.setItem(LIMIT_NOTIFICATION_KEY, Date.now().toString());
    setShowLimitNotification(false);
  };

  const value = {
    showWelcomeModal,
    showUpgradeNotification,
    showLimitNotification,
    dismissWelcomeModal,
    dismissUpgradeNotification,
    dismissLimitNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
