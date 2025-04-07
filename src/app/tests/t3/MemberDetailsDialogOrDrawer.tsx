// src/components/MemberDetailsDialogOrDrawer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Drawer,
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
    Typography,
    Box,
    IconButton,
    Tooltip,
    Divider,
    useTheme,
    useMediaQuery,
    Paper, // For Drawer content background
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; // For Drawer header
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import IdPhotoUpload from './IdPhotoUpload';
import {
    GROUP_TITLES,
    GroupTitle,
    GroupMember,
    UploadFileFunction,
} from './types';

// Reusing the PhotoUploadState helper type from MemberFormDialog might be good
// Or define it locally if preferred
type PhotoUploadState = {
    file: File | null; // Newly selected file
    isUploading: boolean;
    error: string | null;
    currentUrl: string | null; // URL from initial memberData or after successful upload
    isSuccess: boolean; // Visual feedback for upload success
    // Flag to track if the user explicitly removed an existing photo
    // Needed to differentiate between no photo initially vs removed photo
    wasRemoved: boolean;
};

/**
 * Props for the MemberDetailsDialogOrDrawer component.
 */
interface MemberDetailsDialogOrDrawerProps {
    /** Controls the visibility of the dialog/drawer */
    open: boolean;
    /** Callback function when the dialog/drawer should be closed */
    onClose: () => void;
    /** The data of the member being viewed/edited. If null, component might not render or show empty state. */
    memberData: GroupMember | null;
    /** Callback function when edits are submitted. Passes the *updated* member data. Parent handles async state. */
    onSubmitChanges: (updatedMemberData: GroupMember) => Promise<void> | void;
    /** Controls if the component is in edit mode */
    isEditing: boolean;
    /** Callback to request switching between view and edit mode */
    onSetEditing: (editing: boolean) => void;
    /** Indicates if the parent is currently processing the submission */
    isSubmitting?: boolean;
    /** Set of phone numbers already present in the group list (excluding the current member's original number) */
    existingPhoneNumbers: Set<string>;
    /** Function provided by the parent to handle file uploads */
    uploadFile: UploadFileFunction;
    /** The key used to uniquely identify a member (e.g., 'phoneNumber' or 'id') */
    memberIdKey: keyof GroupMember;
    /** Optional: Callback to request deletion of the current member */
    onDeleteMember?: (memberId: string) => Promise<void> | void;
    /** Optional: Indicates parent is processing deletion */
    isDeleting?: boolean;
}

const initialPhotoStateFactory = (url?: string | null): PhotoUploadState => ({
    file: null,
    isUploading: false,
    error: null,
    currentUrl: url || null,
    isSuccess: false,
    wasRemoved: false,
});

/**
 * A responsive component (Dialog on desktop, Drawer on mobile) to display
 * and optionally edit the details of a group member.
 */
const MemberDetailsDialogOrDrawer: React.FC<MemberDetailsDialogOrDrawerProps> = ({
    open,
    onClose,
    memberData,
    onSubmitChanges,
    isEditing,
    onSetEditing,
    isSubmitting = false,
    existingPhoneNumbers,
    uploadFile,
    memberIdKey,
    onDeleteMember,
    isDeleting = false,
}) => {
    const theme = useTheme();
    // Use 'md' breakpoint for switching between Dialog and Drawer for better tablet experience
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const ContainerComponent = isMobile ? Drawer : Dialog;

    // Internal state for edited fields
    const [editedFullName, setEditedFullName] = useState('');
    const [editedNationalId, setEditedNationalId] = useState('');
    const [editedTitle, setEditedTitle] = useState<GroupTitle>('member');
    const [editedPhoneNumber, setEditedPhoneNumber] = useState('');

    // Photo states
    const [frontPhotoState, setFrontPhotoState] = useState<PhotoUploadState>(initialPhotoStateFactory());
    const [backPhotoState, setBackPhotoState] = useState<PhotoUploadState>(initialPhotoStateFactory());

    // Validation errors
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    // Internal loading for photo uploads
    const [isUploadingInternally, setIsUploadingInternally] = useState(false);

    // Memoize original phone number for duplicate check logic
    const originalPhoneNumber = useMemo(() => memberData?.phoneNumber, [memberData]);

    // Effect to initialize/reset state when memberData changes or dialog opens/closes
    useEffect(() => {
        if (open && memberData) {
            setEditedFullName(memberData.fullName);
            setEditedNationalId(memberData.nationalId);
            setEditedTitle(memberData.title);
            setEditedPhoneNumber(memberData.phoneNumber);
            setFrontPhotoState(initialPhotoStateFactory(memberData.idFrontPhotoUrl));
            setBackPhotoState(initialPhotoStateFactory(memberData.idBackPhotoUrl));
            setErrors({}); // Clear errors on open/data change
            setIsUploadingInternally(false);
        } else if (!open) {
            // Optional: Reset state on close, though might not be strictly necessary
            // if parent controls isEditing flag correctly. Resetting ensures clean state.
            const timer = setTimeout(() => { // Delay reset slightly for animations
                setErrors({});
                setIsUploadingInternally(false);
                // Reset photos? Depends if we want to keep state momentarily
                // setFrontPhotoState(initialPhotoStateFactory());
                // setBackPhotoState(initialPhotoStateFactory());
            }, 300);
             return () => clearTimeout(timer);
        }
    }, [open, memberData]); // Key dependencies

    const isAnyPhotoUploading = frontPhotoState.isUploading || backPhotoState.isUploading || isUploadingInternally;
    const isDisabled = isAnyPhotoUploading || isSubmitting || isDeleting; // Disable form if submitting, deleting or photos uploading

    const validateForm = (): boolean => {
        if (!isEditing) return true; // No validation needed in view mode

        const newErrors: { [key: string]: string | null } = {};
        let isValid = true;

        if (!editedFullName.trim()) {
            newErrors.fullName = 'Full name cannot be empty';
            isValid = false;
        }
        if (!editedNationalId.trim()) {
            newErrors.nationalId = 'National ID cannot be empty';
            isValid = false;
        }
        if (!editedPhoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number cannot be empty';
            isValid = false;
        } else if (editedPhoneNumber.trim() !== originalPhoneNumber && existingPhoneNumbers.has(editedPhoneNumber.trim())) {
             // Check duplicates only if phone number changed
             newErrors.phoneNumber = 'This phone number is already in use by another member';
             isValid = false;
        }

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
            error: null,
            isSuccess: false,
            // If a new file is selected, it wasn't "removed" in the sense of deleting an existing URL
            wasRemoved: false,
            // Keep currentUrl until upload is successful if needed, or clear it?
            // Clearing might be better UI: shows preview of new file only
            // currentUrl: file ? null : prev.currentUrl // Option 1: Clear URL
             currentUrl: prev.currentUrl // Option 2: Keep URL until new one replaces it (handled by IdPhotoUpload preview anyway)
        }));
    };

    const handlePhotoRemove = (type: 'front' | 'back') => {
        const stateSetter = type === 'front' ? setFrontPhotoState : setBackPhotoState;
        stateSetter(prev => ({
            ...initialPhotoStateFactory(), // Reset most fields
            currentUrl: null, // Ensure URL is cleared
            wasRemoved: true, // Mark that an existing photo (if any) was removed
        }));
    };

    const handleSaveChanges = async () => {
        if (!validateForm() || !memberData) {
            return;
        }

        setIsUploadingInternally(true);
        let finalFrontUrl = frontPhotoState.currentUrl;
        let finalBackUrl = backPhotoState.currentUrl;
        let uploadErrorOccurred = false;

        try {
            // Upload Front Photo if changed/added
            if (frontPhotoState.file) {
                setFrontPhotoState(prev => ({ ...prev, isUploading: true, error: null, isSuccess: false }));
                try {
                    finalFrontUrl = await uploadFile(frontPhotoState.file);
                    setFrontPhotoState(prev => ({ ...prev, isUploading: false, currentUrl: finalFrontUrl, file: null, isSuccess: true }));
                } catch (error: any) {
                    console.error("Front photo upload failed:", error);
                    setFrontPhotoState(prev => ({ ...prev, isUploading: false, error: error.message || 'Upload failed', isSuccess: false }));
                    uploadErrorOccurred = true;
                }
            } else if (frontPhotoState.wasRemoved) {
                finalFrontUrl = null; // Handle explicit removal
            }

            // Upload Back Photo if changed/added (and front didn't fail)
            if (backPhotoState.file && !uploadErrorOccurred) {
                 setBackPhotoState(prev => ({ ...prev, isUploading: true, error: null, isSuccess: false }));
                try {
                    finalBackUrl = await uploadFile(backPhotoState.file);
                    setBackPhotoState(prev => ({ ...prev, isUploading: false, currentUrl: finalBackUrl, file: null, isSuccess: true }));
                } catch (error: any) {
                    console.error("Back photo upload failed:", error);
                    setBackPhotoState(prev => ({ ...prev, isUploading: false, error: error.message || 'Upload failed', isSuccess: false }));
                    uploadErrorOccurred = true;
                }
            } else if (backPhotoState.wasRemoved) {
                finalBackUrl = null; // Handle explicit removal
            }

            if (uploadErrorOccurred) {
                setIsUploadingInternally(false);
                return; // Stop if uploads failed
            }

            // Prepare updated data
            const updatedMemberData: GroupMember = {
                ...memberData, // Spread original data first
                fullName: editedFullName.trim(),
                nationalId: editedNationalId.trim(),
                title: editedTitle,
                phoneNumber: editedPhoneNumber.trim(),
                idFrontPhotoUrl: finalFrontUrl,
                idBackPhotoUrl: finalBackUrl,
            };

            // Call the parent's submit handler
            await onSubmitChanges(updatedMemberData);
            // Parent should set isSubmitting to false and potentially close or switch mode

            // Optional: Switch back to view mode automatically after successful save
            // onSetEditing(false); // Let parent decide this based on workflow

        } catch (error) {
            console.error("Error during member update:", error);
            setErrors(prev => ({ ...prev, form: 'An unexpected error occurred saving changes.' }));
        } finally {
            // Only set internal uploading to false if parent isn't controlling via isSubmitting
             if (!isSubmitting) {
                setIsUploadingInternally(false);
             }
        }
    };

    const handleCancelEdit = () => {
        // Revert changes by resetting state from memberData
        if (memberData) {
            setEditedFullName(memberData.fullName);
            setEditedNationalId(memberData.nationalId);
            setEditedTitle(memberData.title);
            setEditedPhoneNumber(memberData.phoneNumber);
            setFrontPhotoState(initialPhotoStateFactory(memberData.idFrontPhotoUrl));
            setBackPhotoState(initialPhotoStateFactory(memberData.idBackPhotoUrl));
            setErrors({});
        }
        onSetEditing(false); // Switch back to view mode
    };

    const handleDelete = async () => {
        if (memberData && onDeleteMember) {
            // Optional: Add confirmation dialog here
            try {
                 await onDeleteMember(memberData[memberIdKey] as string);
                 // Parent should handle closing the dialog/drawer after successful deletion
            } catch (error) {
                console.error("Failed to delete member:", error);
                setErrors(prev => ({ ...prev, form: 'Failed to delete member.' }));
            }
        }
    };

    const renderContent = () => {
        if (!memberData) {
            // Handle case where no member data is provided (e.g., show loading or empty state)
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography>Loading member details...</Typography>
                </Box>
            );
        }

        const memberId = memberData[memberIdKey] as string;

        return (
            <>
                {/* Drawer Header (only shown in mobile/Drawer mode) */}
                {isMobile && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Typography variant="h6" id="member-details-title">
                            {isEditing ? 'Edit Member' : 'Member Details'}
                        </Typography>
                        <IconButton onClick={onClose} aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                )}

                {/* Main Content Area */}
                 <DialogContent dividers={!isMobile} sx={isMobile ? { p: 2 } : {}}>
                    {/* Display general form error */}
                     {errors.form && (
                        <FormHelperText error sx={{ mb: 2, textAlign: 'center' }}>
                            {errors.form}
                        </FormHelperText>
                    )}
                     <Grid container spacing={isMobile ? 2 : 3}>
                        {/* Text Fields / Display Text */}
                        <Grid item xs={12}>
                            {isEditing ? (
                                <TextField
                                    required
                                    label="Full Name"
                                    value={editedFullName}
                                    onChange={(e) => setEditedFullName(e.target.value)}
                                    error={!!errors.fullName}
                                    helperText={errors.fullName}
                                    disabled={isDisabled}
                                    fullWidth
                                />
                            ) : (
                                <Typography variant="body1"><strong>Name:</strong> {memberData.fullName}</Typography>
                            )}
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             {isEditing ? (
                                <TextField
                                    required
                                    label="National ID Number"
                                    value={editedNationalId}
                                    onChange={(e) => setEditedNationalId(e.target.value)}
                                    error={!!errors.nationalId}
                                    helperText={errors.nationalId}
                                    disabled={isDisabled}
                                    fullWidth
                                />
                            ) : (
                                <Typography variant="body1"><strong>National ID:</strong> {memberData.nationalId}</Typography>
                            )}
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             {isEditing ? (
                                <TextField
                                    required
                                    label="Phone Number"
                                    type="tel"
                                    value={editedPhoneNumber}
                                    onChange={(e) => setEditedPhoneNumber(e.target.value)}
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber}
                                    disabled={isDisabled}
                                    fullWidth
                                />
                            ) : (
                                <Typography variant="body1"><strong>Phone:</strong> {memberData.phoneNumber}</Typography>
                            )}
                        </Grid>
                         <Grid item xs={12}>
                             {isEditing ? (
                                <FormControl fullWidth error={!!errors.title} disabled={isDisabled}>
                                    <InputLabel id={`member-title-label-${memberId}`}>Group Title</InputLabel>
                                    <Select
                                        labelId={`member-title-label-${memberId}`}
                                        value={editedTitle}
                                        label="Group Title"
                                        onChange={(e) => setEditedTitle(e.target.value as GroupTitle)}
                                    >
                                        {GROUP_TITLES.map((t) => (
                                            <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>
                                                {t}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.title && <FormHelperText>{errors.title}</FormHelperText>}
                                </FormControl>
                            ) : (
                                 <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                     <strong>Title:</strong> {memberData.title}
                                </Typography>
                            )}
                        </Grid>

                        {/* Photo Uploads / Display */}
                         <Grid item xs={12} sm={6}>
                             <IdPhotoUpload
                                label="ID Front Photo"
                                // Pass the current URL (from state if edited, else from original data)
                                currentImageUrl={frontPhotoState.currentUrl}
                                onFileSelect={(file) => handlePhotoSelect('front', file)}
                                onFileRemove={() => handlePhotoRemove('front')}
                                isUploading={frontPhotoState.isUploading}
                                uploadError={frontPhotoState.error}
                                disabled={!isEditing || isDisabled} // Disable if not editing or during actions
                                isUploadSuccess={frontPhotoState.isSuccess}
                            />
                             {!isEditing && !frontPhotoState.currentUrl && (
                                 <Typography variant="caption" color="text.secondary">(No photo provided)</Typography>
                             )}
                        </Grid>
                         <Grid item xs={12} sm={6}>
                             <IdPhotoUpload
                                label="ID Back Photo"
                                currentImageUrl={backPhotoState.currentUrl}
                                onFileSelect={(file) => handlePhotoSelect('back', file)}
                                onFileRemove={() => handlePhotoRemove('back')}
                                isUploading={backPhotoState.isUploading}
                                uploadError={backPhotoState.error}
                                disabled={!isEditing || isDisabled}
                                isUploadSuccess={backPhotoState.isSuccess}
                            />
                             {!isEditing && !backPhotoState.currentUrl && (
                                 <Typography variant="caption" color="text.secondary">(No photo provided)</Typography>
                             )}
                        </Grid>
                    </Grid>
                </DialogContent>

                {/* Action Buttons */}
                 <DialogActions sx={{ px: isMobile ? 2 : 3, pb: 2, pt: isMobile ? 2 : 1, borderTop: isMobile ? `1px solid ${theme.palette.divider}`: 'none' }}>
                    <Stack direction="row" justifyContent="space-between" width="100%">
                         {/* Left Aligned Actions (Delete) */}
                        <Box>
                            {onDeleteMember && !isEditing && ( // Show delete only in view mode
                                <Tooltip title="Delete Member">
                                     <span> {/* Span for tooltip on disabled */}
                                        <Button
                                            color="error"
                                            onClick={handleDelete}
                                            disabled={isDeleting || isSubmitting} // Disable if any action is pending
                                            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                            variant="outlined" // Less prominent than primary actions
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </span>
                                </Tooltip>
                            )}
                        </Box>

                         {/* Right Aligned Actions (Edit/Save/Cancel/Close) */}
                         <Stack direction="row" spacing={1}>
                             {isEditing ? (
                                <>
                                    <Button
                                        onClick={handleCancelEdit}
                                        disabled={isDisabled} // Disable during uploads/submit
                                        color="inherit"
                                        startIcon={<CancelIcon />}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveChanges}
                                        variant="contained"
                                        disabled={isDisabled}
                                        startIcon={isAnyPhotoUploading || isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    >
                                         {isAnyPhotoUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                     {/* Close button for non-mobile (Dialog mode) */}
                                     {!isMobile && (
                                         <Button onClick={onClose} color="inherit">
                                             Close
                                         </Button>
                                     )}
                                     <Button
                                        onClick={() => onSetEditing(true)}
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        disabled={isDeleting} // Disable if delete is in progress
                                    >
                                        Edit
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Stack>
                </DialogActions>
            </>
        );
    };

    // Common props for Dialog and Drawer
    const containerProps = {
        open: open,
        onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
             // Prevent closing via backdrop/escape if photos are uploading or submitting
             if (reason && (isAnyPhotoUploading || isSubmitting || isDeleting)) return;
             onClose();
        },
        // Dialog specific props
        ...( !isMobile && {
             maxWidth:"md",
             fullWidth: true,
             'aria-labelledby': "member-details-title",
        }),
         // Drawer specific props
         ...( isMobile && {
            anchor:"bottom",
            PaperProps: { sx: { maxHeight: '90vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 } }, // Style drawer paper
            'aria-labelledby': "member-details-title", // Use ID from header
        }),
    };


    return (
        <ContainerComponent open={open}>
        {/* TODO: <ContainerComponent {...containerProps}> */}
             {/* Dialog Title (only shown in desktop/Dialog mode) */}
             {!isMobile && (
                <DialogTitle id="member-details-title">
                    {isEditing ? 'Edit Member' : 'Member Details'}
                </DialogTitle>
            )}
            {renderContent()}
        </ContainerComponent>
    );
};

export default MemberDetailsDialogOrDrawer;
