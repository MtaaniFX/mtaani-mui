'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Types
type GroupTitle = 'admin' | 'chair' | 'deputy chair' | 'treasurer' | 'secretary' | 'member';

interface GroupMember {
  id?: string;
  fullName: string;
  nationalIdNumber: string;
  groupTitle: GroupTitle;
  phoneNumber: string;
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
}

interface GroupData {
  name: string;
  description?: string;
  members: GroupMember[];
}

interface Action {
  type: 'ADD_MEMBER' | 'REMOVE_MEMBER' | 'UPDATE_MEMBER' | 'SET_GROUP_DATA';
  payload: any;
}

interface EditOperation {
  type: 'ADD_MEMBER' | 'REMOVE_MEMBER' | 'UPDATE_MEMBER';
  member: GroupMember;
}

interface FetchMembersParams {
  page: number;
  pageSize: number;
  groupId: string;
}

interface FetchMembersResult {
  members: GroupMember[];
  totalCount: number;
}

interface GroupManagementProps {
  mode: 'create' | 'edit';
  groupId?: string;
  initialData?: GroupData;
  onSubmit: (data: GroupData) => void;
  onCancel?: () => void;
  fetchMembers?: (params: FetchMembersParams) => Promise<FetchMembersResult>;
  onEditOperations?: (operations: EditOperation[]) => Promise<void>;
  uploadToSupabase?: (file: File, path: string) => Promise<string>;
}

const DEFAULT_GROUP_TITLE: GroupTitle = 'member';
const ITEMS_PER_PAGE = 50;

const GroupManagement: React.FC<GroupManagementProps> = ({
  mode,
  groupId = '',
  initialData,
  onSubmit,
  onCancel,
  fetchMembers,
  onEditOperations,
  uploadToSupabase,
}) => {
  const theme = useTheme();

  // State
  const [groupName, setGroupName] = useState<string>(initialData?.name || '');
  const [groupDescription, setGroupDescription] = useState<string>(initialData?.description || '');
  const [members, setMembers] = useState<GroupMember[]>(initialData?.members || []);
  const [newMember, setNewMember] = useState<GroupMember>({
    fullName: '',
    nationalIdNumber: '',
    groupTitle: DEFAULT_GROUP_TITLE,
    phoneNumber: '',
  });
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ITEMS_PER_PAGE);
  const [totalCount, setTotalCount] = useState<number>(initialData?.members?.length || 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [memberError, setMemberError] = useState<string>('');
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [frontIdPreview, setFrontIdPreview] = useState<string>('');
  const [backIdPreview, setBackIdPreview] = useState<string>('');
  const [undoStack, setUndoStack] = useState<Action[]>([]);
  const [redoStack, setRedoStack] = useState<Action[]>([]);
  const [editOperations, setEditOperations] = useState<EditOperation[]>([]);

  // Validation functions
  const validateGroupData = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMember = (member: GroupMember): boolean => {
    let valid = true;
    const tempErrors: Record<string, string> = {};

    if (!member.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
      valid = false;
    }

    if (!member.nationalIdNumber.trim()) {
      tempErrors.nationalIdNumber = 'National ID is required';
      valid = false;
    }

    if (!member.phoneNumber.trim()) {
      tempErrors.phoneNumber = 'Phone number is required';
      valid = false;
    }

    // Check for duplicate phone numbers
    if (member.phoneNumber.trim()) {
      const isDuplicate = members.some(
        (m) => m.phoneNumber === member.phoneNumber && (editingMember ? m.phoneNumber !== editingMember.phoneNumber : true)
      );
      if (isDuplicate) {
        tempErrors.phoneNumber = 'Phone number must be unique';
        valid = false;
      }
    }

    setErrors(tempErrors);
    return valid;
  };

  // History management
  const addToHistory = (action: Action) => {
    setUndoStack((prev) => [...prev, action]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const action = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    
    switch (action.type) {
      case 'ADD_MEMBER':
        setMembers((prev) => prev.filter((member) => member.phoneNumber !== action.payload.phoneNumber));
        setRedoStack((prev) => [...prev, action]);
        if (mode === 'edit') {
          setEditOperations((prev) => prev.filter(
            (op) => !(op.type === 'ADD_MEMBER' && op.member.phoneNumber === action.payload.phoneNumber)
          ));
        }
        break;
      case 'REMOVE_MEMBER':
        setMembers((prev) => [...prev, action.payload]);
        setRedoStack((prev) => [...prev, action]);
        if (mode === 'edit') {
          setEditOperations((prev) => prev.filter(
            (op) => !(op.type === 'REMOVE_MEMBER' && op.member.phoneNumber === action.payload.phoneNumber)
          ));
        }
        break;
      case 'UPDATE_MEMBER':
        setMembers((prev) =>
          prev.map((member) =>
            member.phoneNumber === action.payload.newMember.phoneNumber
              ? action.payload.oldMember
              : member
          )
        );
        setRedoStack((prev) => [...prev, action]);
        if (mode === 'edit') {
          setEditOperations((prev) => {
            const filteredOps = prev.filter(
              (op) => !(op.type === 'UPDATE_MEMBER' && op.member.phoneNumber === action.payload.newMember.phoneNumber)
            );
            if (action.payload.originalOperation) {
              return [...filteredOps, action.payload.originalOperation];
            }
            return filteredOps;
          });
        }
        break;
      case 'SET_GROUP_DATA':
        setGroupName(action.payload.name);
        setGroupDescription(action.payload.description);
        setRedoStack((prev) => [...prev, action]);
        break;
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const action = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    
    switch (action.type) {
      case 'ADD_MEMBER':
        setMembers((prev) => [...prev, action.payload]);
        setUndoStack((prev) => [...prev, action]);
        if (mode === 'edit') {
          setEditOperations((prev) => [...prev, { type: 'ADD_MEMBER', member: action.payload }]);
        }
        break;
      case 'REMOVE_MEMBER':
        setMembers((prev) => prev.filter((member) => member.phoneNumber !== action.payload.phoneNumber));
        setUndoStack((prev) => [...prev, action]);
        if (mode === 'edit') {
          setEditOperations((prev) => [...prev, { type: 'REMOVE_MEMBER', member: action.payload }]);
        }
        break;
      case 'UPDATE_MEMBER':
        setMembers((prev) =>
          prev.map((member) =>
            member.phoneNumber === action.payload.oldMember.phoneNumber
              ? action.payload.newMember
              : member
          )
        );
        setUndoStack((prev) => [...prev, action]);
        if (mode === 'edit') {
          setEditOperations((prev) => [...prev, { type: 'UPDATE_MEMBER', member: action.payload.newMember }]);
        }
        break;
      case 'SET_GROUP_DATA':
        setGroupName(action.payload.newName);
        setGroupDescription(action.payload.newDescription);
        setUndoStack((prev) => [...prev, action]);
        break;
    }
  };

  // Handle file uploads
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    if (type === 'front') {
      setFrontIdFile(file);
      const fileUrl = URL.createObjectURL(file);
      setFrontIdPreview(fileUrl);
    } else {
      setBackIdFile(file);
      const fileUrl = URL.createObjectURL(file);
      setBackIdPreview(fileUrl);
    }
  };

  const uploadFiles = async (): Promise<{ frontUrl?: string; backUrl?: string }> => {
    if (!uploadToSupabase) return {};
    
    setIsUploading(true);
    const result: { frontUrl?: string; backUrl?: string } = {};
    
    try {
      if (frontIdFile) {
        const path = `group-members/${Date.now()}-front`;
        const frontUrl = await uploadToSupabase(frontIdFile, path);
        result.frontUrl = frontUrl;
      }
      
      if (backIdFile) {
        const path = `group-members/${Date.now()}-back`;
        const backUrl = await uploadToSupabase(backIdFile, path);
        result.backUrl = backUrl;
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
    
    return result;
  };

  // Member management
  const addMember = async () => {
    if (!validateMember(newMember)) return;
    
    let memberToAdd = { ...newMember };
    
    // Upload ID photos if provided
    if ((frontIdFile || backIdFile) && uploadToSupabase) {
      const { frontUrl, backUrl } = await uploadFiles();
      memberToAdd = {
        ...memberToAdd,
        nationalIdFrontUrl: frontUrl,
        nationalIdBackUrl: backUrl,
      };
    }
    
    setMembers((prev) => [...prev, memberToAdd]);
    addToHistory({
      type: 'ADD_MEMBER',
      payload: memberToAdd,
    });
    
    if (mode === 'edit') {
      setEditOperations((prev) => [...prev, { type: 'ADD_MEMBER', member: memberToAdd }]);
    }
    
    // Reset form
    setNewMember({
      fullName: '',
      nationalIdNumber: '',
      groupTitle: DEFAULT_GROUP_TITLE,
      phoneNumber: '',
    });
    setFrontIdFile(null);
    setBackIdFile(null);
    setFrontIdPreview('');
    setBackIdPreview('');
    setMemberError('');
    setErrors({});
  };

  const updateMember = async () => {
    if (!editingMember || !validateMember(editingMember)) return;
    
    let updatedMember = { ...editingMember };
    
    // Upload ID photos if provided
    if ((frontIdFile || backIdFile) && uploadToSupabase) {
      const { frontUrl, backUrl } = await uploadFiles();
      updatedMember = {
        ...updatedMember,
        nationalIdFrontUrl: frontUrl || updatedMember.nationalIdFrontUrl,
        nationalIdBackUrl: backUrl || updatedMember.nationalIdBackUrl,
      };
    }
    
    const oldMember = members.find((m) => m.phoneNumber === editingMember.phoneNumber);
    
    setMembers((prev) =>
      prev.map((member) => (member.phoneNumber === editingMember.phoneNumber ? updatedMember : member))
    );
    
    if (oldMember) {
      let operation = null;
      if (mode === 'edit') {
        const existingOpIndex = editOperations.findIndex(
          (op) => op.type === 'UPDATE_MEMBER' && op.member.phoneNumber === oldMember.phoneNumber
        );
        if (existingOpIndex !== -1) {
          operation = editOperations[existingOpIndex];
        }
      }
      
      addToHistory({
        type: 'UPDATE_MEMBER',
        payload: {
          oldMember,
          newMember: updatedMember,
          originalOperation: operation,
        },
      });
      
      if (mode === 'edit') {
        setEditOperations((prev) => {
          const filtered = prev.filter(
            (op) => !(op.type === 'UPDATE_MEMBER' && op.member.phoneNumber === oldMember.phoneNumber)
          );
          return [...filtered, { type: 'UPDATE_MEMBER', member: updatedMember }];
        });
      }
    }
    
    // Reset form
    setEditingMember(null);
    setFrontIdFile(null);
    setBackIdFile(null);
    setFrontIdPreview('');
    setBackIdPreview('');
    setErrors({});
  };

  const removeMember = (phoneNumber: string) => {
    const memberToRemove = members.find((m) => m.phoneNumber === phoneNumber);
    if (!memberToRemove) return;
    
    setMembers((prev) => prev.filter((member) => member.phoneNumber !== phoneNumber));
    addToHistory({
      type: 'REMOVE_MEMBER',
      payload: memberToRemove,
    });
    
    if (mode === 'edit') {
      setEditOperations((prev) => [...prev, { type: 'REMOVE_MEMBER', member: memberToRemove }]);
    }
    
    // Update selected members
    setSelectedMembers((prev) => {
      const newSelected = new Set(prev);
      newSelected.delete(phoneNumber);
      return newSelected;
    });
  };

  const removeSelectedMembers = () => {
    selectedMembers.forEach((phoneNumber) => {
      removeMember(phoneNumber);
    });
    setSelectedMembers(new Set());
  };

  const handleEditMember = (member: GroupMember) => {
    setEditingMember(member);
    setFrontIdPreview(member.nationalIdFrontUrl || '');
    setBackIdPreview(member.nationalIdBackUrl || '');
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setFrontIdFile(null);
    setBackIdFile(null);
    setFrontIdPreview('');
    setBackIdPreview('');
    setErrors({});
  };

  // Selection handling
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(members.map((member) => member.phoneNumber));
      setSelectedMembers(newSelected);
      return;
    }
    setSelectedMembers(new Set());
  };

  const handleSelectMember = (phoneNumber: string) => {
    setSelectedMembers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(phoneNumber)) {
        newSelected.delete(phoneNumber);
      } else {
        newSelected.add(phoneNumber);
      }
      return newSelected;
    });
  };

  // Table pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    if (mode === 'edit' && fetchMembers) {
      fetchMembers({
        page: newPage,
        pageSize: rowsPerPage,
        groupId,
      }).then((result) => {
        setMembers(result.members);
        setTotalCount(result.totalCount);
      });
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (mode === 'edit' && fetchMembers) {
      fetchMembers({
        page: 0,
        pageSize: newRowsPerPage,
        groupId,
      }).then((result) => {
        setMembers(result.members);
        setTotalCount(result.totalCount);
      });
    }
  };

  // Submit handlers
  const handleSubmit = async () => {
    if (!validateGroupData()) return;
    
    const groupData: GroupData = {
      name: groupName,
      description: groupDescription,
      members,
    };
    
    if (mode === 'edit' && onEditOperations && editOperations.length > 0) {
      try {
        await onEditOperations(editOperations);
      } catch (error) {
        console.error('Error saving edit operations:', error);
        return;
      }
    }
    
    onSubmit(groupData);
  };

  // Load members in edit mode
  useEffect(() => {
    if (mode === 'edit' && fetchMembers && groupId) {
      fetchMembers({
        page,
        pageSize: rowsPerPage,
        groupId,
      }).then((result) => {
        setMembers(result.members);
        setTotalCount(result.totalCount);
      });
    }
  }, [mode, fetchMembers, groupId, page, rowsPerPage]);

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      if (frontIdPreview) URL.revokeObjectURL(frontIdPreview);
      if (backIdPreview) URL.revokeObjectURL(backIdPreview);
    };
  }, [frontIdPreview, backIdPreview]);

  // Displayed members with pagination (for create mode)
  const displayedMembers = useMemo(() => {
    if (mode === 'edit') return members;
    return members.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [members, page, rowsPerPage, mode]);

  // Group titles for dropdown
  const groupTitles: GroupTitle[] = ['admin', 'chair', 'deputy chair', 'treasurer', 'secretary', 'member'];

  return (
    <Container maxWidth="lg">
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          my: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          {mode === 'create' ? 'Create New Group' : 'Edit Group'}
        </Typography>

        <Grid container spacing={3}>
          {/* Group Information */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Group Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Group Name"
                      value={groupName}
                      onChange={(e) => {
                        const newName = e.target.value;
                        addToHistory({
                          type: 'SET_GROUP_DATA',
                          payload: { name: groupName, description: groupDescription, newName, newDescription: groupDescription },
                        });
                        setGroupName(newName);
                      }}
                      error={!!errors.groupName}
                      helperText={errors.groupName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Description (Optional)"
                      value={groupDescription}
                      onChange={(e) => {
                        const newDescription = e.target.value;
                        addToHistory({
                          type: 'SET_GROUP_DATA',
                          payload: { name: groupName, description: groupDescription, newName: groupName, newDescription },
                        });
                        setGroupDescription(newDescription);
                      }}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Member Management */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Members {members.length > 0 && `(${members.length})`}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Undo">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={undo}
                          disabled={undoStack.length === 0}
                        >
                          <UndoIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Redo">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={redo}
                          disabled={redoStack.length === 0}
                        >
                          <RedoIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {selectedMembers.size > 0 && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={removeSelectedMembers}
                      >
                        Remove ({selectedMembers.size})
                      </Button>
                    )}
                  </Stack>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {memberError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {memberError}
                  </Alert>
                )}

                {/* Add/Edit Member Form */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.background.default }}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    {editingMember ? 'Edit Member' : 'Add New Member'}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={editingMember ? editingMember.fullName : newMember.fullName}
                        onChange={(e) =>
                          editingMember
                            ? setEditingMember({ ...editingMember, fullName: e.target.value })
                            : setNewMember({ ...newMember, fullName: e.target.value })
                        }
                        error={!!errors.fullName}
                        helperText={errors.fullName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="National ID Number"
                        value={editingMember ? editingMember.nationalIdNumber : newMember.nationalIdNumber}
                        onChange={(e) =>
                          editingMember
                            ? setEditingMember({ ...editingMember, nationalIdNumber: e.target.value })
                            : setNewMember({ ...newMember, nationalIdNumber: e.target.value })
                        }
                        error={!!errors.nationalIdNumber}
                        helperText={errors.nationalIdNumber}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={editingMember ? editingMember.phoneNumber : newMember.phoneNumber}
                        onChange={(e) =>
                          editingMember
                            ? setEditingMember({ ...editingMember, phoneNumber: e.target.value })
                            : setNewMember({ ...newMember, phoneNumber: e.target.value })
                        }
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber}
                        required
                        disabled={!!editingMember} // Cannot change phone number when editing
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Group Title</InputLabel>
                        <Select
                          value={editingMember ? editingMember.groupTitle : newMember.groupTitle}
                          onChange={(e) =>
                            editingMember
                              ? setEditingMember({ ...editingMember, groupTitle: e.target.value as GroupTitle })
                              : setNewMember({ ...newMember, groupTitle: e.target.value as GroupTitle })
                          }
                          label="Group Title"
                        >
                          {groupTitles.map((title) => (
                            <MenuItem key={title} value={title}>
                              {title.charAt(0).toUpperCase() + title.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* ID Document Upload */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        National ID Front (Optional)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mr: 2 }}
                        >
                          Upload
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'front')}
                          />
                        </Button>
                        {frontIdPreview && (
                          <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <img
                              src={frontIdPreview}
                              alt="ID Front"
                              style={{ height: 60, width: 'auto', borderRadius: 4 }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'background.default' },
                              }}
                              onClick={() => {
                                setFrontIdFile(null);
                                setFrontIdPreview('');
                              }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        National ID Back (Optional)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ mr: 2 }}
                        >
                          Upload
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'back')}
                          />
                        </Button>
                        {backIdPreview && (
                          <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <img
                              src={backIdPreview}
                              alt="ID Back"
                              style={{ height: 60, width: 'auto', borderRadius: 4 }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'background.default' },
                              }}
                              onClick={() => {
                                setBackIdFile(null);
                                setBackIdPreview('');
                              }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                        {editingMember ? (
                          <>
                            <Button variant="outlined" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<SaveIcon />}
                              onClick={updateMember}
                              disabled={isUploading}
                            >
                              Update Member
                              </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={addMember}
                            disabled={isUploading}
                          >
                            Add Member
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Members Table */}
                {members.length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 6,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 1,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      No members added yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Add members to your group using the form above
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <input
                              type="checkbox"
                              onChange={handleSelectAllClick}
                              checked={
                                members.length > 0 &&
                                selectedMembers.size === members.length
                              }
                            />
                          </TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>ID Number</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>ID Documents</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedMembers.map((member) => (
                          <TableRow
                            key={member.phoneNumber}
                            selected={selectedMembers.has(member.phoneNumber)}
                            hover
                          >
                            <TableCell padding="checkbox">
                              <input
                                type="checkbox"
                                onChange={() => handleSelectMember(member.phoneNumber)}
                                checked={selectedMembers.has(member.phoneNumber)}
                              />
                            </TableCell>
                            <TableCell>{member.fullName}</TableCell>
                            <TableCell>{member.nationalIdNumber}</TableCell>
                            <TableCell>{member.phoneNumber}</TableCell>
                            <TableCell>
                              <Chip
                                label={member.groupTitle}
                                color={
                                  member.groupTitle === 'admin'
                                    ? 'primary'
                                    : member.groupTitle === 'chair' || member.groupTitle === 'deputy chair'
                                    ? 'secondary'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {member.nationalIdFrontUrl && (
                                  <Tooltip title="ID Front Available">
                                    <Chip
                                      label="Front"
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}
                                {member.nationalIdBackUrl && (
                                  <Tooltip title="ID Back Available">
                                    <Chip
                                      label="Back"
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditMember(member)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => removeMember(member.phoneNumber)}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 50, 100]}
                      component="div"
                      count={mode === 'edit' ? totalCount : members.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {onCancel && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
            >
              Back
            </Button>
          )}
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ ml: 2 }}
            >
              {mode === 'create' ? 'Create Group' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Confirmation Dialog for Multiple Member Deletion */}
      <Dialog
        open={selectedMembers.size > 0}
        onClose={() => setSelectedMembers(new Set())}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove Selected Members</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {selectedMembers.size} member(s) from the group?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMembers(new Set())} color="primary">
            Cancel
          </Button>
          <Button onClick={removeSelectedMembers} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupManagement;
