import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FaviconRow } from '@/components/internal/icons/Favicon';
import { paths } from "@/lib/paths";
import UnderConstructionDialogue from "@/components/internal/ui/UnderConstructionDialogue";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, InputAdornment, OutlinedInput, Snackbar, useTheme } from "@mui/material";
import { MtCard } from '@/components/internal/styled/MtCard';
import { validatePhoneNumber } from '@/utils/validations';
import { FullScreenOverlay } from '@/app-components/loaders/loaders';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const supabase = createClient();

export default function SignInCard() {
    const [emailOrPhoneError, setEmailOrPhoneError] = React.useState(false);
    const [emailOrPhoneErrorMessage, setEmailOrPhoneErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [underConstruction, setUnderConstruction] = React.useState(false);
    const [submissionError, setSubmissionError] = React.useState(false);
    const [openOverlay, setOpenOverlay] = React.useState(false);
    const [submissionMessage, setSubmissionMessage] = React.useState('');
    const router = useRouter();
    const theme = useTheme();

    // Section: Hide or show the password field
    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setOpenOverlay(true);
        const deferred = () => {
            setOpenOverlay(false);
        };

        if (emailOrPhoneError || passwordError) {
            deferred();
            return;
        }

        const formData = new FormData(event.currentTarget);
        const emailOrPhone = formData.get('email-or-phone');
        const password = formData.get('password');

        if (!emailOrPhone || !password) {
            deferred();
            return
        }

        // let error;
        // if(/\S+@\S+\.\S+/.test(emailOrPhone as string)){
        //     console.log('logging in with email: ', emailOrPhone);
        //     error = await supabase.auth.signInWithPassword({
        //         email: emailOrPhone as string,
        //         password: password as string,
        //     });
        // } else {
        //     console.log('logging in with phone: ', emailOrPhone);
        //     error = await supabase.auth.signInWithPassword({
        //         phone: emailOrPhone as string,
        //         password: password as string,
        //     });
        // }

        // error = error.error;

        // const { error } = /\S+@\S+\.\S+/.test(emailOrPhone as string)
        //     ? await supabase.auth.signInWithPassword({
        //         email: emailOrPhone as string,
        //         password: password as string,
        //     }) : await supabase.auth.signInWithPassword({
        //         phone: emailOrPhone as string,
        //         password: password as string,
        //     });

        let error: string | null = null;
        if (/\S+@\S+\.\S+/.test(emailOrPhone as string)) {
            console.log('logging in with email: ', emailOrPhone);
            const signInData = await supabase.auth.signInWithPassword({
                email: emailOrPhone as string,
                password: password as string,
            });

            if (signInData.error) {
                error = signInData.error.message;
            }

        } else {
            // console.log('logging in with phone: ', emailOrPhone);
            // try {
            //     await loginWithPhone(emailOrPhone as string, password as string);
            // } catch {
            //     error = "Login Failed";
            // }
            console.log('signing in with phone');
            const { phoneNumber } = validatePhoneNumber(emailOrPhone as string);
            const response = await supabase.auth.signInWithPassword({
                phone: phoneNumber!,
                password: password as string,
            });
            console.log('done -> response:', response);

            if (response.error) {
                error = response.error?.message;
            }
        }


        if (error) {
            setSubmissionError(true);
            setSubmissionMessage(error);
            deferred();
            return
        }

        setTimeout(() => {
            const url = new URL(window.location.href);
            const redirectTo = url.searchParams.get("next");

            if (redirectTo) {
                router.replace(redirectTo);
            } else {
                console.log('redirecting to dashboard: ')
                router.replace(paths.dashboard.overview);
                console.log('done: -> redirecting to dashboard: ')
            }
        }, 200);
    };

    const validateInputs = () => {
        const emailOrPhone = document.getElementById('email-or-phone') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        setSubmissionError(false);

        let isValid = true;
        const validEmailOrPhone = /\S+@\S+\.\S+/.test(emailOrPhone.value) ||
            /^[+]*[0-9]{7,15}$/.test(emailOrPhone.value);

        if (!emailOrPhone.value || !validEmailOrPhone) {
            setEmailOrPhoneError(true);
            setEmailOrPhoneErrorMessage('Please enter a valid email address/phone.');
            isValid = false;
        } else {
            setEmailOrPhoneError(false);
            setEmailOrPhoneErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    return (
        <MtCard variant="outlined">
            <UnderConstructionDialogue
                open={underConstruction}
                setOpen={setUnderConstruction} />
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={submissionError} >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={() => { setSubmissionError(false); }}
                    sx={{ width: '100%' }}
                >
                    <AlertTitle>Error</AlertTitle>
                    {submissionMessage}
                </Alert>
            </Snackbar>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <FaviconRow />
            </Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Sign in
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >
                <FormControl>
                    <FormLabel htmlFor="email-or-phone">Phone</FormLabel>
                    <TextField
                        error={emailOrPhoneError}
                        helperText={emailOrPhoneErrorMessage}
                        id="email-or-phone"
                        name="email-or-phone"
                        placeholder="07xxx or 01xxx"
                        autoComplete="tel"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailOrPhoneError ? 'error' : 'primary'}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                            href={paths.auth.resetPassword}
                            variant="body2"
                            sx={{ alignSelf: 'baseline' }}
                        >
                            Forgot your password?
                        </Link>
                    </Box>
                    <OutlinedInput
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        required
                        autoFocus
                        fullWidth
                        autoComplete="current-password"
                        error={passwordError}
                        // helperText={passwordErrorMessage}
                        color={passwordError ? 'error' : 'primary'}
                        endAdornment={
                            <InputAdornment position="end">
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: "center",
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        width: '40px',
                                        height: '40px',
                                        transition: 'background-color 0.3s ease',  // Smooth transition on hover
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,  // Change background on hover
                                        },
                                        transform: 'translate(12px)',
                                    }}
                                    onClick={handleClickShowPassword}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </Box>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                    {passwordError && (
                        <Typography color="error" variant="caption">
                            &nbsp;&nbsp;&nbsp;&nbsp;{passwordErrorMessage}
                        </Typography>
                    )}
                </FormControl>
                <Box sx={{ ml: 1 }}>
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    />
                </Box>

                <Button type="submit" fullWidth variant="contained" onClick={validateInputs}>
                    Sign in
                </Button>
                <Typography sx={{ textAlign: 'center' }}>
                    Don&apos;t have an account?{' '}
                    <span>
                        <Link
                            href={paths.auth.signUp}
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                        >
                            Sign up
                        </Link>
                    </span>
                </Typography>
            </Box>
            {/* <Divider>or</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setUnderConstruction(true)}
                    startIcon={<GoogleIcon />}
                >
                    Sign in with Google
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setUnderConstruction(true)}
                    startIcon={<FacebookIcon />}
                >
                    Sign in with Facebook
                </Button>
            </Box> */}
            <FullScreenOverlay open={openOverlay} message='Signing you in...' />
        </MtCard>
    );
}
