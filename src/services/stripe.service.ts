import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import axios from 'axios'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface CreateCheckoutSessionParams {
  priceId: string
  successUrl: string
  cancelUrl: string
  customerId?: string
  clientReferenceId?: string
}

interface CreatePortalSessionParams {
  customerId: string
  returnUrl: string
}

class StripeService {
  private baseUrl = '/api/stripe'

  // Get Stripe instance
  async getStripe(): Promise<Stripe | null> {
    return await stripePromise
  }

  // Create a checkout session for new subscriptions
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ sessionId: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/create-checkout-session`, params)
      return response.data
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  // Create a portal session for managing existing subscriptions
  async createPortalSession(params: CreatePortalSessionParams): Promise<{ url: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/create-portal-session`, params)
      return response.data
    } catch (error) {
      console.error('Failed to create portal session:', error)
      throw new Error('Failed to create portal session')
    }
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(params: CreateCheckoutSessionParams): Promise<void> {
    try {
      const stripe = await this.getStripe()
      if (!stripe) throw new Error('Stripe not initialized')

      const { sessionId } = await this.createCheckoutSession(params)
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to redirect to checkout:', error)
      throw error
    }
  }

  // Redirect to Customer Portal
  async redirectToPortal(params: CreatePortalSessionParams): Promise<void> {
    try {
      const { url } = await this.createPortalSession(params)
      window.location.href = url
    } catch (error) {
      console.error('Failed to redirect to portal:', error)
      throw error
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, params: {
    priceId: string
    quantity?: number
  }): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/update-subscription`, {
        subscriptionId,
        ...params
      })
    } catch (error) {
      console.error('Failed to update subscription:', error)
      throw new Error('Failed to update subscription')
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/cancel-subscription`, {
        subscriptionId,
        cancelAtPeriodEnd
      })
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  // Resume subscription
  async resumeSubscription(subscriptionId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/resume-subscription`, {
        subscriptionId
      })
    } catch (error) {
      console.error('Failed to resume subscription:', error)
      throw new Error('Failed to resume subscription')
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/subscription/${subscriptionId}`)
      return response.data
    } catch (error) {
      console.error('Failed to get subscription:', error)
      throw new Error('Failed to get subscription details')
    }
  }

  // Get customer's payment methods
  async getPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/payment-methods/${customerId}`)
      return response.data
    } catch (error) {
      console.error('Failed to get payment methods:', error)
      throw new Error('Failed to get payment methods')
    }
  }

  // Update default payment method
  async updateDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/update-payment-method`, {
        customerId,
        paymentMethodId
      })
    } catch (error) {
      console.error('Failed to update payment method:', error)
      throw new Error('Failed to update payment method')
    }
  }

  // Get upcoming invoice
  async getUpcomingInvoice(subscriptionId: string, newPriceId?: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/upcoming-invoice`, {
        params: {
          subscriptionId,
          newPriceId
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get upcoming invoice:', error)
      throw new Error('Failed to get upcoming invoice')
    }
  }
}

export const stripeService = new StripeService()
