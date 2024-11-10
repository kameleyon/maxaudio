import { useState, useEffect } from 'react'
import { CreditCard, Download, Loader2, AlertCircle } from 'lucide-react'
import { stripeService } from '../../services/stripe.service'
import { useUser } from '@clerk/clerk-react'
import { useToastHelpers } from '../../contexts/ToastContext'

interface PaymentMethod {
  id: string
  card: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  isDefault: boolean
}

interface Invoice {
  id: string
  number: string
  date: number
  amount: number
  status: string
  url: string
}

interface UpcomingPayment {
  amount: number
  dueDate: number
}

export function BillingPanel() {
  const { user } = useUser()
  const toast = useToastHelpers()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [upcomingPayment, setUpcomingPayment] = useState<UpcomingPayment | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [user])

  const loadBillingData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Get customer ID from user metadata
      const customerId = user.publicMetadata.stripeCustomerId as string
      if (!customerId) {
        throw new Error('No Stripe customer ID found')
      }

      // Load payment methods
      const methods = await stripeService.getPaymentMethods(customerId)
      setPaymentMethods(methods)

      // Load subscription details
      const subscriptionId = user.publicMetadata.subscriptionId as string
      if (subscriptionId) {
        // Get upcoming invoice
        const upcoming = await stripeService.getUpcomingInvoice(subscriptionId)
        setUpcomingPayment({
          amount: upcoming.amount_due,
          dueDate: upcoming.next_payment_attempt
        })
      }

      // Load invoice history
      const response = await stripeService.getSubscription(subscriptionId)
      setInvoices(response.invoices.data.map((invoice: any) => ({
        id: invoice.id,
        number: invoice.number,
        date: invoice.created,
        amount: invoice.amount_paid,
        status: invoice.status,
        url: invoice.hosted_invoice_url
      })))

    } catch (err) {
      console.error('Failed to load billing data:', err)
      setError('Failed to load billing information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePaymentMethod = async () => {
    if (!user) return

    try {
      setIsUpdating(true)
      const customerId = user.publicMetadata.stripeCustomerId as string
      const returnUrl = `${window.location.origin}/settings?tab=billing`
      
      await stripeService.redirectToPortal({
        customerId,
        returnUrl
      })
    } catch (err) {
      console.error('Failed to update payment method:', err)
      toast.error('Failed to open payment method update form')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100) // Stripe amounts are in cents
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    )
  }

  const defaultPaymentMethod = paymentMethods.find(method => method.isDefault)

  return (
    <div className="space-y-8">
      {/* Payment Method */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
        {defaultPaymentMethod ? (
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-4">
              <CreditCard className="w-6 h-6 text-white/60" />
              <div>
                <p className="font-medium">
                  {defaultPaymentMethod.card.brand.toUpperCase()} •••• {defaultPaymentMethod.card.last4}
                </p>
                <p className="text-sm text-white/60">
                  Expires {defaultPaymentMethod.card.expMonth.toString().padStart(2, '0')}/
                  {defaultPaymentMethod.card.expYear.toString().slice(-2)}
                </p>
              </div>
            </div>
            <button
              onClick={handleUpdatePaymentMethod}
              disabled={isUpdating}
              className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Update'
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-white/60">
            No payment method on file
          </div>
        )}
      </div>

      {/* Next Payment */}
      {upcomingPayment && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Next Payment</h2>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white/60">Amount due</p>
                <p className="text-2xl font-bold">{formatAmount(upcomingPayment.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Due date</p>
                <p className="font-medium">{formatDate(upcomingPayment.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="bg-white/5 rounded-lg border border-white/10">
          <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-4 p-4 border-b border-white/10 text-sm text-white/60">
            <div>Date</div>
            <div>Amount</div>
            <div>Status</div>
            <div></div>
          </div>
          <div className="divide-y divide-white/10">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid grid-cols-[1fr,1fr,1fr,auto] gap-4 p-4 items-center"
                >
                  <div>{formatDate(invoice.date)}</div>
                  <div>{formatAmount(invoice.amount)}</div>
                  <div>
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      invoice.status === 'paid'
                        ? 'bg-green-500/20 text-green-500'
                        : invoice.status === 'open'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <a
                    href={invoice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Download Invoice"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-white/60">
                No payment history available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
