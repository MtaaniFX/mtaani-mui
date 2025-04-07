'use client';

import { useEffect, useState } from 'react';
import { Typography, List, ListItem, ListItemText, Chip, Box, CircularProgress, LinearProgress, Card, CardContent, Button, Alert } from '@mui/material';
import { createClient } from '@/utils/supabase/client';
import { AccountBalance } from '@mui/icons-material';
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import PaymentInfo from './payment';
import { PaymentPhoneNumber } from '@/const';

type IndividualInvestment = {
    id: string;
    status: string;
    principal: number;
    inv_type: 'normal' | 'locked';
    locked_months: number;
    created_at: string;
};

type GroupInvestment = {
    id: string;
    status: string;
    group_name: string;
    inv_type: 'normal' | 'locked';
    locked_months: number;
    created_at: string;
};

type Investment = {
    type: string, //'individual' | 'group';
    data: IndividualInvestment | GroupInvestment,
};

// Dialogue transition
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


function AlertDialogSlide() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={handleClickOpen}>
                Slide in alert dialog
            </Button>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Use Google's location service?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Let Google help apps determine location. This means sending anonymous
                        location data to Google, even when no apps are running.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleClose}>Agree</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}


export default function InvestmentsList() {
    const supabase = createClient();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [open, setOpen] = React.useState(false);
    const [phoneNumber, setPhoneNumber] = React.useState(PaymentPhoneNumber);
    const [amount, setAmount] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fetchInvestments = async () => {
        try {
            // Get the current user's session
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not logged in');
            }

            console.log('user data:', user);

            // Fetch individual investments
            const { data: individualInvestments, error: individualError } = await supabase
                .schema('app_lank_investments')
                .from('individual_investments')
                .select('*')
                .eq('user_id', user.id);

            if (individualError) throw individualError;

            // Fetch group investments where the user is the owner
            const { data: groupInvestments, error: groupError } = await supabase
                .schema('app_lank_investments')
                .from('group_investments')
                .select('*')
                .eq('owner', user.id);

            if (groupError) throw groupError;

            // Combine and format the investments
            const formattedInvestments: Investment[] = [
                ...(individualInvestments?.map((inv) => ({
                    type: 'individual',
                    data: inv,
                })) || []),
                ...(groupInvestments?.map((inv) => ({
                    type: 'group',
                    data: inv,
                })) || []),
            ];

            setInvestments(formattedInvestments);
        } catch (err) {
            console.error('Error fetching investments:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, [supabase]);

    if (loading) {
        return <LinearProgress sx={{ width: '100%' }} />;
    }

    if (error) {
        return (
            <Card sx={{ textAlign: 'center', py: 4 }} elevation={0}>
                <CardContent>
                    <AccountBalance sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography color='error' variant="h6" gutterBottom >
                        Error fetching Investments
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={async () => {
                            setLoading(true);
                            await fetchInvestments();
                        }}
                        disabled={loading}
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (investments.length === 0) {
        return (
            <Card sx={{ textAlign: 'center', py: 4 }} elevation={0}>
                <CardContent>
                    <AccountBalance sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No Active Investments
                    </Typography>
                    {/* <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Start your investment journey today and watch your money grow!
                    </Typography> */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={async () => {
                            setLoading(true);
                            await fetchInvestments();
                        }}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <List>
                {investments.map((investment, index) => (
                    <ListItem key={index} divider>
                        <ListItemText
                            primary={
                                <>
                                    <Typography variant="h6">
                                        {investment.type === 'individual' ? 'Individual Investment' : `Group Investment: ${(investment.data as GroupInvestment).group_name}`}
                                    </Typography>
                                    <Box mt={1}>
                                        <Chip
                                            label={investment.data.inv_type === 'locked' ? 'Locked' : 'Normal'}
                                            color={investment.data.inv_type === 'locked' ? 'secondary' : 'primary'}
                                            size="small"
                                        />
                                        {investment.data.inv_type === 'locked' && (
                                            <Chip
                                                label={`${investment.data.locked_months} months`}
                                                color="info"
                                                size="small"
                                                style={{ marginLeft: '8px' }}
                                            />
                                        )}
                                    </Box>
                                </>
                            }
                            secondary={
                                <>
                                    {investment.type === "individual" &&
                                        <Typography variant="body2">
                                            Amount: {(investment.data as IndividualInvestment).principal}
                                        </Typography>
                                    }
                                    <Typography variant="body2">
                                        Created: {new Date(investment.data.created_at).toLocaleDateString()}
                                    </Typography>
                                </>
                            }
                        />
                        {investment.data.status !== "active" && <>
                            <Button onClick={async () => {
                                let amount = 0;
                                if (investment.type === "individual") {
                                    amount = (investment.data as IndividualInvestment).principal;
                                }

                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) {
                                    throw new Error('User not logged in');
                                }

                                console.log(`Initializing payment of  KES: ${amount} by phone: ${user.phone}`);
                                setPhoneNumber(PaymentPhoneNumber);
                                setAmount(String(amount));

                                setOpen(true);
                            }}>
                                Make Payments
                            </Button>
                        </>
                        }
                    </ListItem>
                ))}
            </List>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>Payment</DialogTitle>
                <DialogContent>
                    <Dialog
                        open={open}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClose}
                        aria-describedby="alert-dialog-slide-description"
                    >
                        {/* <DialogTitle>Payment Details</DialogTitle> */}
                        <PaymentInfo phoneNumber={phoneNumber} amount={amount} />
                        <DialogActions>
                            <Button onClick={handleClose}>Ok</Button>
                        </DialogActions>
                    </Dialog>
                </DialogContent>
            </Dialog>
        </>
    );
}
