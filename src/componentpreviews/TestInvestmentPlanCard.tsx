'use client'

import React, {ReactNode, useState} from "react";
import Stack from "@mui/material/Stack";
import InvestmentPlanCard, {
    DefaultInvestmentPlanCardProps,
    InvestmentPlanCardProps
} from "@/customcomponents/InvestmentPlanCard";

function TestInvestmentComponent({ children }: { children?: ReactNode }) {
    const products = [
        {
            recommended: false,
            recommendedText: "",
            plan: "Starter",
            price: "KES 10,000",
            priceIntro: "from",
            features: [
                'Investment Range: $100 - $499',
                '10% Monthly Returns',
                'Best For: New investors, low-risk introduction',
                'Key Benefits: Minimal entry, full flexibility',
            ],
            actionText: "Get Started",
        },

        {
            recommended: true,
            recommendedText: "Recommended",
            plan: "Growth",
            price: "KES 50,000",
            priceIntro: "from",
            features: [
                'Investment Range: $100 - $499',
                '10% Monthly Returns',
                'Best For: New investors, low-risk introduction',
                'Key Benefits: Minimal entry, full flexibility',
            ],
            actionText: "Let's Do This",
        },

        {
            recommended: false,
            recommendedText: "",
            plan: "Premium",
            price: "KES 100,000",
            priceIntro: "from",
            features: [
                'Investment Range: $100 - $499',
                '10% Monthly Returns',
                'Best For: New investors, low-risk introduction',
                'Key Benefits: Minimal entry, full flexibility',
            ],
            actionText: "Go For It",
        },
    ].map(plan => ({
        ...DefaultInvestmentPlanCardProps,  // Merge default values
        ...plan,                 // Overwrite with provided values
    }));

    const [currentPlan, setCurrentPlan] = useState('');
    const selectionCards: InvestmentPlanCardProps[] = [
        {
            selectionModeProps: {
                name: 'plan-selection',
                value: 'starter',
                stateCurrentValue: currentPlan,
                stateSetCurrentValue: setCurrentPlan,
            },
            recommended: false,
            recommendedText: "",
            plan: "Starter",
            price: "KES 10,000",
            priceIntro: "from",
            features: [
                'Investment Range: $100 - $499',
                '10% Monthly Returns',
                'Best For: New investors, low-risk introduction',
                'Key Benefits: Minimal entry, full flexibility',
            ],
            actionText: "Get Started",
        },

        {
            selectionModeProps: {
                name: "plan-selection",
                value: "growth",
                stateCurrentValue: currentPlan,
                stateSetCurrentValue: setCurrentPlan,
            },
            recommended: true,
            recommendedText: "Recommended",
            plan: "Growth",
            price: "KES 50,000",
            priceIntro: "from",
            features: [
                'Investment Range: $100 - $499',
                '10% Monthly Returns',
                'Best For: New investors, low-risk introduction',
                'Key Benefits: Minimal entry, full flexibility',
            ],
            actionText: "Let's Do This",
        },
    ]
    const emptyCards: InvestmentPlanCardProps[] = [
        {...DefaultInvestmentPlanCardProps},

        {
            recommended: false,
            recommendedText: "",
            plan: "Free",
            price: "",
            priceIntro: "",
            features: [],
            actionText: "",
        },

        {
            recommended: true,
            recommendedText: "Recommended",
            plan: "Growth",
            price: "",
            priceIntro: "",
            features: [],
            actionText: "",
        },
    ]

    return (
        <>
            <Stack direction={'row'} spacing={2}>
                {products.map((product, index) => (
                    <InvestmentPlanCard {...product} key={index}/>
                ))}
            </Stack>
            <div>Selection Mode:</div>
            <Stack direction={'row'} spacing={2}>
                {selectionCards.map((product, index) => (
                    <InvestmentPlanCard {...product} key={index}/>
                ))}
            </Stack>

            <div>Partial Mode:</div>
            <Stack direction={'row'} spacing={2}>
                {emptyCards.map((product, index) => (
                    <InvestmentPlanCard {...product} key={index}/>
                ))}
            </Stack>
            {children}
        </>
    )
}

export default TestInvestmentComponent;
