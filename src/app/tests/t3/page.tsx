// src/app/create-group/page.tsx
'use client'; // This page needs client-side interactivity (state, router, form handling)

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use App Router's navigation
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

// Import the main form component and types
import GroupForm from './GroupForm'; 
import { GroupFormDataCreate, UploadFileFunction } from './types'; 

// Import the Supabase upload utility
import { uploadGroupFile } from './supabase/upload';

export default function CreateGroupPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    /**
     * Handles the final submission of the group data to the backend API.
     */
    const handleCreateGroupSubmit = useCallback(async (data: GroupFormDataCreate) => {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        console.log('Submitting group data:', data);

        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            console.log('Group creation successful:', result);
            setSuccessMessage(result.message || 'Group created successfully!');

            // Optional: Redirect after a short delay
            setTimeout(() => {
                // Redirect to the newly created group page or a dashboard
                // Example: router.push(`/groups/${result.groupId}`);
                router.push('/dashboard'); // Redirect to a general dashboard for now
            }, 2000); // 2 second delay

        } catch (err: any) {
            console.error("Failed to create group:", err);
            setError(err.message || "An unexpected error occurred.");
            setIsSubmitting(false); // Stop loading indicator on error
        }
        // Don't set isSubmitting to false on success here,
        // because we are navigating away or showing success message.
        // The GroupForm's internal state handles its button loading state.
    }, [router]);

    /**
     * Provides the file upload functionality to the GroupForm component.
     * Delegates the actual upload to the Supabase utility function.
     */
    const handleUploadFile: UploadFileFunction = useCallback(async (file: File) => {
        try {
            // Specify the bucket name you created in Supabase for member IDs
            const bucketName = 'group_member_ids'; // CHANGE THIS if your bucket name is different
            const url = await uploadGroupFile(file, bucketName);
            return url;
        } catch (uploadError: any) {
            console.error('Upload failed in page component:', uploadError);
            // Re-throw the error so the IdPhotoUpload component can display it
            throw new Error(uploadError.message || 'File upload failed.');
        }
    }, []);

    /**
     * Handles the secondary action (e.g., navigating back).
     */
    const handleCancel = useCallback(() => {
        router.back(); // Go back to the previous page
    }, [router]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}> {/* Add padding */}
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Group
            </Typography>

            {/* Display Success/Error Messages */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage} {isSubmitting && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </Alert>
            )}


            <Box sx={{ mt: 3 }}>
                <GroupForm
                    mode="create"
                    onSubmit={handleCreateGroupSubmit}
                    uploadFile={handleUploadFile}
                    // Use 'phoneNumber' as the unique key for members within the form session
                    // Ensure phone numbers are validated for uniqueness client-side by GroupForm
                    memberIdKey="phoneNumber"
                    onSecondaryAction={handleCancel}
                    secondaryActionLabel="Cancel"
                    submitActionLabel="Create Group"
                    // Disable the form while the page is processing the final submission
                    disabled={isSubmitting}
                />
            </Box>
        </Container>
    );
}
