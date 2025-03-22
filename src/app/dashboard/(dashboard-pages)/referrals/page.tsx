'use client'

import { useEffect, useState } from 'react'
import {
    Container,
    Typography,
    Card,
    Grid,
    IconButton,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Snackbar,
    useTheme
} from '@mui/material'
import {
    ContentCopy,
    Facebook,
    WhatsApp,
    Twitter,
    Email,
    Cached,
    Group,
    AccountBalanceWallet,
    Paid
} from '@mui/icons-material'
import { createClient } from '@/utils/supabase/client'
import Hero from './hero'
import HowItWorks from './how-it-works'
import { ReferralService, ReferralCode } from '@/database/referrals/crud'
import { formatTimestampToLocalTime } from '@/database/time'

interface Referral {
    id: string
    date: string
    phone: string
    deposit: number
    reward: number
}


export default function ReferralPage() {
    const supabase = createClient();

    const theme = useTheme()
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [referralCode, setReferralCode] = useState('');
    const [referralLink, setReferralLink] = useState('');


    const getReferralCode = async () => {
        const response = await fetch("/api/v1/referrals", {
            method: 'POST',
        });

        try {
            const { data, error } = await response.json();
            if (error) {
                return null;
            }

            return data?.code as string;
        } catch (e) {
            console.error(e);
            return;
        }
    }

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        setLoading(true)

        const defer = () => {
            setLoading(false);
        }

        const response = await supabase.auth.getUser();
        if (response.error) {
            console.error('user not logged in');
            defer();
            return;
        }
        const userId = response.data.user.id;

        const crud = new ReferralService(supabase);
        const code = await getReferralCode();
        if (code) {
            setReferralCode(code);
            setReferralLink(`https://mtaani.devhive.buzz/invite/?code=${code}`);
        }

        {
            const response = await crud.getReferralsByReferrerPaged(userId, page, rowsPerPage);
            if (response.error) {
                defer();
                return;
            }

            const refs: Referral[] = [];
            if (response.data) {
                for (const refData of response.data) {
                    const createdAt = formatTimestampToLocalTime(refData.created_at || "");
                    refs.push({
                        id: String(refData.id),
                        date: createdAt,
                        deposit: 0,
                        phone: "-",
                        reward: 0,
                    })
                }
            }

            setReferrals(refs);
            // Example Supabase query
            // const { data, error } = await supabase
            //     .from('referrals')
            //     .select('*')
            //     .range(page * rowsPerPage, (page + 1) * rowsPerPage)
        }

        defer();
    }

    const handleCopyClick = () => {
        navigator.clipboard.writeText(referralLink)
        setSnackbarOpen(true)
    }

    const handleSocialShare = (platform: string) => {
        const message = encodeURIComponent(`Join me using my referral link: ${referralLink}`)
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${referralLink}`,
            whatsapp: `https://wa.me/?text=${message}`,
            twitter: `https://twitter.com/intent/tweet?text=${message}`,
            email: `mailto:?body=${message}`
        }
        window.open((urls as any)[platform], '_blank')
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    return (
        <>
            <Hero />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Your Referral Details */}
                <Box mb={4}>
                    <Typography id='cab-target' variant="h6" gutterBottom>
                        Your Referral Details
                    </Typography>
                    <Card sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Referral Code
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {referralCode}
                                    <IconButton onClick={handleCopyClick} size="small" sx={{ p: 1 }}>
                                        <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Referral Link
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {/* referralLink.substring(0, 24)}... */}
                                    {referralLink}
                                    <IconButton onClick={handleCopyClick} size="small" sx={{ p: 1 }}>
                                        <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Card>
                </Box>

                {/* Share Section */}
                <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                        Share Your Link
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            { platform: 'facebook', icon: <Facebook />, color: '#1877F2' },
                            { platform: 'whatsapp', icon: <WhatsApp />, color: '#25D366' },
                            { platform: 'twitter', icon: <Twitter />, color: '#1DA1F2' },
                            { platform: 'email', icon: <Email />, color: theme.palette.text.primary },
                        ].map((item) => (
                            <Grid item key={item.platform}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleSocialShare(item.platform)}
                                    startIcon={item.icon}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 50,
                                        px: 3,
                                        // borderColor: theme.palette.grey[300],
                                        // color: theme.palette.text.primary,
                                        color: item.color,
                                        borderColor: item.color,
                                        '&:hover': { borderColor: item.color }
                                    }}
                                >
                                    Share on {item.platform}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* How it works */}
                <Box sx={{ mb: 4 }}>
                    <HowItWorks />
                </Box>

                {/* Direct Referral List */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Direct Referrals
                    </Typography>

                    {referrals.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Phone Number</TableCell>
                                        <TableCell>First Deposit</TableCell>
                                        <TableCell>Your Reward</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {referrals.map((referral) => (
                                        <TableRow key={referral.id}>
                                            <TableCell>{referral.date}</TableCell>
                                            <TableCell>{referral.phone}</TableCell>
                                            <TableCell>${referral.deposit.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`$${referral.reward.toLocaleString()}`}
                                                    color="success"
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={referrals.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableContainer>
                    ) : (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Group fontSize="large" />
                            <Typography variant="body1" gutterBottom>
                                No referrals yet<br />
                                Start sharing your link to earn rewards!
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={fetchReferrals}
                                loading={loading}>
                                Check for New Referrals
                            </Button>
                        </Paper>
                    )}
                </Box>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    message="Copied to clipboard!"
                />
            </Container>
        </>
    )
}
