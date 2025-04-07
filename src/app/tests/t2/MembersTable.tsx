// components/group/MembersTable.tsx
import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Chip,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  PersonOutline,
  PhotoLibrary,
  Delete,
  Edit
} from '@mui/icons-material';
import { GroupMember } from './types';

interface MembersTableProps {
  members: GroupMember[];
  totalMembers: number;
  page: number;
  rowsPerPage?: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  selectedMembers: Set<string>; // phone numbers of selected members
  onSelectMembers: (phoneNumbers: Set<string>) => void;
  onDeleteSelected?: () => void;
  onEditMember?: (member: GroupMember) => void;
}

const MembersTable: React.FC<MembersTableProps> = ({
  members,
  totalMembers,
  page,
  rowsPerPage = 50,
  onPageChange,
  onRowsPerPageChange,
  selectedMembers,
  onSelectMembers,
  onDeleteSelected,
  onEditMember
}) => {
  const theme = useTheme();

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(members.map(member => member.phoneNumber));
      onSelectMembers(newSelected);
    } else {
      onSelectMembers(new Set());
    }
  };

  const handleSelectOne = (phoneNumber: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(phoneNumber)) {
      newSelected.delete(phoneNumber);
    } else {
      newSelected.add(phoneNumber);
    }
    onSelectMembers(newSelected);
  };

  const getTitleColor = (title: string): string => {
    const colors: Record<string, string> = {
      admin: theme.palette.error.main,
      chair: theme.palette.primary.main,
      'deputy chair': theme.palette.secondary.main,
      treasurer: theme.palette.warning.main,
      secretary: theme.palette.info.main,
      member: theme.palette.text.secondary
    };
    return colors[title] || theme.palette.text.secondary;
  };

  if (members.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: theme.palette.background.default,
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <PersonOutline
            sx={{
              fontSize: 64,
              color: theme.palette.text.secondary,
              mb: 2
            }}
          />
          <Typography variant="h6" color="text.secondary">
            No Members Added
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by adding members to your group
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ width: '100%' }}>
        {selectedMembers.size > 0 && (
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography>
              {selectedMembers.size} member{selectedMembers.size > 1 ? 's' : ''} selected
            </Typography>
            {onDeleteSelected && (
              <IconButton
                color="inherit"
                onClick={onDeleteSelected}
                size="small"
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedMembers.size > 0 && selectedMembers.size < members.length}
                    checked={members.length > 0 && selectedMembers.size === members.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>National ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>ID Photos</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow
                  key={member.phoneNumber}
                  hover
                  selected={selectedMembers.has(member.phoneNumber)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedMembers.has(member.phoneNumber)}
                      onChange={() => handleSelectOne(member.phoneNumber)}
                    />
                  </TableCell>
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell>{member.phoneNumber}</TableCell>
                  <TableCell>{member.nationalId}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.groupTitle}
                      size="small"
                      sx={{
                        color: getTitleColor(member.groupTitle),
                        borderColor: getTitleColor(member.groupTitle),
                        backgroundColor: 'transparent',
                        border: '1px solid'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {(member.idFrontUrl || member.idBackUrl) && (
                      <Tooltip title="ID Photos Available">
                        <PhotoLibrary color="primary" fontSize="small" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {onEditMember && (
                      <IconButton
                        size="small"
                        onClick={() => onEditMember(member)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalMembers}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={
            onRowsPerPageChange
              ? (event) => onRowsPerPageChange(parseInt(event.target.value, 10))
              : undefined
          }
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Box>
    </Card>
  );
};

export default MembersTable;
