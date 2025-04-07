'use client'

import Typography from "@mui/material/Typography";
import React, { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import StepInvestmentPlan from "@/app-components/investment/create/components/StepInvestmentPlan";
import StepInvestmentType from "@/app-components/investment/create/components/StepInvestmentType";
import InvestmentSelection from "@/app-components/investment/create/components/InvestmentSelection";
import StepCreateInvestment from "@/app-components/investment/create/components/StepCreateInvestment";
import GroupForm, { GroupData } from "@/app-components/investment/create/components/GroupForm";
import NumberBadge from '@/app-components/investment/create/NumberBadge';
import { Alert, AlertTitle, Snackbar, Stack, ThemeProvider } from '@mui/material';
import StepAccordion, { } from '@/app-components/investment/create/StepAccordion';
// import AppGroupInvestmentAmountPicker from "@/app-components/AppGroupInvestmentAmountPicker";
import SignUp, { FormDetails } from "./SignUp";
import ColorModeSelect from "@/theme/ColorModeSelect";
import theme from "@/theme";
import { createClient } from "@/utils/supabase/client";
import { FullScreenOverlay } from "@/app-components/loaders/loaders";
import { useRouter } from "next/navigation";
import { paths } from "@/lib/paths";
import { ReferralService } from "@/database/referrals/crud";
import GroupForm2 from "@/app-components-v2/investments/create/GroupForm";
import { GroupFormDataCreate, NewMemberData, UploadFileFunction } from "@/app-components-v2/investments/create/types";
import { uploadGroupFile } from "@/app-components-v2/investments/create/supabase/upload";
import { group_members } from "@/database/buckets";
// import * as InvestmentOps from '@/database/app_investments/investments';
import { GroupMemberInput } from "@/database/app_investments/types";
import { numberOrDefault } from '@/js-utils/convert';
import * as AppInvestmentsClient from "@/app/api/v1/app_investments/investments/client";

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

export default function Main(props: { inviteCode?: string }) {
    const supabase = createClient();
    const [activeStep, setActiveStep] = useState(0);
    const [currentPlan, setCurrentPlan] = useState('');
    const [currentType, setCurrentType] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [termDuration, setTermDuration] = useState('');
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [groupData, setGroupData] = useState<GroupFormDataCreate | null>(null);

    const [openSnackbarAlert, setOpenSnackbarAlert] = useState(false);
    const [snackbarAlertErrorMessage, setSnackbarAlertErrorMessage] = useState('');

    const [overlayOpen, setOverlayOpen] = useState(false);
    const router = useRouter();

    // BEGIN: Stepper controls 
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => {
            const nextStep = prevActiveStep - 1;
            return nextStep < 0 ? prevActiveStep : nextStep;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };
    // END: Stepper controls 


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

    // BEGIN: Group investments

    /**
     * Provides the file upload functionality to the GroupForm component.
     * Delegates the actual upload to the Supabase utility function.
     */
    const handleUploadFile: UploadFileFunction = useCallback(async (file: File) => {
        try {
            // Specify the bucket name you created in Supabase for member IDs
            const bucketName = group_members;
            const url = await uploadGroupFile(file, bucketName);
            return url;
        } catch (uploadError: any) {
            console.error('Upload failed in page component:', uploadError);
            // Re-throw the error so the IdPhotoUpload component can display it
            throw new Error(uploadError.message || 'File upload failed.');
        }
    }, []);

    /**
    * Receives the group information data from the group information form; 
    * including details such as the group's name, description, and members.
    */
    const handleCreateGroupSubmit = useCallback(async (data: GroupFormDataCreate) => {
        setGroupData(data);
        handleNext();
    }, []);

    // END: Group investments

    const OverlayMessages = {
        signUp: "Signing you up...",
        processingReferral: "Attributing your referral...",
        createInvestment: "Creating your investment...",
    }
    const [overlayMessage, setOverlayMessage] = useState(OverlayMessages.createInvestment);

    const handleSignupSubmit = async (values: FormDetails) => {
        setOverlayOpen(true);
        setOverlayMessage(OverlayMessages.signUp);
        console.log(">>> Parent submitting form:", values);
        const { data, error } = await supabase.auth.signUp({
            phone: values.phone,
            password: values.password,
            options: {
                channel: 'sms',
                data: {
                    full_name: values.name,
                    referrer: values.referralCode,
                }
            },
        });

        if (error) {
            console.log('supabase.auth.signUp returned error:', error);
            setSnackbarAlertErrorMessage(error.message);
            setOpenSnackbarAlert(true);
            setOverlayOpen(false);
            return;
        }

        const userId = data?.user?.id;
        if (!userId) {
            console.error('Signup response did not return a valid user id!!');
            setOverlayOpen(false);
            return;
        }

        // --------- User created, now record the investment ----------- 
        setOverlayMessage(OverlayMessages.createInvestment);

        const showError = () => {
            setOpenSnackbarAlert(true);
            setSnackbarAlertErrorMessage('Failed to create investment, contact support');
            setOverlayOpen(false);
        }

        let principal = numberOrDefault(investmentAmount, 0);
        let locked_months = numberOrDefault(termDuration, 0);
        let locked = selectedTerm === "locked";

        if (currentType === 'individual') {
            let createError;
            if (locked) {
                try {
                    const inv_id = await
                        AppInvestmentsClient.createLockedIndividualInvestment({
                            amount: principal,
                            lockedMonths: locked_months
                        });
                    console.log('[ok] created locked individual investment -> id:', inv_id);
                } catch (e) {
                    createError = String(e) ||
                        "[error] failed to create locked individual investment";
                }
            } else {
                try {
                    const inv_id = await
                        AppInvestmentsClient.createNormalIndividualInvestment({ amount: principal });
                    console.log('[ok] created normal individual investment -> id:', inv_id);
                } catch (e) {
                    createError = String(e) ||
                        "[error] failed to create normal individual investment";
                }
            }

            if (createError) {
                showError();
                return;
            }
        } else if (currentType === 'group') {
            // Cast an object of type NewMemberData to ExternalMemberInput
            function convert(a: NewMemberData): AppInvestmentsClient.ExternalMemberInput {
                return {
                    name: a.fullName,
                    phone: a.phoneNumber,
                    nationalId: a.nationalId,
                    titles: [a.title],
                    backPhoto: a.idBackPhotoUrl || '',
                    frontPhoto: a.idFrontPhotoUrl || '',
                };
            }

            let createError;
            if (locked) {
                try {
                    const response = await AppInvestmentsClient
                        .createLockedGroupInvestment({
                            amount: principal,
                            lockedMonths: locked_months,
                            groupName: groupData?.name!!,
                            groupDescription: groupData?.description,
                            externalMembers: groupData?.members.map((member) => convert(member)),
                        });
                    console.log("[ok] created locked group investment -> ", response);
                } catch (e) {
                    createError = error ||
                        "[error] failed to create locked group investment";
                }

            } else {
                try {
                    const response = await AppInvestmentsClient
                        .createNormalGroupInvestment({
                            amount: principal,
                            groupName: groupData?.name!!,
                            groupDescription: groupData?.description,
                            externalMembers: groupData?.members.map((member) => convert(member)),
                        });
                    console.log("[ok] created normal group investment -> ", response);
                } catch (e) {
                    createError = error ||
                        "[error] failed to create normal group investment";
                }
            }

            if (createError) {
                showError();
                return;
            }
        } else {
            console.error('Unhandled investment type:', currentType);
            showError();
            return;
        }

        // ----------------- Register the user's referral -----------------
        setOverlayMessage(OverlayMessages.processingReferral);
        const crud = new ReferralService(supabase);
        const response = await crud.getReferralCodeByCode(values.referralCode);
        if (response.error || !response.data) {
            console.error(response.error);
        }

        const referrerUserId = response.data?.user_id;
        if (referrerUserId) {
            const response = await crud.createReferral(referrerUserId, userId, values.referralCode);
            if (response.error || !response.data) {
                console.error(response.error);
            }
        }

        // ----------------- Sign-up done, move to the next step -----------------
        router.replace(paths.dashboard.overview);
    }

    return (
        <>
            {
                activeStep >= 0 && activeStep < steps.length && <>
                    {/* <Box sx={{ width: '3em', height: '5em' }}></Box> */}
                    <ColorModeSelect sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }} />
                </>
            }

            {
                activeStep === 0 && <>
                    <Typography variant='h5' gutterBottom>
                        Welcome!
                    </Typography>

                    <Typography variant='body1' gutterBottom>
                        We appreciate you considering our platform and
                        are thrilled to have the opportunity to serve you!
                    </Typography>

                    <Typography variant='body1' gutterBottom>
                        Before signing up, we ask for some basic information about your investment details,
                        including the type of investments and the amount you're looking to invest.
                    </Typography>

                    <Typography variant='body1' sx={{ mb: 1.3 }}>
                        This helps us tailor our services to better meet your needs.
                    </Typography>

                </>
            }

            {
                activeStep >= 0 && activeStep < steps.length && <>
                    {/* Steps at a glance accordion */}
                    <div>
                        <StepAccordion>
                            <Box>
                                <Stack direction="row" spacing={1}>
                                    <NumberBadge number={activeStep + 1} size={24} />
                                    <Typography variant='body2'>{steps[activeStep].label}</Typography>
                                </Stack>
                            </Box>
                            <Typography variant='subtitle2'>Steps at a glance</Typography>
                            <VerticalLinearStepper activeStep={activeStep} />
                        </StepAccordion>
                    </div>
                </>
            }

            <Box sx={{ my: 1.5 }} />

            {/* Stepper Tabs */}
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
                {activeStep < steps.length &&
                    <Typography gutterBottom>{steps[activeStep].description}</Typography>
                }
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
                {/* BEGIN: Old group creation UI */}
                {/* {currentType === 'group'
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
                } */}
                {/* END: Old group creation UI */}


                {currentType === 'group'
                    ? <GroupForm2
                        mode="create"
                        onSubmit={handleCreateGroupSubmit}
                        uploadFile={handleUploadFile}
                        // Use 'phoneNumber' as the unique key for members within the form session
                        // Ensure phone numbers are validated for uniqueness client-side 
                        // by GroupForm
                        memberIdKey="phoneNumber"
                        onSecondaryAction={handleBack}
                        secondaryActionLabel="Cancel"
                        submitActionLabel="Create Group"
                        // Disable the form while the page is processing the final submission
                        disabled={false}
                    />
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
                {/* {currentType === 'group'
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
                } */}
                <StepCreateInvestment
                    selectedPlan={currentPlan}
                    investmentAmount={investmentAmount}
                    setInvestmentAmount={setInvestmentAmount}
                    handleSubmit={handleSubmit}
                    changePlan={handleReset} />
            </div>

            <ThemeProvider theme={theme}>
                {/* Step 5: Sign Up */
                    activeStep === steps.length && <>
                        <SignUp
                            onSubmit={handleSignupSubmit}
                            inviteCode={props.inviteCode} />
                    </>
                }
            </ThemeProvider>

            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={openSnackbarAlert}
                onClose={() => { setOpenSnackbarAlert(false) }}
            >
                <Alert
                    onClose={() => { setOpenSnackbarAlert(false) }}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    <AlertTitle>Error creating account</AlertTitle>
                    {snackbarAlertErrorMessage}
                </Alert>
            </Snackbar>

            <FullScreenOverlay
                open={overlayOpen}
                message={overlayMessage} />
        </>
    )
}

// 
// const handleSignupSubmit = async (values: FormDetails) => {
//     setOverlayOpen(true);
//     console.log(">>> Parent submitting form:", values);
//     const { data, error } = await supabase.auth.signUp({
//         phone: values.phone,
//         password: values.password,
//         options: {
//             channel: 'sms',
//             data: {
//                 full_name: values.name,
//                 referrer: values.referralCode,
//             }
//         },
//     });

//     if (error) {
//         setSnackbarAlertErrorMessage(error.message);
//         setOpenSnackbarAlert(true);
//         setOverlayOpen(false);
//         return;
//     }

//     const userId = data?.user?.id;
//     if (!userId) {
//         console.error('Signup response did not return a valid user id!!');
//         setOverlayOpen(false);
//         return;
//     }

//     // User created, now add the investment

//     const showError = () => {
//         setOpenSnackbarAlert(true);
//         setSnackbarAlertErrorMessage('Failed to create investment, contact support');
//         setOverlayOpen(false);
//     }

//     let principal = 0;
//     try {
//         principal = Number.parseInt(investmentAmount, 10);
//     } catch (e) {
//         console.error(e);
//         principal = 0;
//     }

//     let locked_months = 0;
//     try {
//         locked_months = Number.parseInt(termDuration, 10)
//     } catch (e) {
//         console.error(e);
//         locked_months = 0;
//     }

//     if (!locked_months) {
//         locked_months = 0;
//     }

//     if (!principal) {
//         principal = 0;
//     }

//     let headersList = {
//         "Content-Type": "application/json"
//     }

//     if (currentType === 'individual') {
//         let bodyContent = JSON.stringify({
//             "user_id": userId,
//             "principal": principal,
//             "inv_type": selectedTerm === "locked" ? "locked" : "normal",
//             "locked_months": locked_months,
//         });

//         let response = await fetch("/api/v1/investments/individual", {
//             method: "POST",
//             body: bodyContent,
//             headers: headersList
//         });

//         if (response.ok) {
//             try {
//                 let data = await response.json();
//                 console.log(data);
//             } catch (e) {
//                 console.error(e);
//                 setOverlayOpen(false);
//                 return;
//             }

//         } else {
//             showError();
//         }

//     } else if (currentType === 'group') {
//         if (!groupData) {
//             console.error("groupData is invalid:", groupData);
//             showError();
//             return;
//         }

//         let bodyContent = JSON.stringify({
//             "group_name": groupData.name,
//             "group_description": groupData.description ? groupData.description : "",
//             "inv_type": selectedTerm === "locked" ? "locked" : "normal",
//             "locked_months": locked_months,
//             "members": !groupData.members
//                 ? []
//                 : groupData.members.map(member => ({
//                     phone_number: member.value,
//                     full_name: "",
//                     national_id_number: "",
//                     positions: [member.post.toLowerCase()] // Make sure the post is lowercase
//                 })),
//         });

//         let response = await fetch("/api/v1/investments/group", {
//             method: "POST",
//             body: bodyContent,
//             headers: headersList
//         });

//         if (response.ok) {
//             try {
//                 let data = await response.json();
//                 console.log(data);

//             } catch (e) {
//                 console.error(e);
//                 setOverlayOpen(false);
//                 return;
//             }

//         } else {
//             showError();
//         }
//     } else {
//         console.error('Unhandled investment type: ', currentType);
//         showError();
//         return;
//     }

//     // Register the user's referral
//     const crud = new ReferralService(supabase);
//     const response = await crud.getReferralCodeByCode(values.referralCode);
//     if (response.error || !response.data) {
//         console.error(response.error);
//     }

//     const referrerUserId = response.data?.user_id;
//     if (referrerUserId) {
//         const response = await crud.createReferral(referrerUserId, userId, values.referralCode);
//         if (response.error || !response.data) {
//             console.error(response.error);
//         }
//     }

//     router.replace(paths.dashboard.overview);
// }
