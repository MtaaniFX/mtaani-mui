import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';

const targetSchema = "app_investments";

// Define expected member structures in the payload
interface UserMemberInput {
    userId: string; // UUID of existing auth.users
    titles?: string[];
}

interface ExternalMemberInput {
    name: string;
    nationalId: string;
    phone: string;
    frontPhoto: string; // URL or identifier
    backPhoto: string;  // URL or identifier
    titles?: string[];
}

// Define expected request body structures
interface CreateNormalGroupPayload {
    type: 'normal';
    amount: number;
    groupName: string;
    groupDescription?: string;
    userMembers?: UserMemberInput[];
    externalMembers?: ExternalMemberInput[];
}

interface CreateLockedGroupPayload {
    type: 'locked';
    amount: number;
    lockedMonths: number;
    groupName: string;
    groupDescription?: string;
    userMembers?: UserMemberInput[];
    externalMembers?: ExternalMemberInput[];
}

type CreateGroupInvestmentPayload = CreateNormalGroupPayload | CreateLockedGroupPayload;

// Define expected success response structure from the SQL function
interface GroupInvestmentResult {
    group_id: string;
    investment_id: string;
}


export async function POST(request: Request) {
    const supabaseAnonClient = await createClient(); // Create client to check auth

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabaseAnonClient.auth.getUser();

    if (authError || !user) {
        console.error(`POST /api/v1/${targetSchema}/investments/group: Auth Error:`, authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    let payload: CreateGroupInvestmentPayload;
    try {
        payload = await request.json();
    } catch (e) {
        console.error(`POST /api/v1/${targetSchema}/investments/group: Invalid JSON:`, e);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Basic payload validation
    if (typeof payload !== 'object' || payload === null || !payload.type || typeof payload.amount !== 'number' || payload.amount <= 0 || !payload.groupName || typeof payload.groupName !== 'string' || payload.groupName.trim() === '') {
        return NextResponse.json({ error: 'Invalid input: Missing or invalid type, amount, or groupName.' }, { status: 400 });
    }

    let investmentType: number;
    let lockedMonths: number | undefined = undefined;

    if (payload.type === 'normal') {
        investmentType = 3;
        lockedMonths = 0; // Default for normal
    } else if (payload.type === 'locked') {
        if (typeof payload.lockedMonths !== 'number' || payload.lockedMonths <= 0) {
            return NextResponse.json({ error: 'Invalid input: Missing or invalid lockedMonths for locked investment.' }, { status: 400 });
        }
        investmentType = 4;
        lockedMonths = payload.lockedMonths;
    } else {
        return NextResponse.json({ error: 'Invalid investment type specified' }, { status: 400 });
    }

    // Validate member arrays if present
    if (payload.userMembers && !Array.isArray(payload.userMembers)) {
        return NextResponse.json({ error: 'Invalid input: userMembers must be an array.' }, { status: 400 });
    }
    if (payload.externalMembers && !Array.isArray(payload.externalMembers)) {
        return NextResponse.json({ error: 'Invalid input: externalMembers must be an array.' }, { status: 400 });
    }
    // Add more specific validation for member contents if needed here


    // 3. Create Service Role Client
    let supabaseServiceRoleClient;
    try {
        supabaseServiceRoleClient = await createServiceRoleClient();
        if (!supabaseServiceRoleClient) throw new Error("Service role client creation failed.");
    } catch (error: any) {
        console.error(`POST /api/v1/${targetSchema}/investments/group: Failed to create service role client:`, error.message);
        return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }


    // 4. Prepare parameters for the SQL function
    // Map frontend names (userId) to backend names (user_id) expected by jsonb_to_recordset
    const userMembersForSql = (payload.userMembers ?? []).map(m => ({
        user_id: m.userId, // Map to snake_case expected by SQL record definition
        titles: m.titles ?? [], // Provide default empty array
    }));

    // Map external members, ensure required fields are present (basic check)
    const externalMembersForSql = (payload.externalMembers ?? []).map(m => ({
        name: m.name,
        national_id: m.nationalId, // Map to snake_case
        phone: m.phone,
        front_photo: m.frontPhoto, // Map to snake_case
        back_photo: m.backPhoto,   // Map to snake_case
        titles: m.titles ?? [], // Provide default empty array
    }));


    // 5. Call the transactional SQL function
    try {
        console.log(`Calling 'create_group_investment_transactional' for 
            user: ${user.id}, group: ${payload.groupName}, type: ${payload.type}`);
            
        const { data, error: rpcError } = await supabaseServiceRoleClient
            .schema(targetSchema) // Specify the schema
            .rpc('create_group_investment_transactional', {
                p_user_id: user.id,
                p_group_name: payload.groupName,
                p_group_description: payload.groupDescription ?? null,
                p_investment_amount: payload.amount,
                p_investment_type: investmentType,
                p_locked_months: lockedMonths,
                p_user_members: userMembersForSql, // Pass arrays as JSON(B)
                p_external_members: externalMembersForSql,
            });

        if (rpcError) {
            console.error(`POST /api/v1/${targetSchema}/investments/group: RPC Error:`, rpcError);
            // Check for specific PostgreSQL errors raised by the function
            if (rpcError.message.includes('must be positive') || rpcError.message.includes('cannot be empty') || rpcError.message.includes('Invalid investment type') || rpcError.message.includes('External member record is missing required fields') || rpcError.message.includes('already exists in this group')) {
                return NextResponse.json({ error: `Invalid input: ${rpcError.message}` }, { status: 400 });
            }
            if (rpcError.message.includes('unique constraint') && rpcError.message.includes('group_members_group_id_phone_key')) {
                return NextResponse.json({ error: `Failed to add member: Phone number already exists in this group.` }, { status: 409 }); // Conflict
            }
            return NextResponse.json({ error: 'Failed to create group investment', details: rpcError.message }, { status: 500 });
        }

        // Type assertion after checking for error
        const result = data as GroupInvestmentResult;

        if (!result || !result.group_id || !result.investment_id) {
            console.error(`POST /api/v1/${targetSchema}/investments/group: RPC returned unexpected data:`, data);
            return NextResponse.json({ error: 'Failed to create group investment: Invalid response from server.' }, { status: 500 });
        }

        // 6. Return Success Response
        console.log(`Successfully created group investment. Group ID: ${result.group_id}, Investment ID: ${result.investment_id}`);
        return NextResponse.json({
            message: 'Group investment created successfully',
            groupId: result.group_id, // Use camelCase for consistency in API response
            investmentId: result.investment_id
        }, { status: 201 });

    } catch (error: any) {
        console.error(`POST /api/v1/${targetSchema}/investments/group: Unhandled Exception:`, error);
        return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
    }
}
