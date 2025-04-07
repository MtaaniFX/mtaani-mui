interface ApiErrorResponse {
    error: string;
    details?: string;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
    // Add a check for 204 No Content
    if (response.status === 204) {
        return undefined as T; // Or handle as appropriate for your use case
    }

    const data: T | ApiErrorResponse = await response.json();

    if (!response.ok) {
        const errorMsg = (data as ApiErrorResponse)?.error || response.statusText;
        const errorDetails = (data as ApiErrorResponse)?.details;
        console.error(`API Error (${response.status}): ${errorMsg}`, errorDetails ? `Details: ${errorDetails}` : '');
        // Attempt to append details from the summary if available (for addMembers)
        let detailedError = errorMsg;
        if ((data as any)?.skipped_phones || (data as any)?.errors > 0) {
            detailedError += ` (Details: ${JSON.stringify(data)})`;
        }
        throw new Error(detailedError || `Request failed with status ${response.status}`);
    }
    return data as T;
}


// --- Update Group Details ---

interface UpdateGroupDetailsParams {
    name?: string;
    description?: string | null; // Allow null to clear description
}

interface UpdateGroupSuccessResponse {
    message: string;
}

/**
 * Updates the name and/or description of a group.
 * Must be called by the group owner.
 *
 * @param groupId - The ID of the group to update.
 * @param details - An object containing the fields to update (name, description).
 * @throws {Error} If the API call fails or returns an error (e.g., permission denied).
 */
export async function updateGroupDetails(
    groupId: string,
    details: UpdateGroupDetailsParams
): Promise<void> { // Returns void on success
    if (!groupId) throw new Error("Group ID is required.");
    if (details.name === undefined && details.description === undefined) {
        console.warn("updateGroupDetails called with no changes.");
        return; // Or throw an error if preferred
    }

    const response = await fetch(`/api/v1/app_investments/groups/${groupId}/details`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
    });

    // Expecting 200 OK with a message, but we mainly care about success/failure
    await handleApiResponse<UpdateGroupSuccessResponse>(response);
    // If handleApiResponse doesn't throw, it succeeded.
}


// --- Add Group Members ---

// Re-export or define types matching the API payload expectation
export interface AddMemberPayloadItem {
    type: 1 | 2;
    userId?: string;
    titles?: string[];
    name?: string;
    nationalId?: string;
    phone?: string;
    frontPhoto?: string;
    backPhoto?: string;
}

export type AddMembersPayload = AddMemberPayloadItem[];

// Re-export or define type matching the API success response
export interface AddMembersResult {
    attempted: number;
    added: number;
    duplicates_skipped: number;
    errors: number;
    skipped_phones: string[];
}

/**
 * Adds one or more members to a group.
 * Must be called by the group owner.
 *
 * @param groupId - The ID of the group to add members to.
 * @param members - An array of member objects to add.
 * @returns A summary object detailing the outcome of the add operation.
 * @throws {Error} If the API call fails or returns a critical error. Partial failures are indicated in the return object.
 */
export async function addGroupMembers(
    groupId: string,
    members: AddMembersPayload
): Promise<AddMembersResult> {
    if (!groupId) throw new Error("Group ID is required.");
    if (!Array.isArray(members) || members.length === 0) {
        throw new Error("Members array cannot be empty.");
    }
    // Add basic client-side validation if desired, although the API handles it robustly.

    const response = await fetch(`/api/v1/app_investments/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(members),
    });

    // Expecting 200 OK, 207 Multi-Status, or 4xx/5xx errors
    // handleApiResponse should parse the JSON body (the summary) even for 207
    return await handleApiResponse<AddMembersResult>(response);
}

// --- Remove Group Members ---

interface RemoveMembersSuccessResponse {
    message: string;
    removedCount: number;
}

/**
 * Removes members from a group. Can remove specific members by phone or all members.
 * Must be called by the group owner.
 *
 * @param groupId - The ID of the group.
 * @param phones - Optional array of phone numbers to remove. If omitted or empty, ALL members will be removed.
 * @returns The number of members actually removed.
 * @throws {Error} If the API call fails or returns an error.
 */
export async function removeGroupMembers(
    groupId: string,
    phones?: string[]
): Promise<number> {
    if (!groupId) throw new Error("Group ID is required.");

    let url = `/api/v1/app_investments/groups/${groupId}/members`;

    if (phones && phones.length > 0) {
        const validPhones = phones.map(p => p.trim()).filter(p => p.length > 0);
        if (validPhones.length > 0) {
            url += `?phones=${encodeURIComponent(validPhones.join(','))}`;
        } else {
            // Programmer error: empty array passed, interpreted as remove all by API if param missing
            console.warn("removeGroupMembers called with an empty or invalid phones array. This will remove ALL members. Provide phone numbers or call without the phones argument to explicitly remove all.");
            // To strictly prevent accidental 'remove all', you could throw an error here:
            // throw new Error("Phones array is empty or contains only invalid entries.");
        }
    } // If phones is undefined or empty, the API defaults to removing all members.

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json', // Optional for DELETE with no body, but good practice
        },
    });

    const result = await handleApiResponse<RemoveMembersSuccessResponse>(response);
    return result.removedCount;
}


// --- Update External Member Details ---

// Define structure for individual update items in the SDK call
export interface UpdateExternalMemberDetailsItem {
    phone: string; // Required identifier
    name?: string;
    nationalId?: string;
    frontPhoto?: string | null; // Allow null to clear
    backPhoto?: string | null;  // Allow null to clear
}

// Define the expected summary response structure
export interface UpdateMembersDetailsResult {
    attempted: number;
    updated: number;
    not_found: number;
    wrong_type: number;
    errors: number;
}

/**
 * Updates details for one or more external (type 2) members within a group.
 * Members are identified by their phone numbers.
 * Must be called by the group owner.
 *
 * @param groupId - The ID of the group containing the members.
 * @param updates - An array of objects, each specifying the phone number and the details to update.
 * @returns A summary object detailing the outcome of the update operation.
 * @throws {Error} If the API call fails or returns a critical error. Partial failures are indicated in the return object.
 */
export async function updateExternalGroupMemberDetails(
    groupId: string,
    updates: UpdateExternalMemberDetailsItem[]
): Promise<UpdateMembersDetailsResult> {
    if (!groupId) throw new Error("Group ID is required.");
    if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error("Updates array cannot be empty.");
    }
    // Add more client-side validation per item if desired

    const response = await fetch(`/api/v1/app_investments/groups/${groupId}/members/details`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });

    // Expecting 200 OK, 207 Multi-Status, or 4xx/5xx errors
    return await handleApiResponse<UpdateMembersDetailsResult>(response);
}
