import { useCallback, useRef, useState } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UndoRedoActions {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    clear: () => void;
}

export function useUndoRedo<T>(initialPresent: T): [T, (newState: T) => void, UndoRedoActions] {
    const [state, setState] = useState<HistoryState<T>>({
        past: [],
        present: initialPresent,
        future: [],
    });

    // Use ref to avoid recreating functions on every render
    const stateRef = useRef(state);
    stateRef.current = state;

    // Set new state and add previous state to history
    const set = useCallback((newPresent: T) => {
        const { past, present } = stateRef.current;
        
        if (newPresent === present) {
            return; // Don't store state if nothing changed
        }

        setState({
            past: [...past, present],
            present: newPresent,
            future: [],
        });
    }, []);

    // Undo to last state
    const undo = useCallback(() => {
        const { past, present, future } = stateRef.current;

        if (past.length === 0) {
            return;
        }

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setState({
            past: newPast,
            present: previous,
            future: [present, ...future],
        });
    }, []);

    // Redo previously undone state
    const redo = useCallback(() => {
        const { past, present, future } = stateRef.current;

        if (future.length === 0) {
            return;
        }

        const next = future[0];
        const newFuture = future.slice(1);

        setState({
            past: [...past, present],
            present: next,
            future: newFuture,
        });
    }, []);

    // Clear history
    const clear = useCallback(() => {
        setState({
            past: [],
            present: stateRef.current.present,
            future: [],
        });
    }, []);

    // Derived state
    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    return [
        state.present,
        set,
        {
            canUndo,
            canRedo,
            undo,
            redo,
            clear,
        },
    ];
}

// Optional: Create a component to manage undo/redo controls
// UndoRedoControls.tsx
import React from 'react';
import { 
    IconButton, 
    Stack, 
    Tooltip,
    Typography 
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

interface UndoRedoControlsProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}) => {
    return (
        <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center"
        >
            <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mr: 1 }}
            >
                Actions:
            </Typography>
            <Tooltip title="Undo">
                <span>
                    <IconButton 
                        size="small"
                        onClick={onUndo} 
                        disabled={!canUndo}
                    >
                        <UndoIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Redo">
                <span>
                    <IconButton 
                        size="small"
                        onClick={onRedo} 
                        disabled={!canRedo}
                    >
                        <RedoIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
};
