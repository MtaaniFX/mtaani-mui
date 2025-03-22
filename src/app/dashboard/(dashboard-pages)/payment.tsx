'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Snackbar,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import PaymentIcon from '@mui/icons-material/Payment';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
}) as typeof Chip; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

function handleClick(event: React.MouseEvent<Element, MouseEvent>) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

// Example usage
// try {
//   const formattedNumber = formatKenyanPhoneNumber('0722000000');
//   console.log(formattedNumber); // Output: 0722 000 000
// } catch (error) {
//   console.error(error.message);
// }
function formatKenyanPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  // Check if the number is valid (starts with '07' and has 10 digits)
  if (/^07\d{8}$/.test(cleanedNumber)) {
    // Format the number into '0722 000 000'
    return cleanedNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else {
    throw new Error(`Invalid Kenyan phone number: ${cleanedNumber}`);
  }
}

// Example usage:
//  console.log(formatAmount(1234567));      // "1,234,567"
//  console.log(formatAmount("9876543210")); // "9,876,543,210"
//  console.log(formatAmount(1000.99));      // "1,000.99"
function formatAmount(amount: string | number): string {
  // Convert the amount to a string
  const amountStr = amount.toString();

  // Split the string into integer and decimal parts (if any)
  const [integerPart, decimalPart] = amountStr.split(".");

  // Format the integer part with commas
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Rejoin the integer part with the decimal part, if any
  return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
}

interface PaymentInfoProps {
  phoneNumber: string;
  amount: string;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ phoneNumber, amount }) => {
  const [showCopyPhoneSuccess, setShowCopyPhoneSuccess] = useState(false);
  const [showCopyAmountSuccess, setShowCopyAmountSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  try {
    phoneNumber = formatKenyanPhoneNumber(phoneNumber);
  } catch (e) {
    console.error(e);
  }

  amount = formatAmount(amount);

  const copyToClipboard = (text: string, isPhone: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPhone) {
      setShowCopyPhoneSuccess(true);
    } else {
      setShowCopyAmountSuccess(true);
    }
  };

  const handleCloseSnackbar = (isPhone: boolean) => {
    if (isPhone) {
      setShowCopyPhoneSuccess(false);
    } else {
      setShowCopyAmountSuccess(false);
    }
  };

  const InfoContainer = ({
    title,
    value,
    icon,
    isPhone = false
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    isPhone?: boolean;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '2px dashed',
        borderColor: 'primary.main',
        borderRadius: 2,
        width: '100%',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ mr: 1, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
      </Box>

      <Typography
        variant={isMobile ? "h6" : "h5"}
        component="div"
        sx={{
          fontWeight: 'bold',
          wordBreak: 'break-word'
        }}
      >
        {value}
      </Typography>

      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <IconButton
          color="primary"
          size="small"
          onClick={() => copyToClipboard(value, isPhone)}
          aria-label={`Copy ${title.toLowerCase()}`}
        >
          <ContentCopyIcon />
        </IconButton>
        {/* <Typography 
          variant="caption" 
          sx={{ 
            ml: 1, 
            alignSelf: 'center',
            color: 'text.secondary'
          }}
        >
          Copy to clipboard
        </Typography> */}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: isMobile ? '100%' : '600px', mx: 'auto', p: 2 }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: 'medium' }}
      >
        Mobile Payment Details
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        Use the details below to complete your mobile payment.
      </Typography>

      {/* M-pesa breadcrumps */}
      <div role="presentation" onClick={handleClick}>
        <Breadcrumbs aria-label="breadcrumb" separator="›" sx={{ my: 2 }}>
          <StyledBreadcrumb component="div"
            icon={<img src='/res/mpesa/M-PESA_LOGO-01.svg' width={64} height={47} ></img>}
            sx={{pl: 1.5}} />
          <StyledBreadcrumb component="div" label="Send money" />
        </Breadcrumbs>
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <InfoContainer
            title="Phone Number"
            value={phoneNumber}
            icon={<PhoneIcon />}
            isPhone={true}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <InfoContainer
            title="Amount"
            value={amount}
            icon={<PaymentIcon />}
            isPhone={false}
          />
        </Grid>
      </Grid>

      <Alert severity="info">Once done, give us upto 30 mins to process your payment, thanks.</Alert>

      <Snackbar
        open={showCopyPhoneSuccess}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar(true)}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography>Phone number copied to clipboard!</Typography>
          </Box>
        }
      />

      <Snackbar
        open={showCopyAmountSuccess}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar(false)}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography>Amount copied to clipboard!</Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default PaymentInfo;
