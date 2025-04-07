// components/group/MemberAddForm.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Box,
  Typography,
  Button,
  MenuItem,
  Grid,
  IconButton,
  useTheme,
  Collapse,
  Alert
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (you'll need to move this to an environment config)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MemberAddFormProps {
  onAddMember: (member: GroupMember) => void;
  existingPhoneNumbers: Set<string>;
  onCancel?: () => void;
}

const GROUP_TITLES = [
  'admin',
  'chair',
  'deputy chair',
  'treasurer',
  'secretary',
  'member',
] as const;

type GroupTitle = typeof GROUP_TITLES[number];

interface GroupMember {
  fullName: string;
  nationalId: string;
  groupTitle: GroupTitle;
  phoneNumber: string;
  idFrontUrl?: string;
  idBackUrl?: string;
}

const MemberAddForm: React.FC<MemberAddFormProps> = ({
  onAddMember,
  existingPhoneNumbers,
  onCancel
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GroupMember>({
    fullName: '',
    nationalId: '',
    groupTitle: 'member',
    phoneNumber: '',
  });

  const [idPhotos, setIdPhotos] = useState<{
    front?: File;
    back?: File;
  }>({});

  const [fieldErrors, setFieldErrors] = useState<{
    [K in keyof GroupMember]?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.nationalId.trim()) {
      errors.nationalId = 'National ID is required';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (existingPhoneNumbers.has(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number already exists';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (file: File, type: 'front' | 'back'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `id-photos/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('group-members')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Failed to upload file');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('group-members')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const uploadedUrls: { idFrontUrl?: string; idBackUrl?: string } = {};

      if (idPhotos.front) {
        uploadedUrls.idFrontUrl = await handleFileUpload(idPhotos.front, 'front');
      }

      if (idPhotos.back) {
        uploadedUrls.idBackUrl = await handleFileUpload(idPhotos.back, 'back');
      }

      onAddMember({
        ...formData,
        ...uploadedUrls
      });

      // Reset form
      setFormData({
        fullName: '',
        nationalId: '',
        groupTitle: 'member',
        phoneNumber: '',
      });
      setIdPhotos({});
    } catch (err) {
      setError('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Add New Member
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                error={!!fieldErrors.fullName}
                helperText={fieldErrors.fullName}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="National ID"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                error={!!fieldErrors.nationalId}
                helperText={fieldErrors.nationalId}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                error={!!fieldErrors.phoneNumber}
                helperText={fieldErrors.phoneNumber}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Group Title"
                value={formData.groupTitle}
                onChange={(e) => setFormData({ ...formData, groupTitle: e.target.value as GroupTitle })}
                disabled={loading}
              >
                {GROUP_TITLES.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title.charAt(0).toUpperCase() + title.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                ID Photos (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  disabled={loading}
                >
                  Front
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIdPhotos(prev => ({ ...prev, front: file }));
                      }
                    }}
                  />
                </Button>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  disabled={loading}
                >
                  Back
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIdPhotos(prev => ({ ...prev, back: file }));
                      }
                    }}
                  />
                </Button>
              </Box>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {onCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  Add Member
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberAddForm;
