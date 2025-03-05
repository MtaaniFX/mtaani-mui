import React, {ReactNode} from "react";
import InvestmentPlanCard, {
    InvestmentPlanCardProps
} from "@/customcomponents/InvestmentPlanCard";
import {ReactStateString} from "@/types/react";
import {Grid2 as Grid} from "@mui/material";

function StepInvestmentType({ children, currentType, setCurrentType }: { children?: ReactNode, currentType: string, setCurrentType: ReactStateString }) {
    const selectionCards: InvestmentPlanCardProps[] = [
        {
            selectionModeProps: {
                name: 'type-selection',
                value: 'individual',
                stateCurrentValue: currentType,
                stateSetCurrentValue: setCurrentType,
            },
            recommended: true,
            recommendedText: "Recommended",
            plan: "Individual",
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
                name: 'type-selection',
                value: 'group',
                stateCurrentValue: currentType,
                stateSetCurrentValue: setCurrentType,
            },
            recommended: false,
            recommendedText: "",
            plan: "Group",
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
            <Grid container
                  spacing={{xs: 2, md: 3}}
                  sx={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                  }}>
                {selectionCards.map((product, index) => (
                    <Grid key={index} size={{xs: 12, md: 6, lg: 4}} >
                        <InvestmentPlanCard {...product} key={index}/>
                    </Grid>
                ))}
            </Grid>
            {children}
        </>
    )
}

export default StepInvestmentType;
