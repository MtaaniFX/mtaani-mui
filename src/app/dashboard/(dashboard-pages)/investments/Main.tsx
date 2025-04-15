'use client'

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Grid,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useMediaQuery,
    useTheme,
    MobileStepper,
    Divider,
    Chip,
    CircularProgress,
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight, Payment, Info } from '@mui/icons-material';
import { createClient } from '@/utils/supabase/client';
import { Investment } from './types';
import { f } from './server.action';

const InvestmentsList: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [processingPayment, setProcessingPayment] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const itemsPerPage = 6;

    useEffect(() => {

        const fetchInvestments = async () => {
            setLoading(true);
            const supabase = createClient();

            let response = await f((await supabase.auth.getUser()).data.user?.id || '', page, itemsPerPage);
            if (response) {
                setTotalPages(response.totalPages);
                setInvestments(response.investments || []);
            }

            setLoading(false);
        };

        const fetchInvestments2 = async () => {
            const supabase = createClient();
            setLoading(true);

            try {
                // Get total count for pagination
                const { count } = await supabase
                    .schema('app_investments')
                    .from('investments')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');

                setTotalPages(Math.ceil((count || 0) / itemsPerPage));

                // Get paginated data
                const { data, error } = await supabase
                    .schema('app_investments')
                    .from('investments')
                    .select('*')
                    .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
                    .order('created_at', { ascending: false })
                    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

                if (error) throw error;

                setInvestments(data || []);
            } catch (error) {
                console.error('Error fetching investments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestments();
    }, [page]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleCardClick = (investment: Investment) => {
        setSelectedInvestment(investment);
        setActiveStep(0);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedInvestment(null);
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleMakePayment = async () => {
        if (!selectedInvestment) return;

        setProcessingPayment(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            // In a real app, you would call your payment API here
            console.log('Payment processed for investment:', selectedInvestment.id);
        } finally {
            setProcessingPayment(false);
            handleClose();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInvestmentTypeLabel = (type: number) => {
        switch (type) {
            case 1: return 'Individual Normal';
            case 2: return 'Individual Locked';
            case 3: return 'Group Normal';
            case 4: return 'Group Locked';
            default: return 'Unknown';
        }
    };

    const getStatusChip = (investment: Investment) => {
        if (investment.terminated) {
            return <Chip label="Terminated" color="error" size="small" />;
        }
        if (investment.paid) {
            return <Chip label="Active" color="success" size="small" />;
        }
        return <Chip label="Pending Payment" color="warning" size="small" />;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (investments.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary">
                    No investments yet
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 3 }}>
            {/* Investment Cards Grid */}
            <Grid container spacing={3}>
                {investments.map((investment) => (
                    <Grid item xs={12} sm={6} md={4} key={investment.id}>
                        <Card
                            elevation={3}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <CardActionArea
                                onClick={() => handleCardClick(investment)}
                                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                            >
                                <CardContent sx={{ width: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="h6" component="div">
                                            {getInvestmentTypeLabel(investment.type)}
                                        </Typography>
                                        {getStatusChip(investment)}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Created: {formatDate(investment.created_at)}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2">Amount</Typography>
                                            <Typography variant="h6" color="primary">
                                                KES {investment.amount.toLocaleString()}
                                            </Typography>
                                        </Box>

                                        <Box textAlign="right">
                                            <Typography variant="body2">Returns*</Typography>
                                            <Typography variant="h6" color="success.main">
                                                KES {(investment.amount * 0.2).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                />
            </Box>

            {/* Investment Detail View - Dialog for desktop, Stepper for mobile */}
            {selectedInvestment && (
                isMobile ? (
                    <Dialog
                        fullScreen
                        open={openDialog}
                        onClose={handleClose}
                        PaperProps={{
                            sx: {
                                bgcolor: theme.palette.background.default
                            }
                        }}
                    >
                        <DialogTitle sx={{ pb: 0 }}>
                            <Typography variant="h6">
                                {getInvestmentTypeLabel(selectedInvestment.type)}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                                {getStatusChip(selectedInvestment)}
                                <Typography variant="body2" color="text.secondary" ml={1}>
                                    {formatDate(selectedInvestment.created_at)}
                                </Typography>
                            </Box>
                        </DialogTitle>

                        <MobileStepper
                            variant="dots"
                            steps={2}
                            position="static"
                            activeStep={activeStep}
                            sx={{ bgcolor: 'transparent', px: 2 }}
                            nextButton={
                                <Button
                                    size="small"
                                    onClick={handleNext}
                                    disabled={activeStep === 1}
                                    endIcon={<KeyboardArrowRight />}
                                >
                                    Next
                                </Button>
                            }
                            backButton={
                                <Button
                                    size="small"
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                    startIcon={<KeyboardArrowLeft />}
                                >
                                    Back
                                </Button>
                            }
                        />

                        <DialogContent dividers>
                            {activeStep === 0 ? (
                                <Box>
                                    <Box mb={3}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Investment Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Amount
                                                </Typography>
                                                <Typography variant="body1">
                                                    KES {selectedInvestment.amount.toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Accrued Returns
                                                </Typography>
                                                <Typography variant="body1" color="primary">
                                                KES {(selectedInvestment.amount * 0.2).toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Earned Returns
                                                </Typography>
                                                <Typography variant="body1" color="success.main">
                                                    KES {selectedInvestment.accrued_returns.toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Type
                                                </Typography>
                                                <Typography variant="body1">
                                                    {getInvestmentTypeLabel(selectedInvestment.type)}
                                                </Typography>
                                            </Grid>
                                            {selectedInvestment.locked_months > 0 && (
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Lock Period
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {selectedInvestment.locked_months} months
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {selectedInvestment.paid_at && (
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Paid On
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {formatDate(selectedInvestment.paid_at)}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {selectedInvestment.terminated_at && (
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Terminated On
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {formatDate(selectedInvestment.terminated_at)}
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Status
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedInvestment.paid
                                                ? 'Your investment is active and earning returns.'
                                                : selectedInvestment.terminated
                                                    ? 'This investment has been terminated.'
                                                    : 'Your investment is pending payment.'}
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Investment Actions
                                    </Typography>

                                    {!selectedInvestment.paid && !selectedInvestment.terminated && (
                                        <Box mb={3}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Complete your payment to activate this investment
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                fullWidth
                                                startIcon={<Payment />}
                                                onClick={handleMakePayment}
                                                disabled={processingPayment}
                                            >
                                                {processingPayment ? 'Processing...' : 'Make Payment'}
                                            </Button>
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Need help with your investment?
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="large"
                                            fullWidth
                                            startIcon={<Info />}
                                        >
                                            Contact Support
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                ) : (
                    <Dialog
                        open={openDialog}
                        onClose={handleClose}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 2
                            }
                        }}
                    >
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">
                                    {getInvestmentTypeLabel(selectedInvestment.type)}
                                </Typography>
                                {getStatusChip(selectedInvestment)}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Created: {formatDate(selectedInvestment.created_at)}
                            </Typography>
                        </DialogTitle>

                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Investment Details
                                    </Typography>
                                    <Box mb={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Amount
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            KES {selectedInvestment.amount.toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box mb={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Accrued Returns
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            KES {(selectedInvestment.amount * 0.2).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box mb={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Earned Returns
                                        </Typography>
                                        <Typography variant="h6" color="success.main">
                                            KES {selectedInvestment.accrued_returns.toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box mb={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Type
                                        </Typography>
                                        <Typography variant="body1">
                                            {getInvestmentTypeLabel(selectedInvestment.type)}
                                        </Typography>
                                    </Box>

                                    {selectedInvestment.locked_months > 0 && (
                                        <Box mb={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                Lock Period
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedInvestment.locked_months} months
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Timeline
                                    </Typography>

                                    <Box mb={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Created
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(selectedInvestment.created_at)}
                                        </Typography>
                                    </Box>

                                    {selectedInvestment.paid_at && (
                                        <Box mb={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                Paid
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(selectedInvestment.paid_at)}
                                            </Typography>
                                        </Box>
                                    )}

                                    {selectedInvestment.terminated_at && (
                                        <Box mb={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                Terminated
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(selectedInvestment.terminated_at)}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box mt={3}>
                                        <Typography variant="body2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedInvestment.paid
                                                ? 'Your investment is active and earning returns.'
                                                : selectedInvestment.terminated
                                                    ? 'This investment has been terminated.'
                                                    : 'Your investment is pending payment.'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                            <Box>
                                {!selectedInvestment.paid && !selectedInvestment.terminated && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Payment />}
                                        onClick={handleMakePayment}
                                        disabled={processingPayment}
                                        sx={{ mr: 2 }}
                                    >
                                        {processingPayment ? 'Processing...' : 'Make Payment'}
                                    </Button>
                                )}
                            </Box>
                            <Button onClick={handleClose} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                )
            )}
        </Box>
    );
};

export default InvestmentsList;