import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';

const targetSchema = "app_investments";

// Define expected structure for each item in the payload array
interface UpdateMemberDetailsPayloadItem {
    phone: string; // Required identifier
    name?: string;
    nationalId?: string;
    frontPhoto?: string | null; // Allow null
    backPhoto?: string | null;  // Allow null
}

type UpdateMemberDetailsPayload = UpdateMemberDetailsPayloadItem[];

// Define expected structure of the RPC response
interface UpdateMembersDetailsResult {
    attempted: number;
    updated: number;
    not_found: number;
    wrong_type: number;
    errors: number;
}

// Basic validation for a single update item
function validateUpdatePayloadItem(item: any): string | null {
    if (!item || typeof item !== 'object') return 'Invalid update item format.';
    if (typeof item.phone !== 'string' || item.phone.length === 0) return 'Missing or invalid phone number.';
    // Check optional fields only if present
    if (item.name !== undefined && (typeof item.name !== 'string' || item.name.length === 0)) return `Invalid name for phone ${item.phone}.`;
    if (item.nationalId !== undefined && (typeof item.nationalId !== 'string' || item.nationalId.length === 0)) return `Invalid nationalId for phone ${item.phone}.`;
    if (item.frontPhoto !== undefined && item.frontPhoto !== null && typeof item.frontPhoto !== 'string') return `Invalid frontPhoto for phone ${item.phone}.`;
    if (item.backPhoto !== undefined && item.backPhoto !== null && typeof item.backPhoto !== 'string') return `Invalid backPhoto for phone ${item.phone}.`;
    // Ensure at least one updatable field is present besides phone
    if (item.name === undefined && item.nationalId === undefined && item.frontPhoto === undefined && item.backPhoto === undefined) {
        return `No update data provided for phone ${item.phone}.`;
    }
    return null; // No error
}


export async function PATCH(
    request: Request,
    { params }: { params: { groupId: string } }
) {
    const groupId = params.groupId;
    if (!groupId) {
        return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const supabaseAnonClient = await createClient();

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabaseAnonClient.auth.getUser();
    if (authError || !user) {
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/members/details: Auth Error:`, authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    let payload: UpdateMemberDetailsPayload;
    try {
        payload = await request.json();
        if (!Array.isArray(payload) || payload.length === 0) {
            return NextResponse.json({ error: 'Request body must be a non-empty array of member updates' }, { status: 400 });
        }
        // Validate each item in the array
        for (const item of payload) {
            const validationError = validateUpdatePayloadItem(item);
            if (validationError) {
                return NextResponse.json({ error: `Invalid member update data: ${validationError}`, itemData: item }, { status: 400 });
            }
        }
    } catch (e) {
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/members/details: Invalid JSON:`, e);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 3. Create Service Role Client
    const supabaseServiceRoleClient = await createServiceRoleClient();
    if (!supabaseServiceRoleClient) {
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/members/details: Failed to create service role client`);
        return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }

    // 4. Call the SQL function
    try {
        console.log(`Calling update_external_group_member_details for group ${groupId} by user ${user.id}`);
        const { data: result, error: rpcError } = await supabaseServiceRoleClient
            .schema(targetSchema)
            .rpc('update_external_group_member_details', {
                p_group_id: groupId,
                p_owner_id: user.id, // Pass authenticated user ID for ownership check
                p_updates: payload // Pass the validated array as JSONB
            });

        if (rpcError) {
            console.error(`PATCH /api/v1/app_investments/groups/${groupId}/members/details: RPC Error:`, rpcError);
            if (rpcError.message.includes('Permission denied')) {
                return NextResponse.json({ error: 'Forbidden: You are not the owner of this group' }, { status: 403 });
            }
            if (rpcError.message.includes('Group not found')) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }
            // Include specific validation errors from the function if possible
            if (rpcError.message.includes('Invalid input') || rpcError.message.includes('Missing phone') || rpcError.message.includes('Invalid name') || rpcError.message.includes('Invalid nationalId') || rpcError.message.includes('Invalid frontPhoto') || rpcError.message.includes('Invalid backPhoto')) {
                return NextResponse.json({ error: `Failed to update members: ${rpcError.message}` }, { status: 400 });
            }
            return NextResponse.json({ error: 'Failed to update member details', details: rpcError.message }, { status: 500 });
        }

        // The function returns a summary object
        const summary = result as UpdateMembersDetailsResult;
        console.log(`Update external member details summary for group ${groupId}:`, summary);

        // Determine status code based on outcome
        let statusCode = 200; // OK
        if (summary.updated > 0 && (summary.not_found > 0 || summary.wrong_type > 0 || summary.errors > 0)) {
            statusCode = 207; // Multi-Status
        } else if (summary.updated === 0 && summary.attempted > 0) {
            if (summary.errors > 0) {
                statusCode = 400; // Indicate failure if errors occurred
            } else if (summary.not_found > 0 || summary.wrong_type > 0) {
                statusCode = 404; // Or 400 - indicate some requested updates couldn't be applied
            } else {
                statusCode = 200; // OK, but nothing was updated (e.g., all skipped, no data provided)
            }
        }

        return NextResponse.json(summary, { status: statusCode });

    } catch (error: any) {
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/members/details: Unhandled Exception:`, error);
        return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
    }
}
