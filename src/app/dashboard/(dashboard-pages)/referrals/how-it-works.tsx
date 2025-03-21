import {
    Typography,
    Grid,
    Box,
    ListItemIcon,
    Card
} from '@mui/material'
import {
    Group,
    AccountBalanceWallet,
    Paid
} from '@mui/icons-material'


export default function HowItWorks() {
    return (<>
        <Typography variant="h6" gutterBottom>
            How It Works
        </Typography>
        <Card>
            <Box>
                <Grid container spacing={4}>
                    {[
                        { icon: <Group fontSize="large" />, title: 'Share Your Link', text: 'Share your unique referral link with friends' },
                        { icon: <AccountBalanceWallet fontSize="large" />, title: 'First Deposit', text: 'Your friend makes their first deposit' },
                        { icon: <Paid fontSize="large" />, title: 'Earn Rewards', text: 'Receive rewards when they complete transactions' },
                    ].map((step, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Box sx={{ textAlign: 'left', p: 3 }}>
                                <ListItemIcon sx={{ minWidth: 0, mb: 2 }}>
                                    {step.icon}
                                </ListItemIcon>
                                <Typography variant="h6" gutterBottom>
                                    {step.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {step.text}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Card>
    </>
    )
}
