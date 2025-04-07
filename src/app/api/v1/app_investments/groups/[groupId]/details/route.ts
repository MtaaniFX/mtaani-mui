import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';

const targetSchema = "app_investments";

interface UpdateGroupDetailsPayload {
    name?: string; // Optional: new name
    description?: string | null; // Optional: new description (allow null to clear it)
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
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/details: Auth Error:`, authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    let payload: UpdateGroupDetailsPayload;
    try {
        payload = await request.json();
        // Ensure at least one field is being updated
        if (payload.name === undefined && payload.description === undefined) {
            return NextResponse.json({ error: 'No update data provided (provide name or description)' }, { status: 400 });
        }
        // Basic type validation (more specific checks can be added)
        if (payload.name !== undefined && typeof payload.name !== 'string') {
            return NextResponse.json({ error: 'Invalid name format' }, { status: 400 });
        }
        if (payload.description !== undefined && payload.description !== null && typeof payload.description !== 'string') {
            return NextResponse.json({ error: 'Invalid description format' }, { status: 400 });
        }

    } catch (e) {
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/details: Invalid JSON:`, e);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 3. Create Service Role Client
    const supabaseServiceRoleClient = await createServiceRoleClient();
    if (!supabaseServiceRoleClient) {
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/details: Failed to create service role client`);
        return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }

    // 4. Call the SQL function
    try {
        console.log(`Calling update_group_details for group ${groupId} by user ${user.id}`);
        const { data: success, error: rpcError } = await supabaseServiceRoleClient
            .schema(targetSchema)
            .rpc('update_group_details', {
                p_group_id: groupId,
                p_owner_id: user.id, // Pass authenticated user ID for ownership check
                p_name: payload.name ?? null, // Pass null if not provided
                p_description: payload.description !== undefined ? payload.description : null // Distinguish undefined from null
            });

        if (rpcError) {
            console.error(`PATCH /api/v1/app_investments/groups/${groupId}/details: RPC Error:`, rpcError);
            if (rpcError.message.includes('Permission denied')) {
                return NextResponse.json({ error: 'Forbidden: You are not the owner of this group' }, { status: 403 });
            }
            if (rpcError.message.includes('Group not found')) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Failed to update group details', details: rpcError.message }, { status: 500 });
        }

        if (success) {
            console.log(`Successfully updated details for group ${groupId}`);
            // Optionally fetch and return updated group data here
            return NextResponse.json({ message: 'Group details updated successfully' }, { status: 200 });
        } else {
            // This case might occur if the function returns false instead of raising an error
            console.error(`PATCH /api/v1/app_investments/groups/${groupId}/details: RPC returned false`);
            return NextResponse.json({ error: 'Failed to update group details' }, { status: 500 });
        }

    } catch (error: any) {
        console.error(`PATCH /api/v1/app_investments/groups/${groupId}/details: Unhandled Exception:`, error);
        return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
    }
}
