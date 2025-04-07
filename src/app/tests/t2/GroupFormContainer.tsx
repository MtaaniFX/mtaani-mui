'use client'

import React, { useState, useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import GroupBasicInfo from './GroupBasicInfo';
import MemberAddForm from './MemberAddForm';
import MembersTable from './MembersTable';
import UndoRedoControls, { UndoRedoStack, GroupOperation } from './UndoRedoControls';
import ActionButtons from './ActionButtons';
import { GroupData, GroupMember } from './types';

interface GroupFormContainerProps {
  mode: 'create' | 'edit';
  groupId?: string;
  onSubmit: (data: GroupData) => Promise<void>;
  onBack?: () => void;
  // For edit mode
  fetchMembers?: (page: number, limit: number) => Promise<{
    members: GroupMember[];
    total: number;
  }>;
  initialData?: {
    name: string;
    description?: string;
  };
}

const GroupFormContainer: React.FC<GroupFormContainerProps> = ({
  mode,
  groupId,
  onSubmit,
  onBack,
  fetchMembers,
  initialData
}) => {
  // Basic info state
  const [groupName, setGroupName] = useState(initialData?.name || '');
  const [groupDescription, setGroupDescription] = useState(initialData?.description || '');
  const [basicInfoErrors, setBasicInfoErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Members state
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  // Undo/Redo state
  const [undoRedoStack] = useState(() => new UndoRedoStack());
  const [, forceUpdate] = useState({});

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial data in edit mode
  useEffect(() => {
    if (mode === 'edit' && fetchMembers) {
      loadMembers();
    }
  }, [mode, fetchMembers, page, rowsPerPage]);

  const loadMembers = async () => {
    if (!fetchMembers) return;
    
    setLoading(true);
    try {
      const { members: fetchedMembers, total } = await fetchMembers(page, rowsPerPage);
      setMembers(fetchedMembers);
      setTotalMembers(total);
    } catch (error) {
      setSubmitError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const validateBasicInfo = (): boolean => {
    const errors: typeof basicInfoErrors = {};
    
    if (!groupName.trim()) {
      errors.name = 'Group name is required';
    }

    setBasicInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMember = (member: GroupMember) => {
    const operation: GroupOperation = {
      type: 'ADD_MEMBER',
      member
    };
    
    undoRedoStack.push(operation);
    setMembers(prev => [...prev, member]);
    setHasChanges(true);
    forceUpdate({});
  };

  const handleRemoveSelected = () => {
    const membersToRemove = members.filter(m => selectedMembers.has(m.phoneNumber));
    const operation: GroupOperation = {
      type: 'REMOVE_MEMBERS',
      members: membersToRemove
    };

    undoRedoStack.push(operation);
    setMembers(prev => prev.filter(m => !selectedMembers.has(m.phoneNumber)));
    setSelectedMembers(new Set());
    setHasChanges(true);
    forceUpdate({});
  };

  const handleUndo = () => {
    const operation = undoRedoStack.undo();
    if (operation) {
      applyReverseOperation(operation);
      forceUpdate({});
    }
  };

  const handleRedo = () => {
    const operation = undoRedoStack.redo();
    if (operation) {
      applyOperation(operation);
      forceUpdate({});
    }
  };

  const applyOperation = (operation: GroupOperation) => {
    switch (operation.type) {
      case 'ADD_MEMBER':
        setMembers(prev => [...prev, operation.member]);
        break;
      case 'REMOVE_MEMBERS':
        setMembers(prev => 
          prev.filter(member => 
            !operation.members.find(m => m.phoneNumber === member.phoneNumber)
          )
        );
        break;
      // Handle other cases
    }
    setHasChanges(true);
  };

  const applyReverseOperation = (operation: GroupOperation) => {
    switch (operation.type) {
      case 'ADD_MEMBER':
        setMembers(prev => 
          prev.filter(m => m.phoneNumber !== operation.member.phoneNumber)
        );
        break;
      case 'REMOVE_MEMBERS':
        setMembers(prev => [...prev, ...operation.members]);
        break;
      // Handle other cases
    }
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    if (!validateBasicInfo()) return;

    setLoading(true);
    setSubmitError(undefined);

    try {
      await onSubmit({
        name: groupName,
        description: groupDescription,
        members
      });
      
      setHasChanges(false);
      undoRedoStack.clear();
    } catch (error) {
      setSubmitError('Failed to submit group data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <GroupBasicInfo
          name={groupName}
          description={groupDescription}
          onNameChange={(name) => {
            setGroupName(name);
            setHasChanges(true);
          }}
          onDescriptionChange={(desc) => {
            setGroupDescription(desc);
            setHasChanges(true);
          }}
          error={basicInfoErrors}
        />

        <MemberAddForm
          onAddMember={handleAddMember}
          existingPhoneNumbers={new Set(members.map(m => m.phoneNumber))}
        />

        <MembersTable
          members={members}
          totalMembers={totalMembers}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          selectedMembers={selectedMembers}
          onSelectMembers={setSelectedMembers}
          onDeleteSelected={handleRemoveSelected}
        />
      </Box>

      <UndoRedoControls
        canUndo={undoRedoStack.canUndo()}
        canRedo={undoRedoStack.canRedo()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        currentOperation={undoRedoStack.getCurrentOperation()}
        stackPosition={undoRedoStack.getPosition()}
        totalOperations={undoRedoStack.getTotalOperations()}
      />

      <ActionButtons
        mode={mode}
        onSubmit={handleSubmit}
        onBack={onBack}
        loading={loading}
        hasChanges={hasChanges}
        disableSubmit={!groupName.trim() || loading}
        submitError={submitError}
      />
    </Container>
  );
};

export default GroupFormContainer;
