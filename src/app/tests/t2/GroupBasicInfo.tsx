// components/group/GroupBasicInfo.tsx
import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Box,
  Typography,
  useTheme
} from '@mui/material';

interface GroupBasicInfoProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  error?: {
    name?: string;
    description?: string;
  };
}

const GroupBasicInfo: React.FC<GroupBasicInfoProps> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  error
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        mb: 3
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            color="primary"
            sx={{
              mb: 2,
              fontWeight: 500
            }}
          >
            Group Information
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Enter the basic details of your group
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <TextField
            fullWidth
            label="Group Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            error={!!error?.name}
            helperText={error?.name}
            placeholder="Enter group name"
            InputProps={{
              sx: {
                borderRadius: 1
              }
            }}
          />

          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            error={!!error?.description}
            helperText={error?.description}
            placeholder="Enter group description"
            multiline
            rows={4}
            InputProps={{
              sx: {
                borderRadius: 1
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Example usage in parent component:
const validation = (name: string): string | undefined => {
  if (!name.trim()) return 'Group name is required';
  if (name.length < 3) return 'Group name must be at least 3 characters';
  return undefined;
};

export default GroupBasicInfo;
