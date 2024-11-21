import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import axios from 'axios';

// Initialize Stripe with HTTPS check
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
  stripeAccount: import.meta.env.VITE_STRIPE_ACCOUNT_ID,
  apiVersion: '2023-10-16',
  locale: 'en',
});

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  clientReferenceId?: string;
}

interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

class StripeService {
  private baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/stripe` : '/api/stripe';

  // Create a checkout session for new subscriptions
  async createCheckoutSession(params: CreateCheckoutSessionParams, token: string): Promise<{ sessionId: string; url: string }> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.post(`${this.baseUrl}/create-checkout-session`, params, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  // Create a portal session for managing existing subscriptions
  async createPortalSession(params: CreatePortalSessionParams, token: string): Promise<{ url: string }> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.post(`${this.baseUrl}/create-portal-session`, params, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to create portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  // Get Stripe instance
  async getStripe(): Promise<Stripe | null> {
    // Check if we're in a secure context
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('Stripe requires HTTPS in production. Current protocol:', window.location.protocol);
    }
    return await stripePromise;
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(params: CreateCheckoutSessionParams, token: string): Promise<void> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) throw new Error('Stripe not initialized');

      const { sessionId, url } = await this.createCheckoutSession(params, token);

      // If we have a direct URL, use it (more reliable)
      if (url) {
        window.location.href = url;
        return;
      }

      // Fallback to redirectToCheckout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to redirect to checkout:', error);
      throw error;
    }
  }

  // Redirect to Customer Portal
  async redirectToPortal(params: CreatePortalSessionParams, token: string): Promise<void> {
    try {
      const { url } = await this.createPortalSession(params, token);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to redirect to portal:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, params: {
    priceId: string;
    quantity?: number;
  }, token: string): Promise<void> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      await axios.post(`${this.baseUrl}/update-subscription`, {
        subscriptionId,
        ...params
      }, { headers });
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, token: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      await axios.post(`${this.baseUrl}/cancel-subscription`, {
        subscriptionId,
        cancelAtPeriodEnd
      }, { headers });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Resume subscription
  async resumeSubscription(subscriptionId: string, token: string): Promise<void> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      await axios.post(`${this.baseUrl}/resume-subscription`, {
        subscriptionId
      }, { headers });
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      throw new Error('Failed to resume subscription');
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string, token: string): Promise<any> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.get(`${this.baseUrl}/subscription/${subscriptionId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      throw new Error('Failed to get subscription details');
    }
  }

  // Get customer's payment methods
  async getPaymentMethods(customerId: string, token: string): Promise<any[]> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.get(`${this.baseUrl}/payment-methods/${customerId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  // Update default payment method
  async updateDefaultPaymentMethod(customerId: string, paymentMethodId: string, token: string): Promise<void> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      await axios.post(`${this.baseUrl}/update-payment-method`, {
        customerId,
        paymentMethodId
      }, { headers });
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw new Error('Failed to update payment method');
    }
  }

  // Get upcoming invoice
  async getUpcomingInvoice(subscriptionId: string, token: string, newPriceId?: string): Promise<any> {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.get(`${this.baseUrl}/upcoming-invoice`, {
        headers,
        params: {
          subscriptionId,
          newPriceId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get upcoming invoice:', error);
      throw new Error('Failed to get upcoming invoice');
    }
  }
}

export const stripeService = new StripeService();
