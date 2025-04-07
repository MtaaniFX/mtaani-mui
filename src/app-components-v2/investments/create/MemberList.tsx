// src/components/MemberList.tsx
import React, { useState, useMemo } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    Paper,
    Checkbox,
    IconButton,
    Tooltip,
    Toolbar,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Stack,
    LinearProgress, // For loading state
    useTheme,
    useMediaQuery,
    alpha, // For selected row highlight
} from '@mui/material';
import { visuallyHidden } from '@mui/utils'; // For screen reader accessibility on sort labels
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // For empty state

import { GroupMember, GroupTitle } from './types';

// Define the structure for table headers
interface HeadCell {
    id: keyof Pick<GroupMember, 'fullName' | 'nationalId' | 'title' | 'phoneNumber'>; // Sortable fields
    label: string;
    numeric: boolean; // For alignment
    disablePadding: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'fullName', numeric: false, disablePadding: false, label: 'Full Name' },
    { id: 'nationalId', numeric: false, disablePadding: false, label: 'National ID' },
    { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
    { id: 'phoneNumber', numeric: false, disablePadding: false, label: 'Phone Number' },
];

type Order = 'asc' | 'desc';

/**
 * Props for the EnhancedTableHead component.
 */
interface EnhancedTableHeadProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: HeadCell['id']) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    showCheckboxes: boolean; // Control if checkboxes are rendered
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, showCheckboxes } = props;
    const createSortHandler = (property: HeadCell['id']) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {showCheckboxes && (
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{ 'aria-label': 'select all members' }}
                        />
                    </TableCell>
                )}
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ fontWeight: 'bold' }} // Make headers bold
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

/**
 * Props for the EnhancedTableToolbar component.
 */
interface EnhancedTableToolbarProps {
    numSelected: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddMember: () => void;
    onDeleteSelected: () => void;
    isSearchDisabled?: boolean; // e.g., disable during loading
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected, searchQuery, onSearchChange, onAddMember, onDeleteSelected, isSearchDisabled } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
                display: 'flex',
                flexWrap: 'wrap', // Allow wrapping on small screens
                gap: 2, // Spacing between items
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 auto' }} // Takes up space
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                 // Search Field takes up remaining space when nothing is selected
                 <Box sx={{ flex: '1 1 auto', minWidth: '200px' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search members..."
                        value={searchQuery}
                        disabled={isSearchDisabled}
                        onChange={(e) => onSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                 </Box>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} alignItems="center">
                {numSelected > 0 ? (
                    <Tooltip title="Delete selected members">
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={onDeleteSelected}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Tooltip>
                ) : (
                    <Tooltip title="Add new member">
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={onAddMember}
                            size={isMobile ? "small" : "medium"} // Adjust size on mobile
                        >
                            Add Member
                        </Button>
                    </Tooltip>
                )}
            </Stack>
        </Toolbar>
    );
}


/**
 * Props for the MemberList component.
 */
interface MemberListProps {
    /** Array of member objects to display for the current page */
    members: ReadonlyArray<GroupMember>; // Use ReadonlyArray for good practice
    /** Total count of members (for pagination, especially in edit mode) */
    totalMembers: number;
    /** Indicates if data is currently being loaded */
    isLoading: boolean;
    /** Current page number (zero-based) */
    page: number;
    /** Number of rows per page */
    rowsPerPage: number;
    /** Callback when the page changes */
    onPageChange: (newPage: number) => void;
    /** Callback when rows per page changes */
    onRowsPerPageChange: (rows: number) => void;
    /** Current sort order */
    order: Order;
    /** Current property being sorted by */
    orderBy: keyof GroupMember | '';
    /** Callback when a column sort is requested */
    onSortChange: (property: HeadCell['id']) => void;
    /** Current search query */
    searchQuery: string;
    /** Callback when the search input changes (debounced recommended in parent) */
    onSearchChange: (query: string) => void;
    /** Callback function when a user clicks on a row (passes the member object) */
    onViewEditMember: (member: GroupMember) => void;
    /** Callback function when the "Add Member" button is clicked */
    onAddMember: () => void;
    /** Callback function when the delete action is triggered for selected members */
    onDeleteSelectedMembers: (selectedIds: readonly string[]) => void;
    /** Array of identifiers (e.g., phone numbers or unique IDs) for currently selected members */
    selectedMembers: readonly string[];
    /** Callback function when row selection changes (passes the new array of selected IDs) */
    onSelectionChange: (newSelected: readonly string[]) => void;
    /** Identifier key for selection and unique row keys */
    memberIdKey: keyof GroupMember; // e.g., 'phoneNumber' or a unique 'id'
}

/**
 * A client component that displays a list of group members in a responsive,
 * sortable, searchable, and paginated table with selection capabilities.
 */
const MemberList: React.FC<MemberListProps> = ({
    members,
    totalMembers,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    order,
    orderBy,
    onSortChange,
    searchQuery,
    onSearchChange,
    onViewEditMember,
    onAddMember,
    onDeleteSelectedMembers,
    selectedMembers,
    onSelectionChange,
    memberIdKey,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: HeadCell['id'],
    ) => {
        onSortChange(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = members.map((n) => n[memberIdKey] as string);
            onSelectionChange(newSelected);
            return;
        }
        onSelectionChange([]);
    };

    const handleRowClick = (event: React.MouseEvent<unknown>, member: GroupMember) => {
         // Check if the click was on the checkbox or inside an action button if any were added later
         const target = event.target as HTMLElement;
         if (target.closest('input[type="checkbox"]')) {
             return; // Let checkbox handler manage selection
         }
         // If clicking anywhere else on the row, trigger view/edit
        onViewEditMember(member);
    };

    const handleCheckboxClick = (event: React.MouseEvent<unknown>, id: string) => {
        event.stopPropagation(); // Prevent row click when clicking checkbox
        const selectedIndex = selectedMembers.indexOf(id);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedMembers, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedMembers.slice(1));
        } else if (selectedIndex === selectedMembers.length - 1) {
            newSelected = newSelected.concat(selectedMembers.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedMembers.slice(0, selectedIndex),
                selectedMembers.slice(selectedIndex + 1),
            );
        }
        onSelectionChange(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        onPageChange(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        onRowsPerPageChange(parseInt(event.target.value, 10));
    };

    const isSelected = (id: string) => selectedMembers.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    // Note: This might not be needed if totalMembers is accurate from server-side pagination
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalMembers) : 0;
    const showCheckboxes = true; // Always show checkboxes for potential deletion

    return (
        <Paper sx={{ width: '100%', mb: 2 }} variant="outlined">
             {isLoading && <LinearProgress sx={{ width: '100%' }} />}
            <EnhancedTableToolbar
                numSelected={selectedMembers.length}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onAddMember={onAddMember}
                onDeleteSelected={() => onDeleteSelectedMembers(selectedMembers)}
                isSearchDisabled={isLoading}
            />
            <TableContainer>
                <Table
                    sx={{ minWidth: 750 }} // Ensure horizontal scroll on smaller viewports
                    aria-labelledby="tableTitle"
                    size={isMobile ? 'small' : 'medium'}
                    stickyHeader // Make header sticky
                >
                    <EnhancedTableHead
                        numSelected={selectedMembers.length}
                        order={order}
                        orderBy={orderBy}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        rowCount={members.length} // Row count on the current page
                        showCheckboxes={showCheckboxes}
                    />
                    <TableBody>
                        {!isLoading && members.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={headCells.length + (showCheckboxes ? 1 : 0)} align="center" sx={{ py: 4 }}>
                                    <Stack alignItems="center" spacing={1} color="text.secondary">
                                        <InfoOutlinedIcon fontSize="large" />
                                        <Typography variant="body1">
                                            {searchQuery ? 'No members match your search.' : 'No members added yet.'}
                                        </Typography>
                                         {!searchQuery && (
                                             <Button onClick={onAddMember} startIcon={<AddIcon />} size="small">
                                                 Add First Member
                                             </Button>
                                         )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        )}
                         {!isLoading && members.map((member, index) => {
                            const memberId = member[memberIdKey] as string;
                            const isItemSelected = isSelected(memberId);
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                                <TableRow
                                    hover
                                    onClick={(event) => handleRowClick(event, member)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    key={memberId} // Use unique key
                                    selected={isItemSelected}
                                    sx={{
                                        cursor: 'pointer',
                                        '&.Mui-selected': { // Style selected rows
                                            bgcolor: (theme) => alpha(theme.palette.primary.light, 0.15),
                                            '&:hover': {
                                                bgcolor: (theme) => alpha(theme.palette.primary.light, 0.25),
                                            }
                                        }
                                     }}
                                >
                                    {showCheckboxes && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                onClick={(event) => handleCheckboxClick(event, memberId)} // Handle click directly
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell component="th" id={labelId} scope="row">
                                        {member.fullName}
                                    </TableCell>
                                    <TableCell>{member.nationalId}</TableCell>
                                     <TableCell sx={{textTransform: 'capitalize'}}>{member.title}</TableCell>
                                    <TableCell>{member.phoneNumber}</TableCell>
                                </TableRow>
                            );
                        })}
                        {/* Render empty rows if needed for consistent height - often not necessary with server-side pagination */}
                        {/* {emptyRows > 0 && (
                            <TableRow style={{ height: (isMobile ? 33 : 53) * emptyRows }}>
                                <TableCell colSpan={headCells.length + (showCheckboxes ? 1 : 0)} />
                            </TableRow>
                        )} */}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Only show pagination if there are members or if loading potentially could show members */}
            {(totalMembers > 0 || isLoading) && !(!isLoading && totalMembers === 0) && (
                 <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]} // Customizable options
                    component="div"
                    count={totalMembers} // Use total count from props
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    // ActionsComponent={TablePaginationActions} // Optional: For custom actions like First/Last page buttons
                />
            )}
        </Paper>
    );
};

export default MemberList;
