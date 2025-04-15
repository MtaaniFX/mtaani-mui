'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  Grid, 
  Alert, 
  AlertTitle,
  Snackbar,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import { Close as CloseIcon, Paid, CalendarToday, AccountBalance, ArrowForward } from '@mui/icons-material';
import { formatCurrency, formatDate } from '@/utils/formatters';
import PaymentSuccessView from './PaymentSuccessView';

export interface Investment {
  id: string;
  name: string;
  description: string;
  amount: number;
  term: string;
  expected_roi: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface Invoice {
  id: string;
  investment_id: string;
  user_id: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface InvoiceDetailsProps {
  invoice: Invoice;
  investment: Investment;
  hasInsufficientFunds: boolean;
  userBalance: number;
}

export default function InvoiceDetails({ 
  invoice, 
  investment, 
  hasInsufficientFunds,
  userBalance
}: InvoiceDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(hasInsufficientFunds);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/investments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          investmentId: investment.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process payment');
      }
      
      setPaymentSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the payment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAlertClose = () => {
    setShowAlert(false);
  };

  if (paymentSuccess) {
    return <PaymentSuccessView invoiceId={invoice.id} />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Page Header */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Investment Invoice
      </Typography>
      
      {/* Alert for insufficient funds */}
      {showAlert && (
        <Alert 
          severity="warning"
          sx={{ mb: 4 }}
          action={
            <>
              <Button 
                color="inherit" 
                size="small"
                href="/dashboard/deposits"
                target="_blank"
                startIcon={<AccountBalance />}
              >
                Make a Deposit
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleAlertClose}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </>
          }
        >
          <AlertTitle>Insufficient Funds</AlertTitle>
          Your current balance ({formatCurrency(userBalance)}) is lower than the invoice amount ({formatCurrency(invoice.amount)}). 
          Please make a deposit to proceed with this investment.
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Invoice Details */}
        <Grid item xs={12} md={7}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  Invoice #{invoice.id}
                </Typography>
                <Chip 
                  label={invoice.status.toUpperCase()} 
                  color={invoice.status === 'pending' ? 'warning' : 'success'} 
                  variant="outlined"
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(invoice.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Due Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    {formatDate(invoice.due_date)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 3 }}>Investment Details</Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>{investment.name}</Typography>
              <Typography variant="body2" paragraph>
                {investment.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Term</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{investment.term}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Expected ROI</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{investment.expected_roi}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{investment.status}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Payment Summary */}
        <Grid item xs={12} md={5}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Payment Summary
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Investment Amount</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(invoice.amount)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Processing Fee</Typography>
                <Typography variant="body1">
                  {formatCurrency(0)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(invoice.amount)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 3 }}>
                <Typography variant="body2">Current Balance</Typography>
                <Typography variant="body2" fontWeight="bold" color={hasInsufficientFunds ? 'error.main' : 'success.main'}>
                  {formatCurrency(userBalance)}
                </Typography>
              </Box>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Paid />}
                onClick={handlePayment}
                disabled={isLoading || hasInsufficientFunds}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Processing...' : 'Pay Now'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
