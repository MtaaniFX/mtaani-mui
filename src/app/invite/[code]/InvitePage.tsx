'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  useTheme, 
  useMediaQuery,
  Alert,
  Divider,
  CircularProgress 
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { AppNameLong } from '@/const';

interface InvitePageProps {
  inviteCode: string;
  isValid: boolean;
}

const InvitePage: React.FC<InvitePageProps> = ({ inviteCode, isValid }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = React.useState(false);

  const handleJoin = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      window.location.href = '/sign-up';
    }, 1500);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        padding: 2
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper 
          elevation={8}
          sx={{ 
            padding: isMobile ? 3 : 6, 
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            {/* Replace with your actual logo */}
            <Image 
              src="/res/referrals/hero-img.png" 
              alt="Investment Platform Logo" 
              width={150} 
              height={80}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>

          <Typography variant={isMobile ? "h5" : "h4"} align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
            {isValid ? 'You\'re Invited!' : 'Invalid Invitation'}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {isValid ? (
              <CheckCircle color="success" sx={{ fontSize: 64 }} />
            ) : (
              <Error color="error" sx={{ fontSize: 64 }} />
            )}
          </Box>

          {isValid ? (
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              You've been invited to join our exclusive investment platform. Gain access to premium investment opportunities, market insights, and portfolio management tools.
            </Typography>
          ) : (
            <Alert severity="error" sx={{ mb: 4 }}>
              The invitation code <strong>{inviteCode}</strong> is invalid or has expired. Please contact the person who invited you for a new code.
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {isValid && (
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={loading}
                onClick={handleJoin}
                sx={{ 
                  minWidth: '150px',
                  py: 1.5
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Join Now'}
              </Button>
            )}
            <Button 
              variant="outlined" 
              color="primary"
              component={Link}
              href="/"
              size="large"
              sx={{ 
                minWidth: '150px',
                py: 1.5
              }}
            >
              {isValid ? 'Learn More' : 'Go Home'}
            </Button>
          </Box>
          
          <Typography variant="caption" align="center" sx={{ mt: 4, display: 'block', color: 'text.secondary' }}>
            Invitation Code: {inviteCode}
          </Typography>
        </Paper>
      </Container>
      
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="white">
          © 2025 {AppNameLong}. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default InvitePage;
