import {Button, Card, Link, TextField} from "@mui/material";
import {ReactStateString} from "@/types/react";
import Typography from "@mui/material/Typography";
import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";

const INTEREST_RATE = 0.2;

type Props = {
    investmentAmount: string,
    setInvestmentAmount: ReactStateString,
    selectedPlan: string,
    handleSubmit: () => void,
    changePlan: () => void,
}

function StepCreateInvestment(props: Props) {
    const {
        investmentAmount,
        setInvestmentAmount,
        selectedPlan,
        handleSubmit,
        changePlan
    } = props;

    // TODO: retrieve from API
    function planRange(plan: string)  {
        let [min_amount, max_amount] = [NaN, NaN];
        switch (plan) {
            case "starter":
                min_amount = 10_000;
                max_amount = 50_000;
                break;
            case "growth":
                min_amount = 50_000;
                max_amount = 100_000;
                break;
            case "premium":
                min_amount = 100_000;
                max_amount = 500_000;
                break;
        }
        return [min_amount, max_amount];
    }

    function checkPlanRange(min_amount: number, max_amount: number) {
        return Number.isNaN(min_amount) || Number.isNaN(max_amount)
            || !Number.isFinite(min_amount) || !Number.isFinite(max_amount)
    }

    const [amountError, setAmountError] = useState(false);
    const [estimatedInterest, setEstimatedInterest] = useState('0');
    let [min_amount, max_amount] = planRange(selectedPlan);
    const [badRange, setBadRange] = useState(checkPlanRange(min_amount, max_amount));

    function _effect() {
        [min_amount, max_amount] = planRange(selectedPlan);
        setBadRange(checkPlanRange(min_amount, max_amount));
    }

    function handleAmountChange(newValue: string) {
        const amount = parseInt(newValue, 10);
        if (!isNaN(amount)) {
            setEstimatedInterest((amount * INTEREST_RATE).toLocaleString());
        } else {
            setEstimatedInterest('0');
        }
        setAmountError(amount < min_amount || amount > max_amount);
        setInvestmentAmount(newValue);
    }

    useEffect(() => {
        _effect();
        handleAmountChange(investmentAmount);
    }, [selectedPlan]);

    return (
        <>
            <Typography variant='body2' gutterBottom>
                Enter the actual amount you wish to invest in the range of your selected plan, or &nbsp;
                <Link
                    component="button"
                    variant="body2"
                    onClick={changePlan}
                >
                    Change Plan
                </Link>
                .
            </Typography>

            {/* Investment Amount Input */}
            {selectedPlan && (
                <>
                    <TextField
                        label="Investment Amount"
                        type="number"
                        value={investmentAmount}
                        onChange={(e) =>
                            handleAmountChange(e.target.value)
                        }
                        sx={{mb: 2, mt: 1}}
                        helperText={`Enter amount in range KES (${min_amount} - ${max_amount})`}
                        error={amountError}
                        required
                    />

                    <Card variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 1, maxWidth: 'fit-content', pr: 5 }}>
                        <Typography variant="body1" component="p" >
                            Estimated Interest
                        </Typography>
                        <Typography
                            variant="h6"
                            component="p"
                            color="primary"
                            sx={{ fontWeight: 'bold', mt: 0.5 }}
                        >
                            KES {estimatedInterest}
                        </Typography>
                    </Card>
                    <br/>
                </>
            )}

            {/* Submit Button */}
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!selectedPlan || badRange || amountError || !investmentAmount}
            >
                Create Investment
            </Button>

            <br/>
            <Typography variant='caption' sx={{ml: 2, mt: 1, color: 'text.secondary'}}>
                {/* We'll redirect you to make the payment. */}
                Don't worry, we'll request the payment later
            </Typography>
        </>
    )
}

export default StepCreateInvestment;
