import { loadStripe, Stripe } from '@stripe/stripe-js';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'open' | 'paid' | 'void' | 'uncollectible';
  created: number;
  hostedInvoiceUrl: string;
  hostedUrl: string;
  pdfUrl: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

class PaymentService {
  private stripe: Promise<Stripe | null>;
  private baseUrl: string;

  constructor() {
    this.stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  async createCheckoutSession(priceId: string): Promise<{ sessionId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createPortalSession(customerId: string): Promise<{ url: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/plans`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/payment-methods`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/invoices`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.stripe;
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  }

  async updatePaymentMethod(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/create-setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const { clientSecret } = await response.json();
      const stripe = await this.stripe;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.confirmCardSetup(clientSecret);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  async removePaymentMethod(methodId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/stripe/payment-methods/${methodId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/stripe/payment-methods/${methodId}/default`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  async handleCheckoutSuccess(sessionId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/stripe/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Error handling checkout success:', error);
      throw error;
    }
  }

  async cancelSubscription(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/stripe/cancel-subscription`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async resumeSubscription(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/stripe/resume-subscription`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }
}

export default new PaymentService();
