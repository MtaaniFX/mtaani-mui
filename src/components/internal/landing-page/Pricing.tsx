import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { paths } from '@/lib/paths';

const tiers = [
    {
        id: 1,
        title: 'Starter',
        price: '10,000',
        description: [
            'Investment Range: KES 10,000 - KES 49,999',
            '20% Monthly Returns',
            'Enjoy standard bonuses and rewards',
            'Best For: New investors, low-risk introduction',
            'Key Benefits: Minimal entry, full flexibility',
        ],
        buttonText: 'Get Started',
        buttonVariant: 'outlined',
        buttonColor: 'primary',
    },
    {
        id: 2,
        title: 'Growth',
        subheader: 'Recommended',
        price: '50,000',
        description: [
            'Investment Range: KES 50,000 - KES 99,999',
            '20% Monthly Returns',
            'Unlock enhanced bonuses and rewards',
            'Best For: Experienced investors, steady growth',
            'Key Benefits: Higher potential earnings, consistent returns',
        ],
        buttonText: "Go For It",
        buttonVariant: 'contained',
        buttonColor: 'secondary',
    },
    {
        id: 3,
        title: 'Premium',
        price: '100,000',
        description: [
            'Investment Range: KES 100,000 - KES 500,000',
            '20% Monthly Returns',
            'Experience Elite bonuses and rewards',
            'Best For: Serious investors, maximum returns',
            'Key Benefits: Maximum investment potential, same reliable rate',
        ],
        buttonText: "Let's Do This",
        buttonVariant: 'outlined',
        buttonColor: 'primary',
    },
];

export default function Pricing() {
    return (
        <Container
            id="pricing"
            sx={{
                pt: { xs: 4, sm: 12 },
                pb: { xs: 8, sm: 16 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 3, sm: 6 },
            }}
        >
            <Box
                sx={{
                    width: { sm: '100%', md: '60%' },
                    textAlign: { sm: 'left', md: 'center' },
                }}
            >
                <Typography
                    component="h2"
                    variant="h4"
                    gutterBottom
                    sx={{ color: 'text.primary' }}
                >
                    Investment Plans
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Flexible Options for Every Investor.
                </Typography>
            </Box>
            <Grid
                container
                spacing={3}
                sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
                {tiers.map((tier) => (
                    <Grid
                        size={{ xs: 12, sm: tier.id === 3 ? 12 : 6, md: 4 }}
                        key={tier.title}
                    >
                        <Card
                            sx={[
                                {
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                },
                                tier.id === 2 &&
                                ((theme) => ({
                                    border: 'none',
                                    background:
                                        'radial-gradient(circle at 50% 0%, hsl(220, 20%, 35%), hsl(220, 30%, 6%))',
                                    boxShadow: `0 8px 12px hsla(220, 20%, 42%, 0.2)`,
                                    ...theme.applyStyles('dark', {
                                        background:
                                            'radial-gradient(circle at 50% 0%, hsl(220, 20%, 20%), hsl(220, 30%, 16%))',
                                        boxShadow: `0 8px 12px hsla(0, 0%, 0%, 0.8)`,
                                    }),
                                })),
                            ]}
                        >
                            <CardContent>
                                <Box
                                    sx={[
                                        {
                                            mb: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 2,
                                        },
                                        tier.id === 2
                                            ? { color: 'grey.100' }
                                            : { color: '' },
                                    ]}
                                >
                                    <Typography component="h3" variant="h6">
                                        {tier.title}
                                    </Typography>
                                    {tier.id === 2 && (
                                        <Chip icon={<AutoAwesomeIcon />} label={tier.subheader} />
                                    )}
                                </Box>
                                <Box
                                    sx={[
                                        {
                                            display: 'flex',
                                            alignItems: 'baseline',
                                        },
                                        tier.id === 2
                                            ? { color: 'grey.50' }
                                            : { color: null },
                                    ]}
                                >
                                    <Typography variant="body1">
                                        from &nbsp;
                                    </Typography>
                                    <Typography component="h4" variant="h4">
                                        KES&nbsp;{tier.price}
                                    </Typography>
                                    <Typography component="h3" variant="h6">
                                        &nbsp;
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 2, opacity: 0.8, borderColor: 'divider' }} />
                                {tier.description.map((line) => (
                                    <Box
                                        key={line}
                                        sx={{ py: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}
                                    >
                                        <CheckCircleRoundedIcon
                                            sx={[
                                                {
                                                    width: 20,
                                                },
                                                tier.id === 2
                                                    ? { color: 'primary.light' }
                                                    : { color: 'primary.main' },
                                            ]}
                                        />
                                        <Typography
                                            variant="subtitle2"
                                            component={'span'}
                                            sx={[
                                                tier.id === 2
                                                    ? { color: 'grey.50' }
                                                    : { color: null },
                                            ]}
                                        >
                                            {line}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                            <CardActions>
                                <Button
                                    fullWidth
                                    variant={tier.buttonVariant as 'outlined' | 'contained'}
                                    color={tier.buttonColor as 'primary' | 'secondary'}
                                    href={paths.auth.signUp}
                                >
                                    {tier.buttonText}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
