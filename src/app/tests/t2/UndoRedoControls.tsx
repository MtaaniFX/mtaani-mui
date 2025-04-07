// components/group/UndoRedoControls.tsx
import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  Fade
} from '@mui/material';
import {
  Undo as UndoIcon,
  Redo as RedoIcon
} from '@mui/icons-material';
import { GroupInfo, GroupMember } from './types';

// Define the possible operations that can be undone/redone
export type GroupOperation = 
  | { type: 'ADD_MEMBER'; member: GroupMember }
  | { type: 'REMOVE_MEMBERS'; members: GroupMember[] }
  | { type: 'UPDATE_MEMBER'; oldMember: GroupMember; newMember: GroupMember }
  | { type: 'UPDATE_GROUP_INFO'; oldInfo: GroupInfo; newInfo: GroupInfo };


interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  currentOperation?: GroupOperation;
  stackPosition: number;
  totalOperations: number;
}

const getOperationDescription = (operation: GroupOperation): string => {
  switch (operation.type) {
    case 'ADD_MEMBER':
      return `Added member: ${operation.member.fullName}`;
    case 'REMOVE_MEMBERS':
      return `Removed ${operation.members.length} member${operation.members.length > 1 ? 's' : ''}`;
    case 'UPDATE_MEMBER':
      return `Updated member: ${operation.oldMember.fullName}`;
    case 'UPDATE_GROUP_INFO':
      return 'Updated group information';
    default:
      return 'Unknown operation';
  }
};

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentOperation,
  stackPosition,
  totalOperations
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: theme.spacing(3),
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: theme.palette.background.paper,
        padding: 1,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        border: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.snackbar,
      }}
    >
      <Tooltip title="Undo" placement="top">
        <span>
          <IconButton
            size="small"
            onClick={onUndo}
            disabled={!canUndo}
            sx={{
              color: canUndo ? theme.palette.primary.main : theme.palette.action.disabled
            }}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Box
        sx={{
          px: 2,
          minWidth: 200,
          textAlign: 'center'
        }}
      >
        {currentOperation && (
          <Fade in>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {getOperationDescription(currentOperation)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {stackPosition} of {totalOperations}
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>

      <Tooltip title="Redo" placement="top">
        <span>
          <IconButton
            size="small"
            onClick={onRedo}
            disabled={!canRedo}
            sx={{
              color: canRedo ? theme.palette.primary.main : theme.palette.action.disabled
            }}
          >
            <RedoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

// Helper class to manage the undo/redo stack
export class UndoRedoStack {
  private stack: GroupOperation[] = [];
  private position: number = -1;

  push(operation: GroupOperation) {
    // Remove any future redos
    this.stack = this.stack.slice(0, this.position + 1);
    this.stack.push(operation);
    this.position++;
  }

  undo(): GroupOperation | undefined {
    if (this.canUndo()) {
      const operation = this.stack[this.position];
      this.position--;
      return operation;
    }
    return undefined;
  }

  redo(): GroupOperation | undefined {
    if (this.canRedo()) {
      this.position++;
      return this.stack[this.position];
    }
    return undefined;
  }

  canUndo(): boolean {
    return this.position >= 0;
  }

  canRedo(): boolean {
    return this.position < this.stack.length - 1;
  }

  getCurrentOperation(): GroupOperation | undefined {
    return this.stack[this.position];
  }

  getPosition(): number {
    return this.position + 1;
  }

  getTotalOperations(): number {
    return this.stack.length;
  }

  clear() {
    this.stack = [];
    this.position = -1;
  }
}

export default UndoRedoControls;
