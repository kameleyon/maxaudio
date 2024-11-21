import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import paymentService, { type Invoice, type SubscriptionPlan } from '../../services/payment.service';

interface BillingPanelProps {
  onClose?: () => void;
}

export const BillingPanel: React.FC<BillingPanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [plansData, invoicesData] = await Promise.all([
          paymentService.getSubscriptionPlans(),
          paymentService.getInvoices()
        ]);
        setPlans(plansData);
        setInvoices(invoicesData);
      } catch (error) {
        setError('Failed to load billing information');
        console.error('Error loading billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    try {
      setError(null);
      const { sessionId } = await paymentService.createCheckoutSession(priceId);
      await paymentService.redirectToCheckout(sessionId);
    } catch (error) {
      setError('Failed to initiate subscription');
      console.error('Subscription error:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Subscription Plans
      </Typography>
      <Box display="flex" gap={2} mb={4}>
        {plans.map((plan) => (
          <Card key={plan.id} sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography variant="h6">{plan.name}</Typography>
              <Typography variant="body1">{plan.description}</Typography>
              <Typography variant="h4">
                ${plan.price}/{plan.interval}
              </Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubscribe(plan.priceId)}
                >
                  Subscribe
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Typography variant="h5" gutterBottom>
        Billing History
      </Typography>
      <Box>
        {invoices.map((invoice) => (
          <Card key={invoice.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1">
                Invoice #{invoice.id}
              </Typography>
              <Typography variant="body2">
                Amount: ${invoice.amount}
              </Typography>
              <Typography variant="body2">
                Status: {invoice.status}
              </Typography>
              <Typography variant="body2">
                Date: {new Date(invoice.created * 1000).toLocaleDateString()}
              </Typography>
              <Box mt={1}>
                <Button
                  variant="outlined"
                  size="small"
                  href={invoice.pdfUrl}
                  target="_blank"
                >
                  Download PDF
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
