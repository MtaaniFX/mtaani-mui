// components/group/ActionButtons.tsx
import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Warning as WarningIcon
} from '@mui/icons-material';

interface ActionButtonsProps {
  onSubmit: () => void;
  onBack?: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
  hasChanges: boolean;
  disableSubmit?: boolean;
  submitError?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSubmit,
  onBack,
  loading = false,
  mode,
  hasChanges,
  disableSubmit = false,
  submitError
}) => {
  const theme = useTheme();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onBack?.();
    }
  };

  const handleSubmit = () => {
    if (submitError) {
      setShowErrorDialog(true);
    } else {
      onSubmit();
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: theme.spacing(2),
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: theme.zIndex.appBar,
        }}
      >
        {onBack && (
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            disabled={loading}
            variant="outlined"
            color="inherit"
          >
            Back
          </Button>
        )}

        <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
          {hasChanges && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              You have unsaved changes
            </Typography>
          )}

          <Tooltip
            title={
              disableSubmit
                ? "Please fill in all required fields"
                : mode === 'create'
                ? "Create group"
                : "Save changes"
            }
          >
            <span>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || disableSubmit || !hasChanges}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
              >
                {mode === 'create' ? 'Create Group' : 'Save Changes'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Unsaved Changes
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to leave? All changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowConfirmDialog(false);
              onBack?.();
            }}
            color="error"
            variant="contained"
          >
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            Cannot Submit
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography color="error">
            {submitError}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowErrorDialog(false)}
            color="primary"
            variant="contained"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionButtons;
