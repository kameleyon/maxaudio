import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CreatePortalSessionResponse {
  url: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  created: Date;
  hostedUrl: string;
  pdfUrl: string;
}

class PaymentService {
  private baseUrl = '/api/stripe';

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(priceId: string): Promise<CreateCheckoutSessionResponse> {
    try {
      const { data } = await axios.post(`${this.baseUrl}/create-checkout-session`, {
        priceId
      });

      // Validate response
      if (!data.sessionId || !data.url) {
        throw new Error('Invalid checkout session response');
      }

      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a billing portal session
   */
  async createPortalSession(customerId: string): Promise<CreatePortalSessionResponse> {
    try {
      const { data } = await axios.post(`${this.baseUrl}/create-portal-session`, {
        customerId
      });

      // Validate response
      if (!data.url) {
        throw new Error('Invalid portal session response');
      }

      return data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw new Error('Failed to redirect to checkout');
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/plans`);
      return data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/payment-methods`);
      return data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  /**
   * Add payment method
   */
  async updatePaymentMethod(): Promise<void> {
    try {
      const { data: { clientSecret } } = await axios.post(`${this.baseUrl}/create-setup-intent`);
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.confirmCardSetup(clientSecret);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw new Error('Failed to update payment method');
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(methodId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/payment-methods/${methodId}`);
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw new Error('Failed to remove payment method');
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/payment-methods/${methodId}/default`);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  /**
   * Get invoices
   */
  async getInvoices(): Promise<Invoice[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/invoices`);
      return data.map((invoice: any) => ({
        ...invoice,
        created: new Date(invoice.created * 1000)
      }));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }
  }

  /**
   * Handle successful checkout
   */
  async handleCheckoutSuccess(sessionId: string): Promise<void> {
    try {
      // Verify the session and update user's subscription
      await axios.post(`${this.baseUrl}/verify-session`, {
        sessionId
      });

      // Refresh the page to update subscription status
      window.location.reload();
    } catch (error) {
      console.error('Error handling checkout success:', error);
      throw new Error('Failed to process successful checkout');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/cancel-subscription`);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/resume-subscription`);
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw new Error('Failed to resume subscription');
    }
  }
}

export const paymentService = new PaymentService();
