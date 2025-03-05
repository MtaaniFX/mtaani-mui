'use client'

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Chip,
    CircularProgress,
} from '@mui/material';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
    verified: 'success',
    pending: 'warning',
    rejected: 'error',
};

const PhoneVerificationListPage = () => {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchVerifications = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .schema('app_phone')
                    .from('phone_verification')
                    .select('phone_number, verified, verified_at')
                    .order('verified_at', { ascending: false })
                    .range(page * rowsPerPage, (page + 1) * rowsPerPage - 1);
                if (error) throw error;
                setVerifications(data || []);
            } catch (err: any) {
                setError(err.message);
            }
            setLoading(false);
        };
        fetchVerifications();
    }, [page, rowsPerPage]);

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
                Phone Verifications
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ textAlign: 'center' }}>
                    {error}
                </Typography>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'primary.main' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Phone Number</TableCell>
                                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white' }}>Verified At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {verifications.length > 0 ? (
                                    verifications.map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{row.phone_number}</TableCell>
                                            <TableCell>
                                                <Chip label={row.status} color={STATUS_COLORS[row.status] || 'default'} />
                                            </TableCell>
                                            <TableCell>{row.verified_at ? new Date(row.verified_at).toLocaleString() : '—'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            No verification requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={-1} // Since we don't know total count, Supabase can fetch more dynamically
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                    />
                </>
            )}
        </Box>
    );
};

export default PhoneVerificationListPage;
