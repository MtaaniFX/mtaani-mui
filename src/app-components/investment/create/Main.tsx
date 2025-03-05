'use client'

import Typography from "@mui/material/Typography";
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import StepInvestmentPlan from "./components/StepInvestmentPlan";
import StepInvestmentType from "./components/StepInvestmentType";
import InvestmentSelection from "./components/InvestmentSelection";
import StepCreateInvestment from "./components/StepCreateInvestment";
import GroupForm, { GroupData } from "./components/GroupForm";
import NumberBadge from './NumberBadge';
import { Stack } from '@mui/material';
import StepAccordion, { } from './StepAccordion';
import AppGroupInvestmentAmountPicker from "@/app-components/AppGroupInvestmentAmountPicker";

const steps = [
    {
        label: "Choose an Investment Plan",
        description: "Based on your investment goals, here are some investment plans we offer.",
    },

    {
        label: "Set your Investment Goals",
        description: "Having your goals as an individual, or with a group of friends or community? " +
            "We've got you covered.",
    },

    {
        label: "Investment Details",
        description: "",
    },

    {
        label: "Investment Amount",
        description: "",
    },
];

function VerticalLinearStepper({ activeStep }: { activeStep: number }) {
    return (
        <Box sx={{ maxWidth: 400 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel
                            optional={
                                index === steps.length - 1 ? (
                                    <Typography variant="caption">Last step</Typography>
                                ) : null
                            }
                        >
                            {step.label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}

export default function Main() {
    const [activeStep, setActiveStep] = useState(0);
    const [currentPlan, setCurrentPlan] = useState('');
    const [currentType, setCurrentType] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [termDuration, setTermDuration] = useState('');
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [groupData, setGroupData] = useState<GroupData | null>(null);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => {
            const nextStep = prevActiveStep - 1;
            if (nextStep < 0) {
                return prevActiveStep;
            }
            return nextStep;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    function handleCreateGroup(groupData: GroupData) {
        setGroupData(groupData);
        handleNext();
    }

    function handleSubmit() {
        // First finish the steps in the stepper
        handleNext();
        console.log("Submitting:", {
            currentPlan,
            currentType,
            selectedTerm,
            termDuration,
            investmentAmount,
            groupData
        });
    }

    return (
        <>
            <Typography variant='h5' gutterBottom>
                Create Investment
            </Typography>

            <Typography gutterBottom>
                This wizard will help you come up with an investment plan tailored for your needs.
            </Typography>

            {/* Steps at a glance accordion */}
            <div>
                <StepAccordion>
                    <Box>
                        <Stack direction="row" spacing={1}>
                            <NumberBadge number={activeStep + 1} size={24} />
                            <Typography variant='body2'>{steps[activeStep].label}</Typography>
                        </Stack>
                    </Box>
                    <Typography variant='h6'>Steps at a glance</Typography>
                    <VerticalLinearStepper activeStep={activeStep} />
                </StepAccordion>
            </div>

            <Box sx={{ my: 1.5 }} />

            {/* Step Tabs */}
            {/* Step 1 */}
            <div style={{ display: activeStep === 0 ? "block" : "none" }}>
                {/* <Typography gutterBottom>{steps[activeStep].description}</Typography> */}
                <StepInvestmentPlan
                    currentPlan={currentPlan}
                    setCurrentPlan={setCurrentPlan}>
                </StepInvestmentPlan>
                <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                        disabled={!currentPlan}
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mr: 1 }}
                    >
                        Next
                    </Button>
                    <Button
                        disabled={true}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                    >
                        Back
                    </Button>
                </Box>
            </div>

            {/* Step 2 */}
            <div style={{ display: activeStep === 1 ? "block" : "none" }}>
                <Typography gutterBottom>{steps[activeStep].description}</Typography>
                <StepInvestmentType
                    currentType={currentType}
                    setCurrentType={setCurrentType} />
                <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                        disabled={!currentType}
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

            {/* Step 3 */}
            <div style={{ display: activeStep === 2 ? "block" : "none" }}>
                {currentType === 'group'
                    ? <GroupForm
                        handleBack={handleBack}
                        handleCreateGroup={handleCreateGroup} />
                    : <InvestmentSelection
                        selectedTerm={selectedTerm}
                        setSelectedTerm={setSelectedTerm}
                        termDuration={termDuration}
                        setTermDuration={setTermDuration}
                        handleNext={handleNext}
                        handleBack={handleBack} />
                }
            </div>

            {/* Step 4 */}
            <div style={{ display: activeStep === 3 ? "block" : "none" }}>
                {currentType === 'group'
                    ? <>
                        <AppGroupInvestmentAmountPicker
                            investmentAmount={investmentAmount}
                            setInvestmentAmount={setInvestmentAmount}
                            handleBack={handleBack}
                            handleSubmit={handleSubmit} />
                    </>
                    : <StepCreateInvestment
                        selectedPlan={currentPlan}
                        investmentAmount={investmentAmount}
                        setInvestmentAmount={setInvestmentAmount}
                        handleSubmit={handleSubmit}
                        changePlan={handleReset} />
                }
            </div>
        </>
    )
}
