// src/components/UndoRedoControls.tsx
import React from 'react';
import { Stack, Button, IconButton, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

/**
 * Props for the UndoRedoControls component.
 */
interface UndoRedoControlsProps {
    /** Indicates if the undo action is currently possible */
    canUndo: boolean;
    /** Indicates if the redo action is currently possible */
    canRedo: boolean;
    /** Callback function triggered when the Undo button is clicked */
    onUndo: () => void;
    /** Callback function triggered when the Redo button is clicked */
    onRedo: () => void;
    /** Optional: Use IconButtons instead of text Buttons */
    useIconButtons?: boolean;
}

/**
 * A client component that displays Undo and Redo buttons,
 * enabling/disabling them based on the provided props.
 */
const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    useIconButtons = false, // Default to text buttons
}) => {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {useIconButtons ? (
                <>
                    <Tooltip title="Undo last action">
                        {/* Wrap disabled IconButton in span for Tooltip to work */}
                        <span>
                            <IconButton
                                aria-label="Undo last action"
                                onClick={onUndo}
                                disabled={!canUndo}
                                color="primary"
                            >
                                <UndoIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Redo last action">
                        {/* Wrap disabled IconButton in span for Tooltip to work */}
                        <span>
                            <IconButton
                                aria-label="Redo last action"
                                onClick={onRedo}
                                disabled={!canRedo}
                                color="primary"
                            >
                                <RedoIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </>
            ) : (
                <>
                    <Button
                        variant="text" // Use text variant for less emphasis
                        startIcon={<UndoIcon />}
                        onClick={onUndo}
                        disabled={!canUndo}
                        aria-label="Undo last action"
                        color="primary" // Use theme primary color
                    >
                        Undo
                    </Button>
                    <Button
                        variant="text"
                        startIcon={<RedoIcon />}
                        onClick={onRedo}
                        disabled={!canRedo}
                        aria-label="Redo last action"
                        color="primary" // Use theme primary color
                    >
                        Redo
                    </Button>
                </>
            )}
        </Stack>
    );
};

export default UndoRedoControls;
