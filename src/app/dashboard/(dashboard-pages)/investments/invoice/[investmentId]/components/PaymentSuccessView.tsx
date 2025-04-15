'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider,
  Container,
  Stack
} from '@mui/material';
import { CheckCircle, ReceiptLong } from '@mui/icons-material';

interface PaymentSuccessViewProps {
  invoiceId: string;
}

export default function PaymentSuccessView({ invoiceId }: PaymentSuccessViewProps) {
  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4, 
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Your investment invoice #{invoiceId} has been successfully paid.
          Your investment is now being processed.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" paragraph>
          You can view the details of this transaction and track your investment
          progress in your account dashboard.
        </Typography>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptLong />}
            href="/dashboard/invoices"
            size="large"
          >
            View All Invoices
          </Button>
          
          <Button
            variant="outlined"
            href="/dashboard"
            size="large"
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
