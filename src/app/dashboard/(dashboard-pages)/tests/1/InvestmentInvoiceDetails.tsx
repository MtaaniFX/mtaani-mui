'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  Link,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaymentsIcon from '@mui/icons-material/Payments';

export interface Investment {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  amount: number;
  expectedReturn: number;
  returnRate: number;
  status: 'active' | 'pending' | 'completed';
}

export interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  processingFee: number;
  totalAmount: number;
}

export interface InvestmentInvoiceProps {
  investment: Investment;
  invoice: Invoice;
  userBalance: number;
}

// Mock data for testing
const mockData: InvestmentInvoiceProps = {
  investment: {
    id: 'INV-2024-001',
    name: 'Tech Growth Fund',
    type: 'Mutual Fund',
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    amount: 10000,
    expectedReturn: 1200,
    returnRate: 12,
    status: 'pending',
  },
  invoice: {
    id: 'INV-2024-001',
    amount: 10000,
    dueDate: '2024-02-15',
    processingFee: 25,
    totalAmount: 10025,
  },
  userBalance: 8000,
};

const InvestmentInvoiceDetails: React.FC<InvestmentInvoiceProps> = ({
  investment,
  invoice,
  userBalance,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showAlert, setShowAlert] = React.useState(userBalance < invoice.totalAmount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container sx={{py: 3}}>
      {showAlert && (
        <Alert
          severity="warning"
          onClose={() => setShowAlert(false)}
          sx={{ marginBottom: 3 }}
        >
          <AlertTitle>Insufficient Balance</AlertTitle>
          Your current balance ({formatCurrency(userBalance)}) is insufficient for this investment.{' '}
          <Link href="/dashboard/deposits" target="_blank" underline="hover">
            Make a deposit
          </Link>
        </Alert>
      )}

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
                    End Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(investment.endDate)}
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
                    {investment.returnRate}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expected Return
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(investment.expectedReturn)}
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

              <Box sx={{ marginY: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Processing Fee
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCurrency(invoice.processingFee)}
                </Typography>
              </Box>

              <Divider sx={{ marginY: 2 }} />

              <Box sx={{ marginY: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount Due
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>

              <Box sx={{ marginY: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(invoice.dueDate)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InvestmentInvoiceDetails;
