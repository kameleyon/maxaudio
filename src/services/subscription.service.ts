import axios from 'axios'
import type { SubscriptionTier } from '../config/subscription-tiers'

export interface UsageStats {
  charactersUsed: number
  charactersLimit: number
  voiceClonesUsed: number
  voiceClonesLimit: number
  requestsThisMinute: number
  requestsLimit: number
}

export interface SubscriptionDetails {
  currentTier: string
  billingCycle: 'monthly' | 'yearly'
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  usage: UsageStats
}

class SubscriptionService {
  private baseUrl = '/api/subscription'

  async getCurrentSubscription(): Promise<SubscriptionDetails> {
    try {
      const response = await axios.get(`${this.baseUrl}/current`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      throw new Error('Failed to fetch subscription details')
    }
  }

  async getUsageStats(): Promise<UsageStats> {
    try {
      const response = await axios.get(`${this.baseUrl}/usage`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch usage stats:', error)
      throw new Error('Failed to fetch usage statistics')
    }
  }

  async changePlan(params: {
    newTierId: string
    billingCycle: 'monthly' | 'yearly'
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/change-plan`, params)
      return response.data
    } catch (error) {
      console.error('Failed to change subscription plan:', error)
      throw new Error('Failed to change subscription plan')
    }
  }

  async cancelSubscription(cancelAtPeriodEnd: boolean = true): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/cancel`, { cancelAtPeriodEnd })
      return response.data
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  async reactivateSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/reactivate`)
      return response.data
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
      throw new Error('Failed to reactivate subscription')
    }
  }

  async updatePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/update-payment`, { paymentMethodId })
      return response.data
    } catch (error) {
      console.error('Failed to update payment method:', error)
      throw new Error('Failed to update payment method')
    }
  }

  async getInvoices(params: { limit?: number; starting_after?: string } = {}): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/invoices`, { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      throw new Error('Failed to fetch invoices')
    }
  }

  async createCheckoutSession(params: {
    tierId: string
    billingCycle: 'monthly' | 'yearly'
  }): Promise<{ sessionUrl: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/create-checkout`, params)
      return response.data
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  async createPortalSession(): Promise<{ url: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/create-portal`)
      return response.data
    } catch (error) {
      console.error('Failed to create portal session:', error)
      throw new Error('Failed to create customer portal session')
    }
  }

  // Webhook handling utilities
  async validateWebhookSignature(signature: string, payload: any): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/validate-webhook`, {
        signature,
        payload
      })
      return response.data.valid
    } catch (error) {
      console.error('Failed to validate webhook:', error)
      return false
    }
  }

  // Usage tracking
  async trackUsage(params: {
    characters: number
    requestCount: number
    voiceCloneCount?: number
  }): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/track-usage`, params)
    } catch (error) {
      console.error('Failed to track usage:', error)
      throw new Error('Failed to track usage')
    }
  }

  // Rate limiting check
  async checkRateLimit(): Promise<{
    allowed: boolean
    remaining: number
    resetTime: string
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/rate-limit`)
      return response.data
    } catch (error) {
      console.error('Failed to check rate limit:', error)
      throw new Error('Failed to check rate limit')
    }
  }
}

export const subscriptionService = new SubscriptionService()
