'use client'

import React, { useState, useEffect, FormEvent } from 'react';
import { Alert, Box, Button, TextField, Typography, useTheme } from '@mui/material';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from "next/navigation";

const supabase = createClient();

const PhoneVerificationPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [inputsDisabled, setInputsDisabled] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const pathname = usePathname();

    const checkUser = async () => {
        setLoading(true);
        const done = () => {
            setLoading(false);
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('User not authenticated');
                done();
                return;
            }
        } catch (err: any) {
            console.log(err?.message);
            setError("error");
        }

        done();
    }

    useEffect(() => {
        checkUser();
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (!phoneNumber) {
            setError('Please enter your phone number');
            return;
        }

        if (!/^[+]*[0-9]{7,15}$/.test(phoneNumber)) {
            setError('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        setInputsDisabled(true);

        // wait for the UI to update (make the inputs disabled) before we proceed
        setTimeout(async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error('User not authenticated');
                }

                const { error } = await supabase
                    .schema('app_phone')
                    .from('verification_requests')
                    .insert([{ phone_number: phoneNumber, user_id: user.id }]);

                if (error) throw error;

                setTimeout(() => {
                    router.replace(pathname + '/current');
                }, 300);
            } catch (err: any) {
                console.log(err.message);
                setError("phone verification request failed");
            }
            setLoading(false);
            setInputsDisabled(false);
        }, 10);
    };

    return (
        <Box sx={{ maxWidth: 400, p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Phone Verification
            </Typography>

            <Typography variant="caption" color='text.secondary' textAlign='center'>
                Link your phone number to your account
            </Typography>

            <form onSubmit={handleSubmit}>
                <TextField
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    fullWidth
                    margin="normal"
                    placeholder='+2547••••••••'
                    error={!!error}
                    helperText={error}
                    disabled={inputsDisabled}
                />

                <Alert severity="info">
                    Once verified, logins and payments from this number
                    will be linked to your account
                </Alert>

                <Button type="submit"
                    variant="contained"
                    color="primary"
                    loading={loading}
                    loadingPosition="start"
                    sx={{ mt: 2 }}>
                    Request Verification
                </Button>
            </form>
        </Box>
    );
};

export default PhoneVerificationPage;
