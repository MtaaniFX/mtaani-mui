'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ColorModeSelect from '@/theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '@/components/CustomIcons';
import { InputAdornment, OutlinedInput, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { validatePhoneNumber } from '@/utils/validations';
import ReactMarkdown from 'react-markdown';
import { Terms } from "@/const";
import {FaviconRow} from "@/components/internal/icons/Favicon";

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  // height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

// Social Authentication buttons container 
const SocialAuth = (
  <>
    <Divider>
      <Typography sx={{ color: 'text.secondary' }}>or</Typography>
    </Divider>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={() => alert('Sign up with Google')}
        startIcon={<GoogleIcon />}
      >
        Sign up with Google
      </Button>
      <Button
        fullWidth
        variant="outlined"
        onClick={() => alert('Sign up with Facebook')}
        startIcon={<FacebookIcon />}
      >
        Sign up with Facebook
      </Button>
      <Typography sx={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <Link
          href="/material-ui/getting-started/templates/sign-in/"
          variant="body2"
          sx={{ alignSelf: 'center' }}
        >
          Sign in
        </Link>
      </Typography>
    </Box>
  </>
);

// Custom Checkbox component
const ControlledCheckbox = ({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
    <Checkbox checked={checked} readOnly color="primary" />
    <span>{label}</span>
  </div>
);

export type FormDetails = {
  name: string,
  password: string,
  phone: string,
}

export default function SignUp(props: { onSubmit?: (values: FormDetails) => void }) {
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');

  const [phoneError, setPhoneError] = React.useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = React.useState('');

  const theme = useTheme();
  // Section: Hide or show the password field
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  // const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  // };

  // Section: Terms and conditions
  const [isChecked, setIsChecked] = React.useState(false); // To track checkbox state
  const [dialogOpen, setDialogOpen] = React.useState(false); // To track if the dialog is open
  // To track if there's a form error, i.e, the user did not accept the T&C's
  const [formError, setFormError] = React.useState(false);

  // Handle checkbox click (open the dialog)
  const handleCheckboxClick = () => {
    if (!isChecked) {
      // Show dialog if user attempts to check the box
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
      setIsChecked(!isChecked);
    }
  };

  // Handle dialog close and accept terms
  const handleDialogClose = (accepted: boolean) => {
    setDialogOpen(false);
    if (accepted) {
      setIsChecked(true); // If terms accepted, check the box
    } else {
      setIsChecked(false); // If terms declined, uncheck the box
    }
  };

  // Section: Form validation and submission
  const validateInputs = () => {
    const phone = document.getElementById('phone') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const name = document.getElementById('name') as HTMLInputElement;

    let isValid = true;

    const { phoneNumber, error } = validatePhoneNumber(phone.value);
    if (phoneNumber) {
      setPhoneError(false);
      setPhoneErrorMessage('');
    } else {
      setPhoneError(true);
      console.log(`phone error: ${error}`);
      setPhoneErrorMessage('Please enter a valid phone number.');
      isValid = false;
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    // Check if the user has checked the terms and conditions
    if (!isChecked) {
      // Show error if checkbox isn't checked
      setFormError(true);
      isValid = false;
    } else {
      // No error, proceed with form submission
      setFormError(false);
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (nameError || passwordError || phoneError || !isChecked) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const formDetails: FormDetails = {
      name: data.get('name')!.toString(),
      phone: data.get('phone')!.toString(),
      password: data.get('password')!.toString(),
    };

    // submit the phone number in international format
    const { phoneNumber } = validatePhoneNumber(formDetails.phone);
    formDetails.phone = phoneNumber!;
    console.log('submitting form:', formDetails);

    if (props.onSubmit) {
      props.onSubmit(formDetails);
    }
  };
  
  return (
    <>
    <Box sx={{width: '3rem', height: '3rem'}}></Box>
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <FaviconRow />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Create account
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="John Snow"
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="phone">Phone number</FormLabel>
              <TextField
                required
                fullWidth
                id="phone"
                placeholder="07•••••••• or 01••••••••"
                name="phone"
                autoComplete="phone"
                variant="outlined"
                error={phoneError}
                helperText={phoneErrorMessage}
                color={phoneError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                required
                fullWidth
                autoComplete="new-password"
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
            <Box sx={{ ml: 0.2 }}>
              <ControlledCheckbox
                checked={isChecked}
                onClick={handleCheckboxClick}
                label="I agree to the terms and conditions"
              />
            </Box>

            {formError && (
              <Typography color="error" variant="body2">
                &nbsp;&nbsp;• You must agree to the terms and conditions to proceed.
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Sign up
            </Button>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  variant="body2"
                  sx={{ alignSelf: 'center' }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>

        </Card>
      </SignUpContainer>

      {/* Terms and Conditions Dialog */}
      <Dialog open={dialogOpen} onClose={() => handleDialogClose(false)}>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Please review and accept the terms and conditions before proceeding.
          </Typography>
          <ReactMarkdown>
            {Terms}
          </ReactMarkdown>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            Decline
          </Button>
          <Button variant='contained' onClick={() => handleDialogClose(true)} color="primary">
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
