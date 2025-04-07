'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem,
    useMediaQuery,
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { GroupMember, GroupTitle, IDPhotos } from './types';
import { IDPhotoUpload } from './IDPhotoUpload';

interface AddEditMemberDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (member: GroupMember) => void;
    member?: GroupMember;
    existingPhoneNumbers?: string[];
    loading?: boolean;
}

const GROUP_TITLES: GroupTitle[] = [
    'admin',
    'chair',
    'deputy chair',
    'treasurer',
    'secretary',
    'member'
];

const initialMember: GroupMember = {
    fullName: '',
    nationalId: '',
    groupTitle: 'member',
    phoneNumber: '',
    idPhotos: { frontUrl: undefined, backUrl: undefined }
};

export const AddEditMemberDialog: React.FC<AddEditMemberDialogProps> = ({
    open,
    onClose,
    onSave,
    member,
    existingPhoneNumbers = [],
    loading = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [formData, setFormData] = useState<GroupMember>(initialMember);
    const [errors, setErrors] = useState<Partial<Record<keyof GroupMember, string>>>({});
    const [photoLoading, setPhotoLoading] = useState({ front: false, back: false });

    useEffect(() => {
        if (member) {
            setFormData(member);
        } else {
            setFormData(initialMember);
        }
        setErrors({});
    }, [member, open]);

    const handleChange = (field: keyof GroupMember) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }

        // Check for duplicate phone number
        if (field === 'phoneNumber' && 
            existingPhoneNumbers.includes(event.target.value) && 
            (!member || member.phoneNumber !== event.target.value)) {
            setErrors(prev => ({
                ...prev,
                phoneNumber: 'Phone number already exists in group'
            }));
        }
    };

    const handlePhotoChange = (photos: IDPhotos) => {
        setFormData(prev => ({
            ...prev,
            idPhotos: photos
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof GroupMember, string>> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        if (!formData.nationalId.trim()) {
            newErrors.nationalId = 'National ID is required';
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (
            existingPhoneNumbers.includes(formData.phoneNumber) && 
            (!member || member.phoneNumber !== formData.phoneNumber)
        ) {
            newErrors.phoneNumber = 'Phone number already exists in group';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave(formData);
        }
    };

    const content = (
        <>
            <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    required
                />

                <TextField
                    fullWidth
                    label="National ID"
                    value={formData.nationalId}
                    onChange={handleChange('nationalId')}
                    error={!!errors.nationalId}
                    helperText={errors.nationalId}
                    required
                />

                <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange('phoneNumber')}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    required
                />

                <TextField
                    select
                    fullWidth
                    label="Group Title"
                    value={formData.groupTitle}
                    onChange={handleChange('groupTitle')}
                    required
                >
                    {GROUP_TITLES.map((title) => (
                        <MenuItem key={title} value={title}>
                            {title.charAt(0).toUpperCase() + title.slice(1)}
                        </MenuItem>
                    ))}
                </TextField>

                <IDPhotoUpload
                    photos={formData.idPhotos || {}}
                    onPhotoChange={handlePhotoChange}
                    loading={photoLoading}
                />
            </Stack>
        </>
    );

    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                PaperProps={{
                    sx: { 
                        maxHeight: '90vh',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16
                    }
                }}
            >
                <AppBar position="static" color="transparent" elevation={0}>
                    <Toolbar>
                        <Typography sx={{ flex: 1 }} variant="h6">
                            {member ? 'Edit Member' : 'Add Member'}
                        </Typography>
                        <IconButton edge="end" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box sx={{ p: 2 }}>
                    {content}
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mt: 3, mb: 2 }}
                        justifyContent="flex-end"
                    >
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        );
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {member ? 'Edit Member' : 'Add Member'}
            </DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
