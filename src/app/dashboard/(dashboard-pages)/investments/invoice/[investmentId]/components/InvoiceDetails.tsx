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
  Chip,
  Container,
  Link
} from '@mui/material';
import { Close as CloseIcon, Paid, CalendarToday, AccountBalance, ArrowForward } from '@mui/icons-material';
import { formatCurrency, formatDate } from '@/utils/formatters';
import PaymentSuccessView from './PaymentSuccessView';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaymentsIcon from '@mui/icons-material/Payments';

// 20 % return rate per mont
const returnRate = 0.20;

export interface Investment {
  id: string;
  type: string;
  name: string;
  description: string;
  amount: number;
  term: string;
  expected_roi: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Invoice {
  id: string;
  investment_id: string;
  user_id: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceDetailsProps {
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
    <Container sx={{ py: 3 }}>
      {/* Page Header */}
      <Typography variant="h5" sx={{ mb: 4 }} gutterBottom >
        Investment Invoice
      </Typography>

      {/* Alert for insufficient funds */}
      {showAlert && (
        <Alert
          severity="warning"
          onClose={handleAlertClose}
          sx={{ marginBottom: 3 }}
        >
          <AlertTitle>Insufficient Balance</AlertTitle>
          Your current balance ({formatCurrency(userBalance)}) is insufficient for this investment.{' '}
          <Link href="/dashboard/deposits" target="_blank" underline="hover">
            Make a deposit
          </Link>
        </Alert>
      )}


      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Grid Layout 1 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card variant='outlined'>
            <CardContent sx={{mb: 4.6}}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <AccountBalanceIcon sx={{ marginRight: 1 }} />
                <Typography variant="h5" component="h1">
                  Investment Details
                </Typography>
                <Chip
                  label={investment.status}
                  color={investment.status === 'active' ? 'success' : 'warning'}
                  size="small"
                  sx={{ marginLeft: 'auto' }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Investment Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {investment.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Investment Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {investment.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(investment.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Term
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(investment.term)}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ marginY: 2 }}>
                <Divider />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <TrendingUpIcon sx={{ marginRight: 1 }} />
                <Typography variant="h6">Expected Returns</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Return Rate
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {returnRate * 100}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expected Return
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(investment.amount * returnRate * 100)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant='outlined'>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <PaymentsIcon sx={{ marginRight: 1 }} />
                <Typography variant="h5" component="h2">
                  Invoice Summary
                </Typography>
              </Box>

              <Box sx={{ marginY: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Investment Amount
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {formatCurrency(invoice.amount)}
                </Typography>
              </Box>

              {/* <Box sx={{ marginY: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Processing Fee
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCurrency(invoice.processingFee)}
                </Typography>
              </Box> */}

              <Divider sx={{ marginY: 2 }} />

              <Box sx={{ marginY: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount Due
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(invoice.amount)}
                </Typography>
              </Box>

              <Box sx={{ marginY: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(invoice.updated_at)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grid Layout 2 */}
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
                    {/* {formatDate(invoice.created_at)} */}
                    {invoice.created_at}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Due Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    {/* {formatDate(invoice.due_date)} */}
                    {invoice.due_date}
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
    </Container>
  );
}
