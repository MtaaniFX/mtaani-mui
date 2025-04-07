'use client';

import React, { useState, useMemo } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Paper,
    IconButton,
    Button,
    Checkbox,
    TextField,
    InputAdornment,
    Typography,
    Stack,
    Toolbar,
    alpha,
    Skeleton,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { GroupMember } from './types';
import { AddEditMemberDialog } from './AddEditMemberDialog';

type Order = 'asc' | 'desc';
type OrderBy = keyof Pick<GroupMember, 'fullName' | 'phoneNumber' | 'groupTitle' | 'nationalId'>;

interface MemberTableProps {
    members: GroupMember[];
    onMemberAdd: (member: GroupMember) => void;
    onMemberEdit: (member: GroupMember) => void;
    onMemberDelete: (members: GroupMember[]) => void;
    loading?: boolean;
    pagination?: {
        total: number;
        page: number;
        pageSize: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (pageSize: number) => void;
    };
}

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <Box
        sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
        }}
    >
        <Typography variant="h6" color="text.secondary">
            No Members Added Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
            Start by adding your first group member
        </Typography>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
        >
            Add Member
        </Button>
    </Box>
);

export const MemberTable: React.FC<MemberTableProps> = ({
    members,
    onMemberAdd,
    onMemberEdit,
    onMemberDelete,
    loading = false,
    pagination,
}) => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<OrderBy>('fullName');
    const [selected, setSelected] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<GroupMember | undefined>();

    const handleRequestSort = (property: OrderBy) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = members.map(m => m.phoneNumber);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (phoneNumber: string) => {
        const selectedIndex = selected.indexOf(phoneNumber);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, phoneNumber);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const searchStr = searchQuery.toLowerCase();
            return (
                member.fullName.toLowerCase().includes(searchStr) ||
                member.phoneNumber.includes(searchStr) ||
                member.nationalId.includes(searchStr) ||
                member.groupTitle.toLowerCase().includes(searchStr)
            );
        });
    }, [members, searchQuery]);

    const sortedMembers = useMemo(() => {
        const comparator = (a: GroupMember, b: GroupMember) => {
            const valueA = a[orderBy];
            const valueB = b[orderBy];
            
            if (valueA < valueB) {
                return order === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        };

        return [...filteredMembers].sort(comparator);
    }, [filteredMembers, order, orderBy]);

    const handleDeleteSelected = () => {
        const membersToDelete = members.filter(m => selected.includes(m.phoneNumber));
        onMemberDelete(membersToDelete);
        setSelected([]);
    };

    const handleSave = (member: GroupMember) => {
        if (editingMember) {
            onMemberEdit(member);
        } else {
            onMemberAdd(member);
        }
        setDialogOpen(false);
        setEditingMember(undefined);
    };

    const renderTableHeader = () => (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={selected.length > 0 && selected.length < members.length}
                        checked={members.length > 0 && selected.length === members.length}
                        onChange={handleSelectAllClick}
                    />
                </TableCell>
                {['Full Name', 'Phone Number', 'National ID', 'Group Title'].map((header, index) => (
                    <TableCell
                        key={header}
                        sortDirection={orderBy === Object.keys(members[0])[index] ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === Object.keys(members[0])[index]}
                            direction={orderBy === Object.keys(members[0])[index] ? order : 'asc'}
                            onClick={() => handleRequestSort(Object.keys(members[0])[index] as OrderBy)}
                        >
                            {header}
                        </TableSortLabel>
                    </TableCell>
                ))}
                <TableCell>Actions</TableCell>
            </TableRow>
        </TableHead>
    );

    if (loading) {
        return (
            <Box sx={{ mt: 3 }}>
                {[...Array(5)].map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rectangular"
                        height={53}
                        sx={{ my: 0.5 }}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 },
                        ...(selected.length > 0 && {
                            bgcolor: (theme) =>
                                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                        }),
                    }}
                >
                    {selected.length > 0 ? (
                        <Typography
                            sx={{ flex: '1 1 100%' }}
                            color="inherit"
                            variant="subtitle1"
                        >
                            {selected.length} selected
                        </Typography>
                    ) : (
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search members..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: '1 1 100%' }}
                        />
                    )}

                    {selected.length > 0 ? (
                        <IconButton onClick={handleDeleteSelected}>
                            <DeleteIcon />
                        </IconButton>
                    ) : (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setDialogOpen(true)}
                        >
                            Add Member
                        </Button>
                    )}
                </Toolbar>

                {members.length === 0 ? (
                    <EmptyState onAdd={() => setDialogOpen(true)} />
                ) : (
                    <>
                        <TableContainer>
                            <Table stickyHeader>
                                {renderTableHeader()}
                                <TableBody>
                                    {sortedMembers.map((member) => (
                                        <TableRow
                                            hover
                                            key={member.phoneNumber}
                                            selected={selected.includes(member.phoneNumber)}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selected.includes(member.phoneNumber)}
                                                    onChange={() => handleClick(member.phoneNumber)}
                                                />
                                            </TableCell>
                                            <TableCell>{member.fullName}</TableCell>
                                            <TableCell>{member.phoneNumber}</TableCell>
                                            <TableCell>{member.nationalId}</TableCell>
                                            <TableCell>{member.groupTitle}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => {
                                                        setEditingMember(member);
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {pagination && (
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
                                component="div"
                                count={pagination.total}
                                rowsPerPage={pagination.pageSize}
                                page={pagination.page}
                                onPageChange={(_, page) => pagination.onPageChange(page)}
                                onRowsPerPageChange={(e) => 
                                    pagination.onPageSizeChange(parseInt(e.target.value, 10))
                                }
                            />
                        )}
                    </>
                )}
            </Paper>

            <AddEditMemberDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditingMember(undefined);
                }}
                onSave={handleSave}
                member={editingMember}
                existingPhoneNumbers={members.map(m => m.phoneNumber)}
            />
        </Box>
    );
};
