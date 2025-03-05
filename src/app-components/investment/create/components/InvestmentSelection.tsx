import React from 'react';
import {
    Box,
    Button,
    Grid2 as Grid,
    Typography
} from '@mui/material';
import InvestmentPlanCard, { InvestmentPlanCardProps } from "@/customcomponents/InvestmentPlanCard";
import { ReactStateString } from "@/types/react";
import AppInvestmentDurationPicker from '@/app-components/AppInvestmentDurationPicker';

type Props = {
    children?: React.ReactNode,
    selectedTerm: string,
    setSelectedTerm: ReactStateString,
}

function InvestmentTerms({ children, selectedTerm, setSelectedTerm }: Props) {
    const selectionCards: InvestmentPlanCardProps[] = [
        {
            selectionModeProps: {
                name: 'terms-selection',
                value: 'normal',
                stateCurrentValue: selectedTerm,
                stateSetCurrentValue: setSelectedTerm,
            },
            recommended: false,
            recommendedText: "Recommended",
            plan: "Normal",
            price: "",
            priceIntro: "",
            features: [
                'Be your own boss',
                'Set your goals',
                'Fund at your own pace',
            ],
            actionText: "",
        },

        {
            selectionModeProps: {
                name: 'terms-selection',
                value: 'locked',
                stateCurrentValue: selectedTerm,
                stateSetCurrentValue: setSelectedTerm,
            },
            recommended: false,
            recommendedText: "",
            plan: "Locked",
            price: "",
            priceIntro: "",
            features: [
                'Manage investments in the group',
                'Outline group goals',
                'Faster funding, huge investments',
            ],
            actionText: "",
        },
    ];

    return (
        <>
            <Typography gutterBottom>
                Choose from our flexible investment options; monthly payouts or fixed-term returns
            </Typography>
            <Grid container
                spacing={{ xs: 2, md: 3 }}
                sx={{
                    justifyContent: "flex-start",
                    alignItems: "center",
                }}>
                {selectionCards.map((product, index) => (
                    <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }} >
                        <Box>
                            <InvestmentPlanCard {...product} key={index} />
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {children}
        </>
    )
}

type PageProps = {
    children?: React.ReactNode,
    selectedTerm: string,
    setSelectedTerm: ReactStateString,
    termDuration: string,
    setTermDuration: ReactStateString,
    handleNext: () => void,
    handleBack: () => void,
}

export default function InvestmentSelection(props: PageProps) {
    const {
        selectedTerm,
        setSelectedTerm,
        termDuration,
        setTermDuration,
        handleBack,
        handleNext,
    } = props;

    return (
        <div>
            {/* Investment Type Selection */}
            <InvestmentTerms
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm} />

            {/* Conditional Rendering for Locked Term */}
            {selectedTerm === 'locked' && (
                <div>
                    <AppInvestmentDurationPicker
                        durationInMonths={termDuration}
                        setDurationInMonths={setTermDuration} />
                </div>
            )}

            <Box sx={{ mb: 2, mt: 2 }}>
                <Button
                    disabled={!(selectedTerm === 'normal' || !!selectedTerm && !!termDuration)}
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mr: 1 }}
                >
                    Next
                </Button>
                <Button
                    disabled={false}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                >
                    Back
                </Button>
            </Box>
        </div>
    );
};
