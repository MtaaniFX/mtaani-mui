// app/groups/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Box,
    Breadcrumbs,
    Typography,
    Link,
    Alert,
    Snackbar,
    useTheme,
    Skeleton
} from '@mui/material';
import GroupFormContainer from '../GroupFormContainer';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { GroupData, GroupMember } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for testing edit mode
const MOCK_MEMBERS: GroupMember[] = [
    {
        fullName: 'John Doe',
        nationalId: '12345678',
        phoneNumber: '+254700123456',
        groupTitle: 'chair',
        idFrontUrl: 'https://example.com/front1.jpg',
        idBackUrl: 'https://example.com/back1.jpg',
    },
    {
        fullName: 'Jane Smith',
        nationalId: '87654321',
        phoneNumber: '+254700123457',
        groupTitle: 'secretary',
    },
    // Add more mock members...
];

// Simulate fetching paginated members (for edit mode)
const fetchMembers = async (page: number, limit: number) => {
    await delay(1000); // Simulate API delay

    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedMembers = MOCK_MEMBERS.slice(startIndex, endIndex);

    return {
        members: paginatedMembers,
        total: 300,
    };
};

const EditGroupPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState<{
        name: string;
        description?: string;
    } | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
        open: boolean;
    }>({
        message: '',
        type: 'success',
        open: false,
    });

    // Simulate fetching group data
    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                await delay(1000); // Simulate API delay
                setGroupData({
                    name: 'Mock Group',
                    description: 'This is a mock group for testing',
                });
            } catch (error) {
                setNotification({
                    message: 'Failed to load group data',
                    type: 'error',
                    open: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchGroupData();
    }, [params.id]);

    // Handle form submission
    const handleSubmit = async (data: GroupData) => {
        try {
            await delay(2000); // Simulate API delay

            console.log('Updated Group Data:', {
                id: params.id,
                ...data,
            });

            setNotification({
                message: 'Group updated successfully!',
                type: 'success',
                open: true,
            });

            await delay(1000);
            // router.push('/groups');
        } catch (error) {
            setNotification({
                message: 'Failed to update group. Please try again.',
                type: 'error',
                open: true,
            });
            throw error;
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
                <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={400} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 3 }}
            >
                <Link
                    color="inherit"
                    href="/groups"
                    sx={{
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    Groups
                </Link>
                <Link
                    color="inherit"
                    href={`/groups/${params.id}`}
                    sx={{
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                    }}
                >
                    {groupData?.name}
                </Link>
                <Typography color="text.primary">Edit</Typography>
            </Breadcrumbs>

            <Typography
                variant="h4"
                sx={{
                    mb: 4,
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                }}
            >
                Edit Group
            </Typography>

            <GroupFormContainer
                mode="edit"
                groupId={params.id as string}
                onSubmit={handleSubmit}
                onBack={() => router.push(`/groups/${params.id}`)}
                fetchMembers={fetchMembers}
                initialData={groupData || undefined}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                    severity={notification.type}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EditGroupPage;
