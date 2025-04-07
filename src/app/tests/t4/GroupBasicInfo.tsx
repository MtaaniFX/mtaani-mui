'use client';

import React from 'react';
import { 
    Card, 
    CardContent, 
    TextField, 
    Stack,
    Typography 
} from '@mui/material';
import { GroupBasicInfoProps } from './types';

export const GroupBasicInfo: React.FC<GroupBasicInfoProps> = ({
    name,
    description,
    onChange,
    error
}) => {
    const handleChange = (field: 'name' | 'description') => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange({
            name: field === 'name' ? event.target.value : name,
            description: field === 'description' ? event.target.value : description
        });
    };

    return (
        <Card elevation={0} sx={{ bgcolor: 'background.default' }}>
            <CardContent>
                <Stack spacing={3}>
                    <Typography variant="h6" color="primary">
                        Group Information
                    </Typography>

                    <TextField
                        fullWidth
                        label="Group Name"
                        value={name}
                        onChange={handleChange('name')}
                        error={!!error?.name}
                        helperText={error?.name}
                        required
                        placeholder="Enter group name"
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        value={description || ''}
                        onChange={handleChange('description')}
                        error={!!error?.description}
                        helperText={error?.description}
                        multiline
                        rows={4}
                        placeholder="Enter group description (optional)"
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};
