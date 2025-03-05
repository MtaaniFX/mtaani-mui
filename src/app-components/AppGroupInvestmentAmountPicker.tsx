import { ReactStateString } from '@/types/react'
import { Alert, Box, Button, Collapse, IconButton, Link, TextField, Typography } from '@mui/material'
import { useState } from 'react';

export type Props = {
    children?: React.ReactNode,
    investmentAmount: string,
    setInvestmentAmount: ReactStateString,
    handleSubmit?: () => void,
    handleBack?: () => void,
}

export default function AppGroupInvestmentAmountPicker(props: Props) {
    const { investmentAmount, setInvestmentAmount, handleSubmit, handleBack } = props;
    const [errorMessage, setErrorMessage] = useState('');
    const [error, setError] = useState(false);
    const [closeInfo, setCloseInfo] = useState(false);

    function handleAmountChange(value: string): void {
        const newAmount = Number.parseInt(value, 10);

        if (!(newAmount >= 500 && newAmount <= 1_000_000)) {
            setError(true);
            setErrorMessage("Invalid Investment Amount");
        } else {
            setError(false);
            setErrorMessage("");
        }

        setInvestmentAmount(value);
    }

    return (
        <>
            <Typography variant='body1' sx={{ my: 0.5 }} gutterBottom>
                Enter the actual amount you wish to contribute to the group for investment.
            </Typography>

            <TextField
                label="Investment Amount"
                type="number"
                value={investmentAmount}
                onChange={(e) =>
                    handleAmountChange(e.target.value)
                }
                sx={{ mt: 1 }}
                helperText={errorMessage || `Enter amount from KES 500`}
                error={error}
                required
            />

            <Box sx={{ mb: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={error || !investmentAmount}
                    sx={{ mr: 1 }}
                >
                    Make Contribution
                </Button>
                <Button
                    disabled={false}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                >
                    Back
                </Button>
            </Box>

            <Box sx={{ maxWidth: 'fit-content' }}>
                <Collapse in={!closeInfo}>
                    <Alert severity="info" onClose={() => { setCloseInfo(true) }}>
                        For group investments, each member can make contributions from KES 500
                    </Alert>
                </Collapse>
            </Box>
        </>
    )
}
