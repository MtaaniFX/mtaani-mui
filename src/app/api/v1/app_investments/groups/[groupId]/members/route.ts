import { NextResponse, NextRequest } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';

const targetSchema = "app_investments";

// Define expected member structure in the payload
interface AddMemberPayloadItem {
    type: 1 | 2;
    userId?: string; // Required if type is 1
    titles?: string[]; // Optional
    name?: string; // Required if type is 2
    nationalId?: string; // Required if type is 2
    phone?: string; // Required if type is 2
    frontPhoto?: string; // Optional
    backPhoto?: string; // Optional
}

type AddMembersPayload = AddMemberPayloadItem[];

// Define expected structure of the RPC response
interface AddMembersResult {
    attempted: number;
    added: number;
    duplicates_skipped: number;
    errors: number;
    skipped_phones: string[];
}


// Basic validation for a single member object
function validateMemberPayload(member: any): string | null {
    if (!member || typeof member !== 'object') return 'Invalid member data format.';
    if (member.type !== 1 && member.type !== 2) return 'Invalid member type (must be 1 or 2).';

    if (member.titles && (!Array.isArray(member.titles) || member.titles.some((t: any) => typeof t !== 'string'))) {
        return 'Invalid titles format (must be an array of strings).';
    }

    if (member.type === 1) {
        if (typeof member.userId !== 'string' || member.userId.length === 0) return 'Missing or invalid userId for member type 1.';
    } else { // type === 2
        if (typeof member.name !== 'string' || member.name.length === 0) return 'Missing or invalid name for member type 2.';
        if (typeof member.nationalId !== 'string' || member.nationalId.length === 0) return 'Missing or invalid nationalId for member type 2.';
        if (typeof member.phone !== 'string' || member.phone.length === 0) return 'Missing or invalid phone for member type 2.';
        if (member.frontPhoto !== undefined && typeof member.frontPhoto !== 'string') return 'Invalid frontPhoto format.';
        if (member.backPhoto !== undefined && typeof member.backPhoto !== 'string') return 'Invalid backPhoto format.';
    }
    return null; // No error
}


export async function POST(
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
        console.error(`POST /api/v1/app_investments/groups/${groupId}/members: Auth Error:`, authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    let payload: AddMembersPayload;
    try {
        payload = await request.json();
        if (!Array.isArray(payload) || payload.length === 0) {
            return NextResponse.json({ error: 'Request body must be a non-empty array of members' }, { status: 400 });
        }
        // Validate each member in the array
        for (const member of payload) {
            const validationError = validateMemberPayload(member);
            if (validationError) {
                return NextResponse.json({ error: `Invalid member data: ${validationError}`, memberData: member }, { status: 400 });
            }
        }

    } catch (e) {
        console.error(`POST /api/v1/app_investments/groups/${groupId}/members: Invalid JSON:`, e);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 3. Create Service Role Client
    const supabaseServiceRoleClient = await createServiceRoleClient();
    if (!supabaseServiceRoleClient) {
        console.error(`POST /api/v1/app_investments/groups/${groupId}/members: Failed to create service role client`);
        return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }

    // 4. Call the SQL function
    try {
        console.log(`Calling add_group_members for group ${groupId} by user ${user.id}`);
        const { data: result, error: rpcError } = await supabaseServiceRoleClient
            .schema(targetSchema)
            .rpc('add_group_members', {
                p_group_id: groupId,
                p_owner_id: user.id, // Pass authenticated user ID for ownership check
                p_members: payload // Pass the validated array as JSONB
            });

        if (rpcError) {
            console.error(`POST /api/v1/app_investments/groups/${groupId}/members: RPC Error:`, rpcError);
            if (rpcError.message.includes('Permission denied')) {
                return NextResponse.json({ error: 'Forbidden: You are not the owner of this group' }, { status: 403 });
            }
            if (rpcError.message.includes('Group not found')) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }
            // Include specific validation errors from the function if possible
            if (rpcError.message.includes('Invalid input') || rpcError.message.includes('Invalid member type') || rpcError.message.includes('Missing')) {
                return NextResponse.json({ error: `Failed to add members: ${rpcError.message}` }, { status: 400 });
            }
            return NextResponse.json({ error: 'Failed to add members', details: rpcError.message }, { status: 500 });
        }

        // The function returns a summary object
        const summary = result as AddMembersResult;
        console.log(`Add members summary for group ${groupId}:`, summary);

        // Determine status code based on outcome
        let statusCode = 200; // OK
        if (summary.added > 0 && (summary.duplicates_skipped > 0 || summary.errors > 0)) {
            statusCode = 207; // Multi-Status
        } else if (summary.added === 0 && summary.attempted > 0) {
            // Decide if this is an error or just nothing happened (e.g., all duplicates)
            // Let's treat it as success but indicate nothing was added if no errors.
            if (summary.errors > 0) {
                statusCode = 400; // Bad request if errors occurred during processing
            } else {
                statusCode = 200; // OK, but maybe return a specific message
            }
        }

        return NextResponse.json(summary, { status: statusCode });

    } catch (error: any) {
        console.error(`POST /api/v1/app_investments/groups/${groupId}/members: Unhandled Exception:`, error);
        return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
    }
}


export async function DELETE(
    request: NextRequest, // Use NextRequest to easily access searchParams
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
        console.error(`DELETE /api/v1/app_investments/groups/${groupId}/members: Auth Error:`, authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Determine mode: Remove specific or remove all
    const phonesParam = request.nextUrl.searchParams.get('phones');
    let phonesToRemove: string[] | null = null;

    if (phonesParam) {
        phonesToRemove = phonesParam.split(',').map(p => p.trim()).filter(p => p.length > 0);
        if (phonesToRemove.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty phone numbers provided in query parameter' }, { status: 400 });
        }
        console.log(`DELETE request for group ${groupId} targeting phones:`, phonesToRemove);
    } else {
        console.log(`DELETE request for group ${groupId} targeting all members`);
    }

    // 3. Create Service Role Client
    const supabaseServiceRoleClient = await createServiceRoleClient();
    if (!supabaseServiceRoleClient) {
        console.error(`DELETE /api/v1/app_investments/groups/${groupId}/members: Failed to create service role client`);
        return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }

    // 4. Call the appropriate SQL function
    try {
        let rpcResult;
        if (phonesToRemove) {
            // Call function to remove specific members
            rpcResult = await supabaseServiceRoleClient
                .schema(targetSchema)
                .rpc('remove_group_members_by_phone', {
                    p_group_id: groupId,
                    p_owner_id: user.id, // Pass authenticated user ID for ownership check
                    p_phones: phonesToRemove
                });
        } else {
            // Call function to remove all members
            rpcResult = await supabaseServiceRoleClient
                .schema(targetSchema)
                .rpc('remove_all_group_members', {
                    p_group_id: groupId,
                    p_owner_id: user.id // Pass authenticated user ID for ownership check
                });
        }

        const { data: removedCount, error: rpcError } = rpcResult;

        if (rpcError) {
            console.error(`DELETE /api/v1/app_investments/groups/${groupId}/members: RPC Error:`, rpcError);
            if (rpcError.message.includes('Permission denied')) {
                return NextResponse.json({ error: 'Forbidden: You are not the owner of this group' }, { status: 403 });
            }
            if (rpcError.message.includes('Group not found')) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Failed to remove member(s)', details: rpcError.message }, { status: 500 });
        }

        console.log(`Successfully removed ${removedCount ?? 0} member(s) from group ${groupId}`);
        // Return count of removed members
        return NextResponse.json({ message: `Successfully removed ${removedCount ?? 0} member(s).`, removedCount: removedCount ?? 0 }, { status: 200 });
        // Alternatively, return 204 No Content if count is not needed by client
        // return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`DELETE /api/v1/app_investments/groups/${groupId}/members: Unhandled Exception:`, error);
        return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
    }
}
