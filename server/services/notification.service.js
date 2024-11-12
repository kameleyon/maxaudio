const User = require('../models/user.model');

class NotificationService {
  /**
   * Send subscription status notification
   */
  async sendSubscriptionNotification(userId, type, data) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.preferences.notifications.email) return;

      let message = '';
      let subject = '';

      switch (type) {
        case 'subscription_created':
          subject = 'Welcome to MaxAudio Pro!';
          message = `Your subscription has been activated. You now have access to all premium features.
                    Plan: ${data.planName}
                    Next billing date: ${new Date(data.currentPeriodEnd).toLocaleDateString()}`;
          break;

        case 'subscription_updated':
          subject = 'Your MaxAudio Subscription Has Been Updated';
          message = `Your subscription has been updated to ${data.planName}.
                    New features will be available immediately.
                    Next billing date: ${new Date(data.currentPeriodEnd).toLocaleDateString()}`;
          break;

        case 'subscription_canceled':
          subject = 'Your MaxAudio Subscription Has Been Canceled';
          message = `Your subscription has been canceled and will end on ${new Date(data.endDate).toLocaleDateString()}.
                    You can continue using premium features until then.
                    Reactivate anytime to keep your premium benefits.`;
          break;

        case 'payment_succeeded':
          subject = 'Payment Successful';
          message = `We've received your payment of ${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}.
                    Your invoice is available at: ${data.hostedUrl}`;
          break;

        case 'payment_failed':
          subject = 'Payment Failed';
          message = `We were unable to process your payment.
                    Please update your payment method to avoid service interruption.
                    Update payment method here: ${process.env.CLIENT_URL}/settings`;
          break;

        case 'trial_ending':
          subject = 'Your MaxAudio Trial Is Ending Soon';
          message = `Your trial period will end in 3 days.
                    Subscribe now to keep your premium features.
                    Choose your plan here: ${process.env.CLIENT_URL}/settings`;
          break;

        case 'usage_limit':
          subject = 'Usage Limit Warning';
          message = `You're approaching your ${data.type} limit.
                    Current usage: ${data.current}/${data.limit}
                    Upgrade your plan for higher limits: ${process.env.CLIENT_URL}/settings`;
          break;
      }

      // Send email notification
      await this.sendEmail(user.email, subject, message);

      // Send push notification if enabled
      if (user.preferences.notifications.push) {
        await this.sendPushNotification(user.id, subject, message);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(email, subject, message) {
    try {
      // TODO: Implement email sending using your preferred email service
      // Example: SendGrid, AWS SES, etc.
      console.log('Sending email:', { email, subject, message });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId, title, message) {
    try {
      // TODO: Implement push notifications using your preferred service
      // Example: Firebase Cloud Messaging, OneSignal, etc.
      console.log('Sending push notification:', { userId, title, message });
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send usage limit warning
   */
  async sendUsageLimitWarning(userId, type, current, limit) {
    const warningThreshold = 0.9; // 90%
    const usage = current / limit;

    if (usage >= warningThreshold) {
      await this.sendSubscriptionNotification(userId, 'usage_limit', {
        type,
        current,
        limit
      });
    }
  }

  /**
   * Send trial ending notification
   */
  async sendTrialEndingNotification(userId, trialEndDate) {
    const daysUntilEnd = Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24));

    if (daysUntilEnd === 3) {
      await this.sendSubscriptionNotification(userId, 'trial_ending', {
        endDate: trialEndDate
      });
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { 'preferences.notifications': preferences }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(userId) {
    try {
      const user = await User.findById(userId);
      return user.preferences.notifications;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
