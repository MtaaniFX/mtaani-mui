'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Alert,
    Divider,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Card
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

type PageProps = {
    code: string;
};

const InvitePage = (params: PageProps) => {
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [inviteCode, setInviteCode] = useState<string>(params.code);
    const [loading, setLoading] = useState<boolean>(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/v1/invite/${params.code}`);
                if (response.ok) {
                    const data = await response.json();
                    setIsValid(data.isValid);
                    setInviteCode(data.inviteCode);

                    const nextPage = searchParams.get('next');
                    if (nextPage) {
                        router.replace(nextPage);
                    }
                } else {
                    console.log('server response:', response.status);
                }
            } catch (error) {
                console.error("Failed to fetch invite data:", error);
                setIsValid(false);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

    }, [params.code]);

    if (loading) {
        return (
            <Container>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 2
            }}
        >
            {/* maxWidth="sm" */}
            <Container sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <Card
                    variant='outlined'
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
                            You've been invited to join our exclusive investment platform.
                            <br />
                            Gain access to premium investment opportunities.
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
                                href='/sign-up'
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
                </Card>
            </Container>
        </Box>
    );
};

export default InvitePage;
