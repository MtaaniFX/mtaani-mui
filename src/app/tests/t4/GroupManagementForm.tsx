'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CircularProgress,
    Container,
    Divider,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GroupBasicInfo } from './GroupBasicInfo';
import { MemberTable } from './MemberTable';
import { UndoRedoControls } from './hooks/useUndoRedo';
import { useUndoRedo } from './hooks/useUndoRedo';
import { Group, GroupMember, GroupManagementProps } from './types';

const MEMBERS_PER_PAGE = 50;

interface GroupState {
    name: string;
    description?: string;
    members: GroupMember[];
}

export const GroupManagementForm: React.FC<GroupManagementProps> = ({
    mode,
    groupId,
    onSubmit,
    onBack,
    fetchMembers,
    updateMember,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Basic form state
    const [formErrors, setFormErrors] = useState<{
        name?: string;
        description?: string;
    }>({});
    
    // Pagination state for edit mode
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(MEMBERS_PER_PAGE);
    const [totalMembers, setTotalMembers] = useState(0);
    
    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Track modified members in edit mode
    const [modifiedMembers, setModifiedMembers] = useState<Set<string>>(new Set());

    // Initialize state with undo/redo capability
    const [groupState, setGroupState, undoRedoActions] = useUndoRedo<GroupState>({
        name: '',
        description: '',
        members: [],
    });

    // Fetch initial data in edit mode
    useEffect(() => {
        if (mode === 'edit' && groupId && fetchMembers) {
            const loadMembers = async () => {
                setIsLoading(true);
                try {
                    const result = await fetchMembers(page, pageSize);
                    setGroupState({
                        ...groupState,
                        members: result.data,
                    });
                    setTotalMembers(result.total);
                } catch (error) {
                    console.error('Failed to fetch members:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadMembers();
        }
    }, [mode, groupId, page, pageSize, fetchMembers]);

    // Handle basic info changes
    const handleBasicInfoChange = useCallback((values: { name: string; description?: string }) => {
        setGroupState({
            ...groupState,
            ...values,
        });
        // Clear errors when user types
        setFormErrors({});
    }, [groupState, setGroupState]);

    // Member management handlers
    const handleMemberAdd = useCallback((member: GroupMember) => {
        setGroupState({
            ...groupState,
            members: [...groupState.members, member],
        });
        if (mode === 'edit') {
            setModifiedMembers(prev => new Set(prev).add(member.phoneNumber));
        }
    }, [groupState, setGroupState, mode]);

    const handleMemberEdit = useCallback((updatedMember: GroupMember) => {
        setGroupState({
            ...groupState,
            members: groupState.members.map(m => 
                m.phoneNumber === updatedMember.phoneNumber ? updatedMember : m
            ),
        });
        if (mode === 'edit') {
            setModifiedMembers(prev => new Set(prev).add(updatedMember.phoneNumber));
        }
    }, [groupState, setGroupState, mode]);

    const handleMemberDelete = useCallback((membersToDelete: GroupMember[]) => {
        const phoneNumbersToDelete = new Set(membersToDelete.map(m => m.phoneNumber));
        setGroupState({
            ...groupState,
            members: groupState.members.filter(m => !phoneNumbersToDelete.has(m.phoneNumber)),
        });
        if (mode === 'edit') {
            setModifiedMembers(prev => {
                const updated = new Set(prev);
                membersToDelete.forEach(m => updated.add(m.phoneNumber));
                return updated;
            });
        }
    }, [groupState, setGroupState, mode]);

    // Form validation
    const validateForm = (): boolean => {
        const errors: { name?: string; description?: string } = {};

        if (!groupState.name.trim()) {
            errors.name = 'Group name is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            if (mode === 'edit' && updateMember) {
                // In edit mode, only send modified members
                const modifiedMembersList = groupState.members.filter(
                    m => modifiedMembers.has(m.phoneNumber)
                );
                for (const member of modifiedMembersList) {
                    await updateMember(member);
                }
            }

            // Call the onSubmit callback with the current state
            await onSubmit({
                name: groupState.name,
                description: groupState.description,
                members: groupState.members,
            });
        } catch (error) {
            console.error('Failed to save group:', error);
            // Handle error (you might want to show a snackbar or error message)
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Stack spacing={3} sx={{ py: 4 }}>
                {/* Header */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        {onBack && (
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={onBack}
                            >
                                Back
                            </Button>
                        )}
                        <Typography variant="h4">
                            {mode === 'create' ? 'Create New Group' : 'Edit Group'}
                        </Typography>
                    </Stack>
                    
                    <UndoRedoControls {...undoRedoActions} />
                </Stack>

                {/* Basic Info */}
                <GroupBasicInfo
                    name={groupState.name}
                    description={groupState.description}
                    onChange={handleBasicInfoChange}
                    error={formErrors}
                />

                <Divider />

                {/* Members Table */}
                <Card>
                    <MemberTable
                        members={groupState.members}
                        onMemberAdd={handleMemberAdd}
                        onMemberEdit={handleMemberEdit}
                        onMemberDelete={handleMemberDelete}
                        loading={isLoading}
                        pagination={mode === 'edit' ? {
                            total: totalMembers,
                            page,
                            pageSize,
                            onPageChange: setPage,
                            onPageSizeChange: setPageSize,
                        } : undefined}
                    />
                </Card>

                {/* Actions */}
                <Stack
                    direction={isMobile ? 'column' : 'row'}
                    spacing={2}
                    justifyContent="flex-end"
                >
                    {onBack && (
                        <Button
                            variant="outlined"
                            onClick={onBack}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        startIcon={isSaving && (
                            <CircularProgress size={20} color="inherit" />
                        )}
                    >
                        {isSaving ? 'Saving...' : 'Save Group'}
                    </Button>
                </Stack>
            </Stack>
        </Container>
    );
};
