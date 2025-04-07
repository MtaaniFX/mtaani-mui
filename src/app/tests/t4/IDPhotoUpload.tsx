'use client';

import React, { useCallback, useState } from 'react';
import { 
    Box, 
    Button, 
    Card, 
    CardMedia, 
    Stack, 
    Typography,
    IconButton,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { IDPhotos } from './types';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface IDPhotoUploadProps {
    photos: IDPhotos;
    onPhotoChange: (photos: IDPhotos) => void;
    loading?: {
        front?: boolean;
        back?: boolean;
    };
}

export const IDPhotoUpload: React.FC<IDPhotoUploadProps> = ({
    photos,
    onPhotoChange,
    loading = { front: false, back: false }
}) => {
    const [previewUrls, setPreviewUrls] = useState<IDPhotos>({
        frontUrl: photos.frontUrl,
        backUrl: photos.backUrl
    });

    const handleFileChange = useCallback(async (side: 'front' | 'back') => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrls(prev => ({
            ...prev,
            [side === 'front' ? 'frontUrl' : 'backUrl']: previewUrl
        }));

        // Trigger parent callback with the file
        onPhotoChange({
            ...photos,
            [side === 'front' ? 'frontUrl' : 'backUrl']: file
        });
    }, [photos, onPhotoChange]);

    const handleDelete = useCallback((side: 'front' | 'back') => () => {
        setPreviewUrls(prev => ({
            ...prev,
            [side === 'front' ? 'frontUrl' : 'backUrl']: undefined
        }));
        onPhotoChange({
            ...photos,
            [side === 'front' ? 'frontUrl' : 'backUrl']: undefined
        });
    }, [photos, onPhotoChange]);

    const PhotoUploadCard = ({ 
        side, 
        url, 
        isLoading 
    }: { 
        side: 'front' | 'back'; 
        url?: string;
        isLoading: boolean;
    }) => (
        <Card
            sx={{
                width: '100%',
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}
        >
            {isLoading ? (
                <CircularProgress />
            ) : url ? (
                <>
                    <CardMedia
                        component="img"
                        image={url}
                        alt={`ID ${side} side`}
                        sx={{
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                    <IconButton
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper'
                        }}
                        onClick={handleDelete(side)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </>
            ) : (
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                >
                    Upload {side} side
                    <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange(side)}
                    />
                </Button>
            )}
        </Card>
    );

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                ID Photos (Optional)
            </Typography>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 1 }}
            >
                <PhotoUploadCard
                    side="front"
                    url={previewUrls.frontUrl}
                    isLoading={loading.front || false}
                />
                <PhotoUploadCard
                    side="back"
                    url={previewUrls.backUrl}
                    isLoading={loading.back || false}
                />
            </Stack>
        </Box>
    );
};
