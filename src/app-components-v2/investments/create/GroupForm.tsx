// src/components/GroupForm.tsx
'use client'; // This is a client component

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Grid,
    Typography,
} from '@mui/material';

// Import Child Components
import GroupDetailsForm from './GroupDetailsForm';
import MemberList from './MemberList';
import MemberFormDialog from './MemberFormDialog';
import MemberDetailsDialogOrDrawer from './MemberDetailsDialogOrDrawer';
import UndoRedoControls from './UndoRedoControls';

// Import Types
import {
    GroupMember,
    NewMemberData,
    UploadFileFunction,
    GroupTitle,
} from './types';

// Helper type for Edit Mode Changes
export interface GroupChanges {
    name?: string;
    description?: string;
    addedMembers: NewMemberData[];
    updatedMembers: { [id: string]: Partial<Omit<GroupMember, 'id'>> }; // Store only changed fields, keyed by member ID
    deletedMemberIds: string[];
}

// Type for the data passed to onSubmit callback
export interface GroupFormDataCreate {
    name: string;
    description: string;
    members: NewMemberData[]; // In create mode, we just pass the list of new members
}

export interface GroupFormDataEdit {
    id: string; // Need the group ID in edit mode
    changes: GroupChanges;
}

// Props for the GroupForm component
interface GroupFormPropsBase {
    /** Function to handle Supabase file uploads */
    uploadFile: UploadFileFunction;
    /** The key used to uniquely identify members (e.g., 'phoneNumber' or 'id') */
    memberIdKey: keyof GroupMember;
    /** Callback for the secondary action button (e.g., "Back") */
    onSecondaryAction?: () => void;
    /** Text for the secondary action button */
    secondaryActionLabel?: string;
    /** Text for the primary submit button */
    submitActionLabel?: string;
    /** Optional: Disable the entire form */
    disabled?: boolean;
}

interface GroupFormPropsCreate extends GroupFormPropsBase {
    mode: 'create';
    /** Callback function when the form is submitted in create mode 
     * sample callback data:
     * {
            "name": "The gringo",
            "description": "Made for success.",
            "members": [
                {
                    "fullName": "Nicholas Ajwang' Anyona",
                    "nationalId": "36356982",
                    "title": "chair",
                    "phoneNumber": "0799440267",
                    "idFrontPhotoUrl": null,
                    "idBackPhotoUrl": null
                },
                {
                    "fullName": "Bob lenny",
                    "nationalId": "356527",
                    "title": "chair",
                    "phoneNumber": "0799440268",
                    "idFrontPhotoUrl": null,
                    "idBackPhotoUrl": null
                }
            ]
        }
    */
    onSubmit: (data: GroupFormDataCreate) => Promise<void> | void;
    /** Initial data (optional for create mode, e.g., pre-filled name) */
    initialData?: Partial<GroupFormDataCreate>;
    // Exclude edit-specific props
    fetchMembers?: never;
    groupId?: never;
}

interface GroupFormPropsEdit extends GroupFormPropsBase {
    mode: 'edit';
    /** The ID of the group being edited */
    groupId: string;
    /** Callback function when the form is submitted in edit mode */
    onSubmit: (data: GroupFormDataEdit) => Promise<void> | void;
    /** Function to fetch paginated group members */
    fetchMembers: (
        page: number,
        rowsPerPage: number,
        sortField: keyof GroupMember | '',
        sortOrder: 'asc' | 'desc',
        searchQuery: string
    ) => Promise<{ members: GroupMember[]; totalCount: number }>;
    /** Initial data required for edit mode */
    initialData: {
        name: string;
        description: string;
    };
}

type GroupFormProps = GroupFormPropsCreate | GroupFormPropsEdit;

// ---- Undo/Redo History Hook ----
// Simplified history state management
interface HistoryState {
    // State relevant for undo/redo
    members: ReadonlyArray<GroupMember>; // Create mode: the full list
    addedMembers: ReadonlyArray<NewMemberData>; // Edit mode
    updatedMembers: Readonly<{ [id: string]: Partial<Omit<GroupMember, 'id'>> }>; // Edit mode
    deletedMemberIds: ReadonlySet<string>; // Edit mode
}

function useHistory(initialState: HistoryState) {
    const [history, setHistory] = useState<HistoryState[]>([initialState]);
    const [index, setIndex] = useState(0);

    const currentState = history[index];

    const setState = useCallback((action: HistoryState | ((prevState: HistoryState) => HistoryState)) => {
        const newState = typeof action === 'function' ? action(currentState) : action;
        if (JSON.stringify(newState) === JSON.stringify(currentState)) {
            return; // No change, don't add to history
        }
        const newHistory = history.slice(0, index + 1); // Discard future states
        newHistory.push(newState);
        setHistory(newHistory);
        setIndex(newHistory.length - 1);
    }, [history, index, currentState]);


    const undo = useCallback(() => {
        if (index > 0) {
            setIndex(index - 1);
        }
    }, [index]);

    const redo = useCallback(() => {
        if (index < history.length - 1) {
            setIndex(index + 1);
        }
    }, [index, history.length]);

    const canUndo = index > 0;
    const canRedo = index < history.length - 1;

    return { state: currentState, setState, undo, redo, canUndo, canRedo };
}
// ---- End History Hook ----


/**
 * The main client component for creating or editing a group, managing details,
 * members, uploads, and undo/redo functionality.
 */
const GroupForm: React.FC<GroupFormProps> = (props) => {
    const {
        mode,
        onSubmit,
        onSecondaryAction,
        uploadFile,
        memberIdKey, // Use this key consistently
        initialData,
        fetchMembers, // Only available in edit mode
        groupId, // Only available in edit mode
        secondaryActionLabel = 'Back',
        submitActionLabel = mode === 'create' ? 'Create Group' : 'Save Changes',
        disabled = false,
    } = props;

    // === State ===
    const [name, setName] = useState(initialData?.name ?? '');
    const [description, setDescription] = useState(initialData?.description ?? '');

    // Member state (differs by mode)
    const [fetchedMembers, setFetchedMembers] = useState<ReadonlyArray<GroupMember>>([]); // Edit mode: from API
    const [totalMemberCount, setTotalMemberCount] = useState(0); // Edit mode: total count for pagination

    // Internal state managed by useHistory hook
    const { state: historyState, setState: setHistoryState, undo, redo, canUndo, canRedo } = useHistory({
        members: mode === 'create' ? (initialData?.members as GroupMember[] ?? []) : [], // Create mode: full list
        addedMembers: [], // Edit mode: newly added
        updatedMembers: {}, // Edit mode: changes to existing
        deletedMemberIds: new Set<string>(), // Edit mode: IDs of deleted
    });

    // Destructure state from history for easier access
    const {
        members: localMembers, // Use this in Create mode
        addedMembers,
        updatedMembers,
        deletedMemberIds
    } = historyState;

    // UI State
    const [selectedMemberIds, setSelectedMemberIds] = useState<readonly string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50); // Default rows per page
    const [orderBy, setOrderBy] = useState<keyof GroupMember | ''>('fullName'); // Default sort
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // For triggering fetch/filter

    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [memberToViewEdit, setMemberToViewEdit] = useState<GroupMember | null>(null);
    const [isMemberDetailsEditing, setIsMemberDetailsEditing] = useState(false);

    // Loading and Error State
    const [isFetchingMembers, setIsFetchingMembers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDeletingMember, setIsDeletingMember] = useState(false); // For delete action in details view

    // Refs
    const initialLoadDone = useRef(false); // Prevent initial fetch effect trigger on mount if not needed

    // === Effects ===

    // Debounce Search Query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            if (mode === 'edit') {
                setPage(0); // Reset to first page on search
            }
        }, 500); // 500ms debounce time

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, mode]);


    // Fetch members in Edit mode
    useEffect(() => {
        // Only run in edit mode and if fetchMembers is provided
        if (mode === 'edit' && fetchMembers) {
            // Optionally skip initial fetch if needed, e.g., if data is preloaded differently
            // if (!initialLoadDone.current) {
            //     initialLoadDone.current = true;
            //     return;
            // }

            const loadMembers = async () => {
                setIsFetchingMembers(true);
                setSubmitError(null); // Clear previous errors
                try {
                    const result = await fetchMembers(page, rowsPerPage, orderBy, order, debouncedSearchQuery);
                    setFetchedMembers(result.members);
                    setTotalMemberCount(result.totalCount);
                } catch (error: any) {
                    console.error('Failed to fetch members:', error);
                    setSubmitError(`Failed to load members: ${error.message || 'Unknown error'}`);
                    setFetchedMembers([]); // Clear data on error
                    setTotalMemberCount(0);
                } finally {
                    setIsFetchingMembers(false);
                }
            };
            loadMembers();
        }
    }, [mode, fetchMembers, page, rowsPerPage, orderBy, order, debouncedSearchQuery]); // Dependencies for refetching

    // === Memos ===

    // Combine fetched, added, updated, deleted members for display (Edit Mode)
    const displayedMembersEditMode = useMemo((): ReadonlyArray<GroupMember> => {
        if (mode !== 'edit') return [];

        // 1. Start with fetched members for the current page
        let membersMap = new Map<string, GroupMember>();
        fetchedMembers.forEach(m => membersMap.set(m[memberIdKey] as string, m));

        // 2. Apply updates
        Object.entries(updatedMembers).forEach(([id, changes]) => {
            if (membersMap.has(id)) {
                membersMap.set(id, { ...membersMap.get(id)!, ...changes });
            }
            // Note: If an updated member is not on the current fetched page,
            // it won't appear unless we fetch *all* members or handle this differently.
            // This implementation assumes updates only apply to currently visible fetched members.
        });

        // 3. Filter out deleted members
        deletedMemberIds.forEach(id => membersMap.delete(id));

        // 4. Add newly added members (transform NewMemberData to GroupMember shape)
        // Assign temporary IDs if needed, or use phone number if it's the key
        const newlyAddedTransformed: GroupMember[] = addedMembers.map((newMember, index) => ({
            ...newMember,
            // Assign a temporary ID for keys if memberIdKey isn't phoneNumber,
            // or rely on phoneNumber if it is the key.
            // This ID should NOT clash with real IDs from the backend.
            [memberIdKey]: newMember.phoneNumber, // Assuming phoneNumber is unique enough for temp key
            // Or generate a temp ID: `temp-${Date.now()}-${index}`
            // Ensure the chosen key matches `memberIdKey` prop requirement
            id: `temp-${newMember.phoneNumber}`, // Example if 'id' is the key
        } as GroupMember)); // Cast needed if types don't perfectly align


        // Combine and potentially sort/filter locally if desired
        // For simplicity, let's just prepend added members for now
        const combined = [...newlyAddedTransformed, ...Array.from(membersMap.values())];

        return combined;

    }, [mode, fetchedMembers, addedMembers, updatedMembers, deletedMemberIds, memberIdKey]);

    // Members list for display (handles both modes)
    const membersForList = useMemo(() => {
        if (mode === 'create') {
            // Apply client-side search/sort/pagination to localMembers
            let filtered = [...localMembers]; // Create mutable copy

            // Search
            if (debouncedSearchQuery) {
                const lowerQuery = debouncedSearchQuery.toLowerCase();
                filtered = filtered.filter(m =>
                    Object.values(m).some(value =>
                        String(value).toLowerCase().includes(lowerQuery)
                    )
                );
            }

            // Sort
            if (orderBy) {
                filtered.sort((a, b) => {
                    const valA = a[orderBy];
                    const valB = b[orderBy];

                    if (!valA || !valB) {
                        return 0;
                    }

                    if (valA < valB) return order === 'asc' ? -1 : 1;
                    if (valA > valB) return order === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            // Paginate
            const startIndex = page * rowsPerPage;
            const paginated = filtered.slice(startIndex, startIndex + rowsPerPage);
            return paginated;

        } else {
            // In edit mode, server handles filtering/sorting/pagination of fetchedMembers.
            // displayedMembersEditMode combines fetched (already processed by server) + local changes.
            // We might need client-side pagination/sort *only* for the combined list if not relying solely on server.
            // For now, assume displayedMembersEditMode is the final list for the current view.
            return displayedMembersEditMode;
        }
    }, [
        mode,
        localMembers, // Create mode dependency
        displayedMembersEditMode, // Edit mode dependency
        debouncedSearchQuery,
        orderBy,
        order,
        page,
        rowsPerPage
    ]);

    // Total count for pagination (handles both modes)
    const listTotalCount = useMemo(() => {
        if (mode === 'create') {
            // Client-side filtering affects total count for display
            let filtered = [...localMembers];
            if (debouncedSearchQuery) {
                const lowerQuery = debouncedSearchQuery.toLowerCase();
                filtered = filtered.filter(m =>
                    Object.values(m).some(value =>
                        String(value).toLowerCase().includes(lowerQuery)
                    )
                );
            }
            return filtered.length;
        } else {
            // Edit mode: total count comes from server, potentially adjusted for local additions/deletions
            // This needs careful thought: Should locally added items increase total count immediately?
            // Let's use server count + added - deleted for now.
            return totalMemberCount + addedMembers.length - deletedMemberIds.size;
        }
    }, [mode, localMembers, totalMemberCount, addedMembers.length, deletedMemberIds.size, debouncedSearchQuery]);


    // Existing phone numbers for duplicate checks (memoized)
    const existingPhoneNumbers = useMemo(() => {
        const numbers = new Set<string>();
        if (mode === 'create') {
            localMembers.forEach(m => numbers.add(m.phoneNumber));
        } else {
            // Combine fetched (excluding deleted), added, and potentially updated phone numbers
            fetchedMembers.forEach(m => {
                const id = m[memberIdKey] as string;
                if (!deletedMemberIds.has(id)) {
                    // Check if it was updated to a new number
                    const updatedNumber = updatedMembers[id]?.phoneNumber;
                    numbers.add(updatedNumber ?? m.phoneNumber);
                }
            });
            addedMembers.forEach(m => numbers.add(m.phoneNumber));
        }
        return numbers;
    }, [mode, localMembers, fetchedMembers, addedMembers, updatedMembers, deletedMemberIds, memberIdKey]);

    // === Callbacks ===

    // MemberList Handlers
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleRowsPerPageChange = useCallback((rows: number) => {
        setRowsPerPage(rows);
        setPage(0); // Reset to first page when changing rows per page
    }, []);

    const handleSortChange = useCallback((property: keyof GroupMember) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0); // Reset to first page on sort
    }, [order, orderBy]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        // Debouncing is handled by useEffect
        // Reset page happens in debounce effect for edit mode
        if (mode === 'create') {
            setPage(0); // Reset page immediately for client-side search
        }
    }, [mode]);

    const handleSelectionChange = useCallback((newSelected: readonly string[]) => {
        setSelectedMemberIds(newSelected);
    }, []);

    // Add Member Dialog Handlers
    const handleOpenAddMemberDialog = useCallback(() => {
        setIsAddMemberDialogOpen(true);
    }, []);

    const handleCloseAddMemberDialog = useCallback(() => {
        setIsAddMemberDialogOpen(false);
    }, []);

    const handleAddMemberSubmit = useCallback((newMember: NewMemberData) => {
        setHistoryState(prev => {
            if (mode === 'create') {
                // Simple add to list
                // Need to transform NewMemberData to GroupMember if types differ significantly
                // Assuming they are compatible enough or GroupMember includes all NewMemberData fields
                const memberToAdd = {
                    ...newMember,
                    id: newMember.phoneNumber, // Or generate temp ID based on memberIdKey
                } as GroupMember;
                return {
                    ...prev,
                    members: [...prev.members, memberToAdd],
                };
            } else {
                // Add to addedMembers list in edit mode
                return {
                    ...prev,
                    addedMembers: [...prev.addedMembers, newMember],
                };
            }
        });
        setIsAddMemberDialogOpen(false); // Close dialog on success
        setSelectedMemberIds([]); // Clear selection after adding
    }, [mode, setHistoryState, memberIdKey]);

    // View/Edit Member Dialog Handlers
    const handleViewEditMember = useCallback((member: GroupMember) => {
        setMemberToViewEdit(member);
        setIsMemberDetailsEditing(false); // Start in view mode
    }, []);

    const handleCloseMemberDetails = useCallback(() => {
        setMemberToViewEdit(null);
        setIsMemberDetailsEditing(false);
    }, []);

    const handleSetMemberDetailsEditing = useCallback((editing: boolean) => {
        setIsMemberDetailsEditing(editing);
    }, []);

    const handleMemberUpdateSubmit = useCallback(async (updatedMemberData: GroupMember) => {
        if (!memberToViewEdit) return;

        const memberId = memberToViewEdit[memberIdKey] as string;

        setHistoryState(prev => {
            if (mode === 'create') {
                // Update member in the local list
                return {
                    ...prev,
                    members: prev.members.map(m =>
                        m[memberIdKey] === memberId ? updatedMemberData : m
                    ),
                };
            } else {
                // Edit mode: Check if it's a newly added member or an existing one
                const addedIndex = prev.addedMembers.findIndex(m => m.phoneNumber === memberId); // Assuming phone is key for temp items

                if (addedIndex > -1) {
                    // Update within addedMembers
                    // Need to ensure updatedMemberData conforms to NewMemberData structure if needed
                    const updatedAddedMember = { ...updatedMemberData } as NewMemberData; // Adjust type if necessary
                    const newAddedMembers = [...prev.addedMembers];
                    newAddedMembers[addedIndex] = updatedAddedMember;
                    return { ...prev, addedMembers: newAddedMembers };
                } else {
                    // Update an existing member: store changes in updatedMembers
                    // Calculate diff between updatedMemberData and original fetched/current state
                    const originalMember = fetchedMembers.find(m => m[memberIdKey] === memberId) ?? memberToViewEdit; // Find original
                    const changes: Partial<Omit<GroupMember, 'id'>> = {};
                    (Object.keys(updatedMemberData) as Array<keyof GroupMember>).forEach(key => {
                        if (key !== memberIdKey && key !== 'id' && updatedMemberData[key] !== originalMember[key]) {
                            // @ts-ignore - Dynamically assigning to partial type
                            changes[key] = updatedMemberData[key];
                        }
                    });

                    // Only record if there are actual changes
                    if (Object.keys(changes).length > 0) {
                        return {
                            ...prev,
                            updatedMembers: {
                                ...prev.updatedMembers,
                                [memberId]: { ...(prev.updatedMembers[memberId] || {}), ...changes }, // Merge changes
                            },
                        };
                    } else {
                        // No changes detected, return previous state
                        return prev;
                    }
                }
            }
        });

        handleCloseMemberDetails(); // Close dialog after update
        setSelectedMemberIds([]); // Clear selection

    }, [mode, memberIdKey, setHistoryState, memberToViewEdit, fetchedMembers, handleCloseMemberDetails]);

    // Delete Member Handlers
    const handleDeleteSelectedMembers = useCallback(() => {
        if (selectedMemberIds.length === 0) return;

        // Optional: Add confirmation dialog here

        setHistoryState(prev => {
            if (mode === 'create') {
                // Filter out selected members from local list
                const selectedSet = new Set(selectedMemberIds);
                return {
                    ...prev,
                    members: prev.members.filter(m => !selectedSet.has(m[memberIdKey] as string)),
                };
            } else {
                // Edit mode: Handle deletion of added vs existing members
                const newAddedMembers = prev.addedMembers.filter(m =>
                    !selectedMemberIds.includes(m.phoneNumber) // Assuming phone number is temp key
                );
                const newDeletedIds = new Set(prev.deletedMemberIds);
                let newUpdatedMembers = { ...prev.updatedMembers };

                selectedMemberIds.forEach(id => {
                    // If it wasn't a newly added member, mark it for deletion
                    if (!prev.addedMembers.some(m => m.phoneNumber === id)) {
                        newDeletedIds.add(id);
                        // Remove from updatedMembers if it was marked for update
                        delete newUpdatedMembers[id];
                    }
                });

                return {
                    ...prev,
                    addedMembers: newAddedMembers,
                    deletedMemberIds: newDeletedIds,
                    updatedMembers: newUpdatedMembers,
                };
            }
        });
        setSelectedMemberIds([]); // Clear selection after deletion
    }, [mode, selectedMemberIds, setHistoryState, memberIdKey]);


    // Handler for delete button within MemberDetailsDialogOrDrawer (Edit mode only)
    const handleDeleteFromDetails = useCallback(async (memberId: string) => {
        if (mode !== 'edit') return;

        setIsDeletingMember(true);
        // Optional: Confirmation dialog

        try {
            setHistoryState(prev => {
                const newAddedMembers = prev.addedMembers.filter(m => m.phoneNumber !== memberId);
                const newDeletedIds = new Set(prev.deletedMemberIds);
                let newUpdatedMembers = { ...prev.updatedMembers };

                if (!prev.addedMembers.some(m => m.phoneNumber === memberId)) {
                    newDeletedIds.add(memberId);
                    delete newUpdatedMembers[memberId];
                }

                return {
                    ...prev,
                    addedMembers: newAddedMembers,
                    deletedMemberIds: newDeletedIds,
                    updatedMembers: newUpdatedMembers,
                };
            });
            handleCloseMemberDetails(); // Close dialog after marking for delete
            setSelectedMemberIds([]); // Clear selection
        } catch (error) {
            console.error("Error marking member for deletion:", error);
            // Show error to user?
        } finally {
            setIsDeletingMember(false);
        }

    }, [mode, setHistoryState, handleCloseMemberDetails]);


    // Form Submission Handler
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            if (mode === 'create') {
                const data: GroupFormDataCreate = {
                    name: name.trim(),
                    description: description.trim(),
                    // Pass the current state of locally added members
                    // Ensure they conform to NewMemberData structure if needed
                    members: localMembers.map(m => ({
                        fullName: m.fullName,
                        nationalId: m.nationalId,
                        title: m.title,
                        phoneNumber: m.phoneNumber,
                        idFrontPhotoUrl: m.idFrontPhotoUrl,
                        idBackPhotoUrl: m.idBackPhotoUrl,
                    })),
                };
                await onSubmit(data as any); // Cast needed due to union type
            } else {
                // Edit mode submission
                if (!groupId) {
                    throw new Error("Group ID is missing for edit mode submission.");
                }
                const changes: GroupChanges = {
                    addedMembers: [...addedMembers],
                    updatedMembers: updatedMembers,
                    deletedMemberIds: Array.from(deletedMemberIds),
                };
                // Check if name/description changed
                if (name.trim() !== initialData?.name) {
                    changes.name = name.trim();
                }
                if (description.trim() !== initialData?.description) {
                    changes.description = description.trim();
                }

                const data: GroupFormDataEdit = {
                    id: groupId,
                    changes: changes,
                };
                await onSubmit(data as any); // Cast needed
            }
            // Optionally reset form or navigate away on success by parent component
        } catch (error: any) {
            console.error('Form submission failed:', error);
            setSubmitError(`Submission failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // === Render ===

    const isLoading = isFetchingMembers || isSubmitting || disabled; // Overall loading/disabled state

    return (
        <Box component="form" onSubmit={handleFormSubmit} noValidate>
            <Stack spacing={3}>
                {/* Optional: Display general submission errors */}
                {submitError && (
                    <Alert severity="error" onClose={() => setSubmitError(null)}>
                        {submitError}
                    </Alert>
                )}

                {/* Group Details Section */}
                <GroupDetailsForm
                    name={name}
                    description={description}
                    onNameChange={setName}
                    onDescriptionChange={setDescription}
                    disabled={isLoading}
                />

                {/* Member List Section */}
                <Typography variant="h6" component="h2" gutterBottom>
                    Group Members
                </Typography>
                <MemberList
                    members={membersForList}
                    totalMembers={listTotalCount}
                    isLoading={isFetchingMembers} // Show loading specific to fetching
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    order={order}
                    orderBy={orderBy}
                    onSortChange={handleSortChange}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onViewEditMember={handleViewEditMember}
                    onAddMember={handleOpenAddMemberDialog}
                    onDeleteSelectedMembers={handleDeleteSelectedMembers}
                    selectedMembers={selectedMemberIds}
                    onSelectionChange={handleSelectionChange}
                    memberIdKey={memberIdKey}
                />

                {/* Undo/Redo Controls */}
                {(canUndo || canRedo) && ( // Only show if actions are possible
                    <Box sx={{ alignSelf: 'flex-start' }}>
                        <UndoRedoControls
                            canUndo={canUndo}
                            canRedo={canRedo}
                            onUndo={undo}
                            onRedo={redo}
                            useIconButtons={true} // Example: use icons
                        />
                    </Box>
                )}


                {/* Action Buttons */}
                <Grid container spacing={2} justifyContent="flex-end">
                    {onSecondaryAction && (
                        <Grid item>
                            <Button
                                variant="outlined"
                                onClick={onSecondaryAction}
                                disabled={isLoading}
                                color="inherit" // Use inherit for secondary actions
                            >
                                {secondaryActionLabel}
                            </Button>
                        </Grid>
                    )}
                    <Grid item>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading} // Disable during any loading state
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isSubmitting ? 'Submitting...' : submitActionLabel}
                        </Button>
                    </Grid>
                </Grid>
            </Stack>

            {/* Dialogs */}
            <MemberFormDialog
                open={isAddMemberDialogOpen}
                onClose={handleCloseAddMemberDialog}
                onSubmit={handleAddMemberSubmit}
                // Pass existing numbers excluding the one being edited (not relevant for add dialog)
                existingPhoneNumbers={existingPhoneNumbers}
                uploadFile={uploadFile}
                isSubmitting={isSubmitting} // Disable dialog submit if main form is submitting
            />

            {memberToViewEdit && (
                <MemberDetailsDialogOrDrawer
                    open={!!memberToViewEdit}
                    onClose={handleCloseMemberDetails}
                    memberData={memberToViewEdit}
                    onSubmitChanges={handleMemberUpdateSubmit}
                    isEditing={isMemberDetailsEditing}
                    onSetEditing={handleSetMemberDetailsEditing}
                    isSubmitting={isSubmitting} // Pass submitting state down
                    // Pass existing numbers excluding the current member's original number
                    existingPhoneNumbers={new Set(
                        [...existingPhoneNumbers].filter(num => num !== memberToViewEdit?.phoneNumber)
                    )}
                    uploadFile={uploadFile}
                    memberIdKey={memberIdKey}
                    // Only provide delete handler in edit mode
                    onDeleteMember={mode === 'edit' ? handleDeleteFromDetails : undefined}
                    isDeleting={isDeletingMember}
                />
            )}
        </Box>
    );
};

export default GroupForm;
