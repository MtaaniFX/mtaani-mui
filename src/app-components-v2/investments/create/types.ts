/**
 * Defines the possible roles a member can have within the group.
 * Using 'as const' creates a readonly tuple and allows deriving a union type.
 */
export const GROUP_TITLES = [
    'member',
    'admin',
    'chair',
    'deputy chair',
    'treasurer',
    'secretary',
] as const;

/**
 * Union type representing the allowed group titles for a member.
 * Derived from the GROUP_TITLES constant.
 */
export type GroupTitle = typeof GROUP_TITLES[number];

/**
 * Represents the data required when *adding* a new member via the form.
 * Does not necessarily include a backend-generated ID yet.
 */
export interface NewMemberData {
    fullName: string;
    nationalId: string; // Stored as string
    title: GroupTitle;
    phoneNumber: string; // Used as unique identifier during form session
    idFrontPhotoUrl?: string | null; // URL after upload
    idBackPhotoUrl?: string | null; // URL after upload
}

/**
 * Represents a group member as displayed in the list or retrieved from the backend.
 * It should include all fields from NewMemberData plus a unique identifier.
 */
export interface GroupMember extends NewMemberData {
    /**
     * Unique identifier for the member. This could be the `phoneNumber` if guaranteed unique,
     * or a database-generated ID (e.g., UUID). The specific key used is determined by
     * the `memberIdKey` prop in the `GroupForm` component.
     * We include a generic 'id' field here for clarity, but the actual key might differ.
     */
    id: string; // Example: Could be UUID or could map to phoneNumber depending on implementation
}

/**
 * Defines the signature for the function responsible for uploading a file.
 * It takes a File object and returns a Promise resolving to the file's URL.
 */
export type UploadFileFunction = (file: File) => Promise<string>;

// === Types related to Edit Mode Submission ===

/**
 * Represents the changes made to a group during an edit session.
 * This structure is used to inform the backend API about what specifically changed.
 */
export interface GroupChanges {
    /** New name for the group, if changed. */
    name?: string;
    /** New description for the group, if changed. */
    description?: string;
    /** Array of members newly added during the edit session. */
    addedMembers: NewMemberData[];
    /**
     * Object containing updates to existing members.
     * Keyed by the member's unique ID (matching `memberIdKey`).
     * The value is a partial object containing only the fields that changed for that member.
     */
    updatedMembers: { [memberId: string]: Partial<Omit<GroupMember, 'id'>> };
    /** Array of unique IDs of members deleted during the edit session. */
    deletedMemberIds: string[];
}

// === Types related to Form Submission Payloads ===

/**
 * Defines the data structure submitted when creating a new group.
 */
export interface GroupFormDataCreate {
    name: string;
    description: string;
    /** The complete list of members added in the create form session. */
    members: NewMemberData[];
}

/**
 * Defines the data structure submitted when saving changes to an existing group.
 */
export interface GroupFormDataEdit {
    /** The unique identifier of the group being edited. */
    id: string;
    /** An object detailing the specific changes made during the edit session. */
    changes: GroupChanges;
}
