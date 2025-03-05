'use client'

import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { createClient } from '@/utils/supabase/client';

const StaffPhoneVerificationPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .schema('app_phone')
        .from('staff_verification_entries')
        .insert([
          {
            staff_id: user.id,
            phone_number: phoneNumber,
            verification_code: verificationCode,
          },
        ]);
      if (error) throw error;
      
      setMessage('Verification processed successfully.');
      setPhoneNumber('');
      setVerificationCode('');
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Staff Phone Verification
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Verification Code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          fullWidth
          margin="normal"
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {message && (
          <Typography color="primary" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Processing...' : 'Submit Verification'}
        </Button>
      </form>
    </Box>
  );
};

export default StaffPhoneVerificationPage;
