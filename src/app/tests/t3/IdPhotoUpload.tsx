// src/components/IdPhotoUpload.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Stack,
    Typography,
    Avatar,
    CircularProgress,
    IconButton,
    Tooltip,
    alpha, // For background colors
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import BrokenImageIcon from '@mui/icons-material/BrokenImage'; // Placeholder icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Success indicator

/**
 * Props for the IdPhotoUpload component.
 */
interface IdPhotoUploadProps {
    /** Text label displayed above the upload area */
    label: string;
    /** URL of the currently uploaded image (if any). Cleared when a new file is selected. */
    currentImageUrl?: string | null;
    /** Callback function when a file is selected. Passes the File object. */
    onFileSelect: (file: File | null) => void;
    /** Callback function when the user wants to remove/clear the selected/uploaded file. */
    onFileRemove: () => void;
    /** Indicates whether an upload is currently in progress */
    isUploading?: boolean;
    /** An error message related to the upload, if any */
    uploadError?: string | null;
    /** Disables interaction with the component */
    disabled?: boolean;
    /** Optional: Indicate successful upload visually */
    isUploadSuccess?: boolean;
}

/**
 * A client component for selecting, previewing, and managing the upload
 * state of a single image file, typically used for ID photos.
 */
const IdPhotoUpload: React.FC<IdPhotoUploadProps> = ({
    label,
    currentImageUrl,
    onFileSelect,
    onFileRemove,
    isUploading = false,
    uploadError = null,
    disabled = false,
    isUploadSuccess = false, // Initialize success state
}) => {
    // State to hold the selected File object
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // State to hold the local preview URL (Object URL)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    // Ref for the hidden file input element
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to create/revoke object URLs for previews
    useEffect(() => {
        let objectUrl: string | null = null;
        if (selectedFile) {
            objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
        } else {
            // If no file is selected locally, reset preview
            // but respect currentImageUrl if provided initially
            setPreviewUrl(currentImageUrl || null);
        }

        // Cleanup function to revoke the object URL
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                // console.log('Revoked Object URL:', objectUrl); // For debugging
            }
        };
    }, [selectedFile, currentImageUrl]); // Rerun when selectedFile or initial currentImageUrl changes

    // Effect to clear local state if currentImageUrl is externally removed
    useEffect(() => {
        if (!currentImageUrl && !selectedFile) {
            setPreviewUrl(null);
        }
         // If an external URL is provided and no local file selected, show it
        if (currentImageUrl && !selectedFile) {
            setPreviewUrl(currentImageUrl);
        }
    }, [currentImageUrl, selectedFile]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            onFileSelect(file); // Notify parent about the new file
            // Clear any previous upload error when a new file is selected
            if (uploadError) {
                 // TODO: Consider if parent should manage clearing error state
                 // Maybe add an onClearError prop if needed?
            }
             // Reset upload success state on new file selection
             // TODO: Parent might need to manage this state based on actual upload success.
             // This component just handles the UI part.
        }
         // Reset the input value to allow selecting the same file again
         if (event.target) {
            event.target.value = '';
         }
    };

    const handleRemoveClick = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null); // Clear preview immediately
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the file input
        }
        onFileSelect(null); // Notify parent that file is deselected
        onFileRemove(); // Notify parent about the removal action
    }, [onFileSelect, onFileRemove]);

    const handleSelectClick = () => {
        fileInputRef.current?.click();
    };

    const hasPreview = !!previewUrl;
    const displayError = !!uploadError && !isUploading; // Only show error if not currently uploading

    return (
        <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2" fontWeight="medium" color="text.secondary">
                {label}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" width="100%">
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1, // Slightly rounded corners
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.1), // Subtle background
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden', // Ensure overlay fits within bounds
                        border: displayError
                            ? (theme) => `2px solid ${theme.palette.error.main}`
                            : (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                >
                    {hasPreview ? (
                        <Avatar
                            src={previewUrl}
                            alt={`${label} preview`}
                            variant="rounded"
                            sx={{ width: '100%', height: '100%' }}
                        />
                    ) : (
                        <BrokenImageIcon color="disabled" fontSize="large" />
                    )}

                    {/* Loading Overlay */}
                    {isUploading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: (theme) => alpha(theme.palette.common.black, 0.5),
                                zIndex: 1,
                            }}
                        >
                            <CircularProgress size={30} color="inherit" sx={{color: 'white'}}/>
                        </Box>
                    )}
                     {/* Success Indicator */}
                     {isUploadSuccess && !isUploading && hasPreview && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                color: 'success.main',
                                backgroundColor: 'background.paper', // Ensure visibility
                                borderRadius: '50%',
                                display: 'flex',
                                zIndex: 2, // Above image, below buttons if needed
                            }}
                        >
                            <CheckCircleIcon fontSize="small" />
                        </Box>
                    )}
                </Box>

                <Stack spacing={1} flexGrow={1}>
                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp" // Accept common image types
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={disabled || isUploading}
                        aria-hidden="true" // Hide from accessibility tree as it's triggered by button
                    />

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                         <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PhotoCameraIcon />}
                            onClick={handleSelectClick}
                            disabled={disabled || isUploading}
                            aria-label={`Select ${label}`}
                        >
                            {hasPreview ? 'Change' : 'Select'}
                        </Button>
                        {hasPreview && (
                            <Tooltip title={`Remove ${label}`}>
                                <span> {/* Span for tooltip on disabled */}
                                    <IconButton
                                        size="small"
                                        onClick={handleRemoveClick}
                                        disabled={disabled || isUploading}
                                        color="error"
                                        aria-label={`Remove ${label}`}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </Stack>

                     {/* Error Message Display */}
                    {displayError && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {uploadError}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};

export default IdPhotoUpload;
