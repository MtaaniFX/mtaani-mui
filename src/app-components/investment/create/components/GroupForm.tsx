'use client'

import React, { useState, useRef, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Box, Typography } from '@mui/material';

interface Email {
    id: number;
    value: string;
    post: string;
}

const groupPosts = [
    'Member',
    'Admin',
    'Treasurer',
    'Chairman',
    'Vice Chairman',
    'Secretary',
    'Auditor',
];

export type GroupData = {
    name: string,
    description?: string,
    members?: Email[],
}

export type Props = {
    handleBack?: () => void,
    handleCreateGroup?: (groupData: GroupData) => void,
}

export default function GroupForm(props: Props) {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
    const [editingEmailId, setEditingEmailId] = useState<number | null>(null);
    const [emailEditInput, setEmailEditInput] = useState('');
    const emailInputRef = useRef<HTMLInputElement>(null);
    const [history, setHistory] = useState<Email[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedPost, setSelectedPost] = useState<string>('Member');

    const { handleBack, handleCreateGroup } = props;

    useEffect(() => {
        if (historyIndex !== history.length - 1) {
            setHistory(history.slice(0, historyIndex + 1));
        }
        setHistory((prevHistory) => [...prevHistory, emails]);
        setHistoryIndex((prevIndex) => prevIndex + 1);
    }, [emails]);

    const handleAddEmail = () => {
        if (emails.length >= 50 || !emailInput) return;
        const newEmail: Email = {
            id: Date.now(),
            value: emailInput,
            post: 'Member',
        };
        setEmails([...emails, newEmail]);
        setEmailInput('');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (
            (event.key === 'Enter' || event.key === ' ' || event.key === 'Tab') &&
            emailInputRef.current === document.activeElement
        ) {
            event.preventDefault();
            handleAddEmail();
        }
    };

    const handleRemoveEmail = (id: number) => {
        setEmails(emails.filter((email) => email.id !== id));
        setSelectedEmails(selectedEmails.filter((emailId) => emailId !== id));
    };

    const handleStartEditEmail = (email: Email) => {
        setEditingEmailId(email.id);
        setEmailEditInput(email.value);
    };

    const handleUpdateEmail = (id: number) => {
        setEmails(
            emails.map((email) =>
                email.id === id ? { ...email, value: emailEditInput } : email
            )
        );
        setEditingEmailId(null);
        setEmailEditInput('');
    };

    const handleKeyDownEdit = (
        event: React.KeyboardEvent<HTMLDivElement>,
        id: number
    ) => {
        if (event.key === 'Enter') {
            handleUpdateEmail(id);
        }
    };

    const handleSelectEmail = (id: number) => {
        setSelectedEmails(
            selectedEmails.includes(id)
                ? selectedEmails.filter((emailId) => emailId !== id)
                : [...selectedEmails, id]
        );
    };

    const handleRemoveSelectedEmails = () => {
        setEmails(emails.filter((email) => !selectedEmails.includes(email.id)));
        setSelectedEmails([]);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setEmails(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setEmails(history[historyIndex + 1]);
        }
    };

    const handlePostChange = (
        event: SelectChangeEvent<string>,
        emailId: number
    ) => {
        setEmails(
            emails.map((email) =>
                email.id === emailId ? { ...email, post: event.target.value } : email
            )
        );
    };

    const handleSelectedPostChange = (event: SelectChangeEvent<string>) => {
        setSelectedPost(event.target.value);
        setEmails(
            emails.map((email) =>
                selectedEmails.includes(email.id)
                    ? { ...email, post: event.target.value }
                    : email
            )
        );
    };

    const handleSubmit = () => {
        if (!groupName) {
            console.log('Group name is required');
            return;
        }

        if (handleCreateGroup !== undefined) {
            handleCreateGroup({
                name: groupName,
                description: groupDescription,
                members: emails
            });
            return;
        }

        // Replace with your API call
        console.log('Need to handle Group Creation. Please set a handler.');
        console.log('Submitting:', { groupName, groupDescription, emails });
    };

    const showToolbar =
        selectedEmails.length > 0 ||
        historyIndex > 0 ||
        historyIndex < history.length - 1;

    return (
        <Grid2 container spacing={2} onKeyDown={handleKeyDown}>
            <Grid2 size={{ xs: 12 }}>
                <TextField
                    required
                    fullWidth
                    label="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
                <TextField
                    fullWidth
                    label="Group Description (Optional)"
                    multiline
                    rows={4}
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12 }}>
                <Typography variant='subtitle2'>
                    Add members to the group
                </Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 8 }}>
                <TextField
                    inputRef={emailInputRef}
                    fullWidth
                    label="Member phone: 0722000000 or 0100000000"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={emails.length >= 50}
                />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
                <Button
                    variant="contained"
                    onClick={handleAddEmail}
                    disabled={emails.length >= 50}
                >
                    Add
                </Button>
            </Grid2>

            {showToolbar && (
                <Grid2 size={{ xs: 12 }}>
                    <Toolbar>
                        {selectedEmails.length > 0 && (
                            <>
                                <Tooltip title="Remove selected users">
                                    <IconButton onClick={handleRemoveSelectedEmails}>
                                        <PersonRemoveIcon />
                                    </IconButton>
                                </Tooltip>
                                <FormControl sx={{ m: 1, minWidth: 120 }}>
                                    <InputLabel id="group-post-select-label">Post</InputLabel>
                                    <Select
                                        labelId="group-post-select-label"
                                        id="group-post-select"
                                        value={selectedPost}
                                        label="Post"
                                        onChange={handleSelectedPostChange}
                                    >
                                        {groupPosts.map((post) => (
                                            <MenuItem key={post} value={post}>
                                                {post}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        <Tooltip title="Undo">
                            <span>
                                <IconButton onClick={handleUndo} disabled={historyIndex === 0}>
                                    <UndoIcon />
                                </IconButton>
                            </span>

                        </Tooltip>
                        <Tooltip title="Redo">
                            <span>
                                <IconButton
                                    onClick={handleRedo}
                                    disabled={historyIndex === history.length - 1}
                                >
                                    <RedoIcon />
                                </IconButton>
                            </span>

                        </Tooltip>
                    </Toolbar>
                </Grid2>
            )}

            {emails.length > 0 && (
                <Grid2 size={{ xs: 12 }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={
                                                selectedEmails.length > 0 &&
                                                selectedEmails.length < emails.length
                                            }
                                            checked={
                                                emails.length > 0 &&
                                                selectedEmails.length === emails.length
                                            }
                                            onChange={() =>
                                                setSelectedEmails(
                                                    selectedEmails.length === emails.length
                                                        ? []
                                                        : emails.map((email) => email.id)
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Post</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {emails.map((email) => (
                                    <TableRow key={email.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedEmails.includes(email.id)}
                                                onChange={() => handleSelectEmail(email.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {editingEmailId === email.id ? (
                                                <TextField
                                                    autoFocus
                                                    value={emailEditInput}
                                                    onChange={(e) => setEmailEditInput(e.target.value)}
                                                    onBlur={() => handleUpdateEmail(email.id)}
                                                    onKeyDown={(e) => handleKeyDownEdit(e, email.id)}
                                                />
                                            ) : (
                                                email.value
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <FormControl fullWidth>
                                                <InputLabel id={`post-label-${email.id}`}>
                                                    Post
                                                </InputLabel>
                                                <Select
                                                    labelId={`post-label-${email.id}`}
                                                    id={`post-select-${email.id}`}
                                                    value={email.post}
                                                    label="Post"
                                                    onChange={(e) => handlePostChange(e, email.id)}
                                                >
                                                    {groupPosts.map((post) => (
                                                        <MenuItem key={post} value={post}>
                                                            {post}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit">
                                                <span>
                                                    <IconButton
                                                        onClick={() => handleStartEditEmail(email)}
                                                        disabled={editingEmailId !== null}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={() => handleRemoveEmail(email.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid2>
            )}

            <Grid2 size={{ xs: 12 }}>
                <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                        disabled={!groupName}
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ mr: 1 }}
                    >
                        Create Group
                    </Button>
                    <Button
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                    >
                        Back
                    </Button>
                </Box>
            </Grid2>
        </Grid2>
    );
};
