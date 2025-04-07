// src/components/MemberFormDialog.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress,
    Grid,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import IdPhotoUpload from './IdPhotoUpload'; // Import the component we created
import {
    GROUP_TITLES,
    GroupTitle,
    NewMemberData,
    UploadFileFunction,
} from './types'; // Import shared types

/**
 * Props for the MemberFormDialog component.
 */
interface MemberFormDialogProps {
    /** Controls the visibility of the dialog */
    open: boolean;
    /** Callback function when the dialog should be closed */
    onClose: () => void;
    /** Callback function when the form is submitted with valid new member data */
    onSubmit: (newMember: NewMemberData) => void;
    /** Set of phone numbers already present in the group list (for duplicate check) */
    existingPhoneNumbers: Set<string>;
    /** Function provided by the parent to handle file uploads */
    uploadFile: UploadFileFunction;
    /** Optional: Indicates if the parent is currently processing the submission */
    isSubmitting?: boolean; // Use this to disable buttons during parent processing
}

// Helper type for managing upload state for each photo
type PhotoUploadState = {
    file: File | null;
    isUploading: boolean;
    error: string | null;
    url: string | null; // Store the URL once uploaded
    isSuccess: boolean;
};

/**
 * A dialog component containing a form to add a new member to the group.
 */
const MemberFormDialog: React.FC<MemberFormDialogProps> = ({
    open,
    onClose,
    onSubmit,
    existingPhoneNumbers,
    uploadFile,
    isSubmitting = false, // Receive submitting state from parent
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Form field states
    const [fullName, setFullName] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [title, setTitle] = useState<GroupTitle>('member'); // Default title
    const [phoneNumber, setPhoneNumber] = useState('');

    // Photo upload states
    const initialPhotoState: PhotoUploadState = { file: null, isUploading: false, error: null, url: null, isSuccess: false };
    const [frontPhotoState, setFrontPhotoState] = useState<PhotoUploadState>(initialPhotoState);
    const [backPhotoState, setBackPhotoState] = useState<PhotoUploadState>(initialPhotoState);

    // Form validation errors
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    // General loading state for uploads within the dialog
    const [isUploadingInternally, setIsUploadingInternally] = useState(false);

    // Derived state: check if any file is currently being uploaded
    const isAnyPhotoUploading = frontPhotoState.isUploading || backPhotoState.isUploading || isUploadingInternally;
    // Overall disabled state for inputs/buttons
    const isDisabled = isAnyPhotoUploading || isSubmitting;

    // Reset form state when dialog closes or successfully submits
    const resetForm = useCallback(() => {
        setFullName('');
        setNationalId('');
        setTitle('member');
        setPhoneNumber('');
        setErrors({});
        setFrontPhotoState(initialPhotoState);
        setBackPhotoState(initialPhotoState);
        setIsUploadingInternally(false);
        // Note: We don't call onClose here, parent does after onSubmit potentially
    }, []); // No dependencies needed as it uses setters only

    // Effect to reset form when dialog is closed externally
    useEffect(() => {
        if (!open) {
            // Add a small delay to allow closing animation before reset
            const timer = setTimeout(() => {
                resetForm();
            }, 300); // Adjust timing if needed
            return () => clearTimeout(timer);
        }
    }, [open, resetForm]);


    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string | null } = {};
        let isValid = true;

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
            isValid = false;
        }
        if (!nationalId.trim()) {
            newErrors.nationalId = 'National ID is required';
            isValid = false;
        }
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
            isValid = false;
        } else if (existingPhoneNumbers.has(phoneNumber.trim())) {
             // Check for duplicates (case-insensitive/trimming might be needed depending on requirements)
             newErrors.phoneNumber = 'This phone number is already in the group';
             isValid = false;
        }
        // Add more specific phone number format validation if needed (regex)

        setErrors(newErrors);
        return isValid;
    };

    const handlePhotoSelect = (
        type: 'front' | 'back',
        file: File | null
    ) => {
        const stateSetter = type === 'front' ? setFrontPhotoState : setBackPhotoState;
        stateSetter(prev => ({
            ...prev,
            file: file,
            error: null, // Clear error on new selection
            url: null, // Clear previous URL if a new file is selected
            isSuccess: false, // Reset success state
        }));
         // Clear general phone number error if user interacts with photos
         if (errors.phoneNumber) {
            setErrors(prev => ({ ...prev, phoneNumber: null }));
        }
    };

    const handlePhotoRemove = (type: 'front' | 'back') => {
        const stateSetter = type === 'front' ? setFrontPhotoState : setBackPhotoState;
         // Reset specific photo state completely on removal
        stateSetter(initialPhotoState);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsUploadingInternally(true); // Indicate processing starts
        let frontUrl: string | null = null;
        let backUrl: string | null = null;
        let uploadErrorOccurred = false;

        try {
            // Upload Front Photo if selected
            if (frontPhotoState.file) {
                setFrontPhotoState(prev => ({ ...prev, isUploading: true, error: null, isSuccess: false }));
                try {
                    frontUrl = await uploadFile(frontPhotoState.file);
                    setFrontPhotoState(prev => ({ ...prev, isUploading: false, url: frontUrl, isSuccess: true }));
                } catch (error: any) {
                    console.error("Front photo upload failed:", error);
                    setFrontPhotoState(prev => ({ ...prev, isUploading: false, error: error.message || 'Upload failed', isSuccess: false }));
                    uploadErrorOccurred = true;
                }
            }

            // Upload Back Photo if selected (only proceed if front didn't fail)
            if (backPhotoState.file && !uploadErrorOccurred) {
                 setBackPhotoState(prev => ({ ...prev, isUploading: true, error: null, isSuccess: false }));
                try {
                    backUrl = await uploadFile(backPhotoState.file);
                    setBackPhotoState(prev => ({ ...prev, isUploading: false, url: backUrl, isSuccess: true }));
                } catch (error: any) {
                    console.error("Back photo upload failed:", error);
                    setBackPhotoState(prev => ({ ...prev, isUploading: false, error: error.message || 'Upload failed', isSuccess: false }));
                    uploadErrorOccurred = true;
                }
            }

            // If any upload failed, stop here
            if (uploadErrorOccurred) {
                setIsUploadingInternally(false); // Stop overall loading
                // Optionally set a general error message?
                return;
            }

            // If all uploads successful (or no uploads needed), prepare data and submit
            const newMemberData: NewMemberData = {
                fullName: fullName.trim(),
                nationalId: nationalId.trim(),
                title: title,
                phoneNumber: phoneNumber.trim(),
                idFrontPhotoUrl: frontUrl,
                idBackPhotoUrl: backUrl,
            };

            onSubmit(newMemberData); // Pass data to parent
            // Parent will set its isSubmitting state and eventually call onClose
            // We can reset the form here *if* the parent doesn't close the dialog immediately
            // resetForm(); // Let's assume parent handles closing, which triggers reset via useEffect

        } catch (error) {
            // Catch any unexpected errors during the process
            console.error("Error during member submission:", error);
            setErrors(prev => ({ ...prev, form: 'An unexpected error occurred.' })); // General error
        } finally {
             // Only set internal uploading to false if no parent submission is happening
            // If parent handles submission async, it should control the overall disabled state via isSubmitting prop
            if (!isSubmitting) {
                 setIsUploadingInternally(false);
            }
            // Note: isSubmitting prop from parent takes precedence for disabling buttons
        }
    };

    const handleClose = () => {
        // Prevent closing if uploads are in progress? Or let parent decide?
        // For now, allow closing, uploads might be cancelled by parent logic if needed.
        if (!isAnyPhotoUploading) { // Only allow close if nothing is actively uploading
             onClose();
        }
        // If we need to prevent close during upload, add logic here.
    };


    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile} // Make dialog full screen on small devices
            aria-labelledby="add-member-dialog-title"
        >
            <DialogTitle id="add-member-dialog-title">Add New Member</DialogTitle>
            <DialogContent dividers> {/* Dividers add padding and lines */}
                 {/* Display general form error */}
                 {errors.form && (
                    <FormHelperText error sx={{ mb: 2, textAlign: 'center' }}>
                        {errors.form}
                    </FormHelperText>
                )}
                <Stack component="form" onSubmit={handleSubmit} spacing={3} noValidate>
                    {/* Use Grid for potentially better layout control */}
                     <Grid container spacing={2}>
                         <Grid item xs={12}>
                            <TextField
                                required
                                id="fullName"
                                name="fullName"
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                error={!!errors.fullName}
                                helperText={errors.fullName}
                                disabled={isDisabled}
                                fullWidth
                            />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                id="nationalId"
                                name="nationalId"
                                label="National ID Number"
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                                error={!!errors.nationalId}
                                helperText={errors.nationalId}
                                disabled={isDisabled}
                                fullWidth
                            />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             <TextField
                                required
                                id="phoneNumber"
                                name="phoneNumber"
                                label="Phone Number"
                                type="tel" // Use tel type for potential mobile benefits
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber}
                                disabled={isDisabled}
                                fullWidth
                            />
                        </Grid>
                         <Grid item xs={12}>
                             <FormControl fullWidth error={!!errors.title} disabled={isDisabled}>
                                <InputLabel id="group-title-label">Group Title</InputLabel>
                                <Select
                                    labelId="group-title-label"
                                    id="title"
                                    name="title"
                                    value={title}
                                    label="Group Title"
                                    onChange={(e) => setTitle(e.target.value as GroupTitle)}
                                >
                                    {GROUP_TITLES.map((t) => (
                                        <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>
                                            {t}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.title && <FormHelperText>{errors.title}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {/* Photo Uploads */}
                         <Grid item xs={12} sm={6}>
                             <IdPhotoUpload
                                label="ID Front Photo (Optional)"
                                currentImageUrl={frontPhotoState.url} // Show uploaded URL if available
                                onFileSelect={(file) => handlePhotoSelect('front', file)}
                                onFileRemove={() => handlePhotoRemove('front')}
                                isUploading={frontPhotoState.isUploading}
                                uploadError={frontPhotoState.error}
                                disabled={isDisabled}
                                isUploadSuccess={frontPhotoState.isSuccess}
                            />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             <IdPhotoUpload
                                label="ID Back Photo (Optional)"
                                currentImageUrl={backPhotoState.url} // Show uploaded URL if available
                                onFileSelect={(file) => handlePhotoSelect('back', file)}
                                onFileRemove={() => handlePhotoRemove('back')}
                                isUploading={backPhotoState.isUploading}
                                uploadError={backPhotoState.error}
                                disabled={isDisabled}
                                isUploadSuccess={backPhotoState.isSuccess}
                            />
                        </Grid>
                    </Grid>
                     {/* We don't need a submit button inside the form tag itself */}
                     {/* DialogActions will handle it */}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}> {/* Add some padding */}
                <Button onClick={handleClose} disabled={isAnyPhotoUploading} color="inherit">
                    Cancel
                </Button>
                {/* Show progress in button if uploading or parent is submitting */}
                <Button
                    type="submit" // Connects to the form inside DialogContent
                    onClick={handleSubmit} // Also trigger submit explicitly
                    variant="contained"
                    disabled={isDisabled} // Use combined disabled state
                    startIcon={isDisabled ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isAnyPhotoUploading ? 'Uploading...' : isSubmitting ? 'Adding...' : 'Add Member'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MemberFormDialog;
