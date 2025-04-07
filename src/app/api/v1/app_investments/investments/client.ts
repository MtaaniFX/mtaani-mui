// Define the structure of the expected success response from the API
interface CreateInvestmentSuccessResponse {
    message: string;
    investmentId: string;
}

// Define the structure of the expected error response from the API
interface ApiErrorResponse {
    error: string;
    details?: string; // Optional details field
}

// Define parameter types for the SDK functions
interface CreateNormalParams {
    amount: number;
}

interface CreateLockedParams {
    amount: number;
    lockedMonths: number;
}

/**
 * A helper function to handle API fetch responses.
 * Parses JSON and throws an error for non-ok responses.
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
    const data: T | ApiErrorResponse = await response.json();

    if (!response.ok) {
        const errorMsg = (data as ApiErrorResponse)?.error || response.statusText;
        const errorDetails = (data as ApiErrorResponse)?.details;
        console.error(`API Error (${response.status}): ${errorMsg}`, errorDetails ? `Details: ${errorDetails}` : '');
        throw new Error(errorMsg || `Request failed with status ${response.status}`);
    }
    return data as T;
}


/**
 * Creates a normal individual investment by calling the backend API.
 *
 * @param params - The parameters for creating the investment.
 * @param params.amount - The amount to invest.
 * @returns The ID of the newly created investment.
 * @throws {Error} If the API call fails or returns an error.
 */
export async function createNormalIndividualInvestment(
    params: CreateNormalParams
): Promise<string> {
    if (params.amount <= 0) {
        throw new Error("Investment amount must be positive.");
    }

    const response = await fetch('/api/v1/app_investments/investments/individual', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'normal',
            amount: params.amount,
        }),
    });

    const result = await handleApiResponse<CreateInvestmentSuccessResponse>(response);
    return result.investmentId;
}

/**
 * Creates a locked individual investment by calling the backend API.
 *
 * @param params - The parameters for creating the investment.
 * @param params.amount - The amount to invest.
 * @param params.lockedMonths - The number of months the investment should be locked.
 * @returns The ID of the newly created investment.
 * @throws {Error} If the API call fails or returns an error.
 */
export async function createLockedIndividualInvestment(
    params: CreateLockedParams
): Promise<string> {
    if (params.amount <= 0) {
        throw new Error("Investment amount must be positive.");
    }
    if (params.lockedMonths <= 0) {
        throw new Error("Locked months must be positive for a locked investment.");
    }

    const response = await fetch('/api/v1/app_investments/investments/individual', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'locked',
            amount: params.amount,
            lockedMonths: params.lockedMonths,
        }),
    });

    const result = await handleApiResponse<CreateInvestmentSuccessResponse>(response);
    return result.investmentId;
}

// Input types for members in the SDK
export interface UserMemberInput {
    userId: string; // UUID of existing auth.users
    titles?: string[];
}

export interface ExternalMemberInput {
    name: string;
    nationalId: string;
    phone: string;
    frontPhoto: string; // URL or identifier
    backPhoto: string;  // URL or identifier
    titles?: string[];
}

// Parameter types for group investment SDK functions
interface CreateGroupBaseParams {
    amount: number;
    groupName: string;
    groupDescription?: string;
    userMembers?: UserMemberInput[];
    externalMembers?: ExternalMemberInput[];
}

export interface CreateNormalGroupParams extends CreateGroupBaseParams { }

export interface CreateLockedGroupParams extends CreateGroupBaseParams {
    lockedMonths: number;
}

// Expected result from the group creation API endpoint
export interface GroupInvestmentApiResult {
    message: string;
    groupId: string;
    investmentId: string;
}

/**
 * Creates a normal group investment by calling the backend API.
 * This involves creating a group, optionally adding members, and creating the investment record.
 *
 * @param params - The parameters for creating the group investment.
 * @returns An object containing the new groupId and investmentId.
 * @throws {Error} If the API call fails or returns an error.
 */
export async function createNormalGroupInvestment(
    params: CreateNormalGroupParams
): Promise<{ groupId: string; investmentId: string }> {
    if (params.amount <= 0) {
        throw new Error("Investment amount must be positive.");
    }
    if (!params.groupName || params.groupName.trim() === '') {
        throw new Error("Group name cannot be empty.");
    }
    // Add more client-side validation for members if desired

    const response = await fetch('/api/v1/app_investments/investments/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'normal',
            amount: params.amount,
            groupName: params.groupName,
            groupDescription: params.groupDescription,
            userMembers: params.userMembers,
            externalMembers: params.externalMembers,
        }),
    });

    const result = await handleApiResponse<GroupInvestmentApiResult>(response);
    return { groupId: result.groupId, investmentId: result.investmentId };
}

/**
 * Creates a locked group investment by calling the backend API.
 * This involves creating a group, optionally adding members, and creating the investment record.
 *
 * @param params - The parameters for creating the group investment.
 * @returns An object containing the new groupId and investmentId.
 * @throws {Error} If the API call fails or returns an error.
 */
export async function createLockedGroupInvestment(
    params: CreateLockedGroupParams
): Promise<{ groupId: string; investmentId: string }> {
    if (params.amount <= 0) {
        throw new Error("Investment amount must be positive.");
    }
    if (params.lockedMonths <= 0) {
        throw new Error("Locked months must be positive for a locked group investment.");
    }
    if (!params.groupName || params.groupName.trim() === '') {
        throw new Error("Group name cannot be empty.");
    }
    // Add more client-side validation for members if desired

    const response = await fetch('/api/v1/app_investments/investments/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'locked',
            amount: params.amount,
            lockedMonths: params.lockedMonths,
            groupName: params.groupName,
            groupDescription: params.groupDescription,
            userMembers: params.userMembers,
            externalMembers: params.externalMembers,
        }),
    });

    const result = await handleApiResponse<GroupInvestmentApiResult>(response);
    return { groupId: result.groupId, investmentId: result.investmentId };
}
