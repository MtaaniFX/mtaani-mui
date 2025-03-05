import {Button, Link, TextField} from "@mui/material";
import {ReactStateString} from "@/types/react";
import Typography from "@mui/material/Typography";
import {useEffect, useState} from "react";

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
    let [min_amount, max_amount] = planRange(selectedPlan);
    const [badRange, setBadRange] = useState(checkPlanRange(min_amount, max_amount));

    function _effect() {
        [min_amount, max_amount] = planRange(selectedPlan);
        setBadRange(checkPlanRange(min_amount, max_amount));
    }

    function handleAmountChange(newValue: string) {
        const amount = parseInt(newValue, 10);
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
