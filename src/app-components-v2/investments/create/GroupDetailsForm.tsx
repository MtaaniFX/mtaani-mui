import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    TextField,
    Stack,
    Box,
} from '@mui/material';

/**
 * Props for the GroupDetailsForm component.
 */
interface GroupDetailsFormProps {
    /** Current value for the group name */
    name: string;
    /** Current value for the group description */
    description: string;
    /** Callback function triggered when the name input changes */
    onNameChange: (newName: string) => void;
    /** Callback function triggered when the description input changes */
    onDescriptionChange: (newDescription: string) => void;
    /** Optional: Disables the input fields if true */
    disabled?: boolean;
    /** Optional: Title for the card section */
    title?: string;
}

/**
 * A client component that renders input fields for a group's name and description,
 * typically within a Card.
 */
const GroupDetailsForm: React.FC<GroupDetailsFormProps> = ({
    name,
    description,
    onNameChange,
    onDescriptionChange,
    disabled = false,
    title = 'Group Details',
}) => {
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onNameChange(event.target.value);
    };

    const handleDescriptionChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onDescriptionChange(event.target.value);
    };

    return (
        <Card variant="outlined" sx={{ mb: 3 }}> {/* Add some bottom margin */}
            {title && <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />}
            {/* Use Box with display="flex" and CardContent without padding if CardHeader exists */}
            {/* Or simply use CardContent if no header */}
            <CardContent sx={!title ? {} : { pt: 0 } /* Remove top padding if header exists */}>
                <Stack spacing={2}>
                    <TextField
                        required
                        id="group-name"
                        label="Group Name"
                        value={name}
                        onChange={handleNameChange}
                        disabled={disabled}
                        variant="outlined"
                        fullWidth // Ensure it takes full width of the stack item
                    />
                    <TextField
                        id="group-description"
                        label="Group Description (Optional)"
                        value={description}
                        onChange={handleDescriptionChange}
                        disabled={disabled}
                        variant="outlined"
                        multiline
                        rows={3} // Adjust number of rows as needed
                        fullWidth // Ensure it takes full width of the stack item
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};

export default GroupDetailsForm;
