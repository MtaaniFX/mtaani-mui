import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

interface FullScreenOverlayProps {
  open: boolean;  // State to control visibility of the overlay
  message?: string;  // Optional message to display while loading
}

export const FullScreenOverlay: React.FC<FullScreenOverlayProps> = ({ open, message }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <CircularProgress color="inherit" />
        {message && (
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};
