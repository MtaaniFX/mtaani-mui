import React from 'react';
import { Box, Typography } from '@mui/material';

interface CircleWithNumberProps {
    number: number;
    size?: number;
}

const NumberBadge: React.FC<CircleWithNumberProps> = ({ number, size }) => {
    if(size === undefined) {
        size = 24;
    }
    
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width={size}
            height={size}
            borderRadius="50%"
            bgcolor="primary.main"
        >
            <Typography variant='caption'
                sx={{
                    color: 'primary.contrastText',
                }}
            >
                {number}
            </Typography>
        </Box>
    );
};

export default NumberBadge;
