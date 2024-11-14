import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/payment.service';
import type { SubscriptionPlan } from '../../services/payment.service';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  created: Date;
  hostedUrl: string;
  pdfUrl: string;
}

interface BillingPanelProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function BillingPanel({ onSuccess, onError }: BillingPanelProps) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    if (user) {
      loadPlans();
      loadCurrentPlan();
      loadPaymentMethods();
      loadInvoices();
    }
  }, [user]);

  useEffect(() => {
    loadPlans();
  }, [billingInterval]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plans = await paymentService.getSubscriptionPlans();
      setPlans(plans.filter(plan => plan.interval === billingInterval));
    } catch (err) {
      const message = 'Failed to load subscription plans';
      setError(message);
      onError?.(message);
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      // Get plan based on user's role
      const planId = user?.role === 'admin' ? 'premium' : 'free';
      setCurrentPlan(planId);
    } catch (err) {
      console.error('Error loading current plan:', err);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const loadInvoices = async () => {
    try {
      const invoices = await paymentService.getInvoices();
      setInvoices(invoices);
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
  };

  const handleSetupBilling = async (priceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { sessionId } = await paymentService.createCheckoutSession(priceId);
      await paymentService.redirectToCheckout(sessionId);
      onSuccess?.();
    } catch (err) {
      const message = 'Failed to setup billing';
      setError(message);
      onError?.(message);
      console.error('Error setting up billing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const { url } = await paymentService.createPortalSession(user.id);
      window.location.href = url;
    } catch (err) {
      const message = 'Failed to open billing portal';
      setError(message);
      onError?.(message);
      console.error('Error opening billing portal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setLoading(true);
      setError(null);
      await paymentService.updatePaymentMethod();
      await loadPaymentMethods();
      setShowAddCard(false);
      onSuccess?.();
    } catch (err) {
      const message = 'Failed to add payment method';
      setError(message);
      onError?.(message);
      console.error('Error adding payment method:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    try {
      setLoading(true);
      setError(null);
      await paymentService.removePaymentMethod(methodId);
      await loadPaymentMethods();
      onSuccess?.();
    } catch (err) {
      const message = 'Failed to remove payment method';
      setError(message);
      onError?.(message);
      console.error('Error removing payment method:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      setLoading(true);
      setError(null);
      await paymentService.setDefaultPaymentMethod(methodId);
      await loadPaymentMethods();
      onSuccess?.();
    } catch (err) {
      const message = 'Failed to set default payment method';
      setError(message);
      onError?.(message);
      console.error('Error setting default payment method:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Subscription Plans */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-4 py-2 rounded-lg ${
              billingInterval === 'month' ? 'bg-primary text-white' : 'bg-white/5'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-4 py-2 rounded-lg ${
              billingInterval === 'year' ? 'bg-primary text-white' : 'bg-white/5'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              Save 20%
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg border ${
                currentPlan === plan.id
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {currentPlan === plan.id && (
                  <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-white/60">/{billingInterval}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-white/80">
                    <svg
                      className="w-5 h-5 mr-2 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {currentPlan === plan.id ? (
                <button
                  onClick={handleManageBilling}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Manage Subscription
                </button>
              ) : (
                <button
                  onClick={() => handleSetupBilling(plan.priceId)}
                  className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 transition-colors"
                >
                  {currentPlan ? 'Change Plan' : 'Get Started'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Payment Methods</h2>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {method.brand === 'visa' && '💳'}
                  {method.brand === 'mastercard' && '💳'}
                  {method.brand === 'amex' && '💳'}
                </div>
                <div>
                  <div className="font-medium">
                    {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ****{method.last4}
                  </div>
                  <div className="text-sm text-white/60">
                    Expires {method.expMonth}/{method.expYear}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefaultPaymentMethod(method.id)}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    Make Default
                  </button>
                )}
                {method.isDefault && (
                  <span className="text-sm text-primary">Default</span>
                )}
                <button
                  onClick={() => handleRemovePaymentMethod(method.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowAddCard(true)}
            className="w-full px-4 py-2 rounded-lg border border-dashed border-white/20 hover:border-white/40 transition-colors"
          >
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Billing History</h2>

        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  ${invoice.amount / 100} {invoice.currency.toUpperCase()}
                </div>
                <div className="text-sm text-white/60">
                  {new Date(invoice.created).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    invoice.status === 'paid'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
            <div className="space-y-4">
              {/* Card input fields would go here */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
