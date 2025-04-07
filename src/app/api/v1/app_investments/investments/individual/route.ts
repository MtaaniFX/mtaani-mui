import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';

const targetSchema = "app_investments";

// Define expected request body structures
interface CreateNormalInvestmentPayload {
    type: 'normal';
    amount: number;
}

interface CreateLockedInvestmentPayload {
    type: 'locked';
    amount: number;
    lockedMonths: number;
}

type CreateInvestmentPayload = CreateNormalInvestmentPayload | CreateLockedInvestmentPayload;

export async function POST(request: Request) {
    const supabaseAnonClient = await createClient(); // Create client to check auth

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabaseAnonClient.auth.getUser();

    if (authError || !user) {
        console.error('POST /api/v1/app_investments/investments/individual: Auth Error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    let payload: CreateInvestmentPayload;
    try {
        payload = await request.json();
    } catch (e) {
        console.error('POST /api/v1/app_investments/investments/individual: Invalid JSON:', e);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Basic payload validation
    if (typeof payload !== 'object' || payload === null || !payload.type || typeof payload.amount !== 'number' || payload.amount <= 0) {
        return NextResponse.json({ error: 'Invalid input: Missing or invalid type or amount.' }, { status: 400 });
    }

    // 3. Create Service Role Client
    // Ensure this doesn't throw if env vars are missing, handle appropriately inside createServiceRoleClient or here
    const supabaseServiceRoleClient = await createServiceRoleClient();
    if (!supabaseServiceRoleClient) {
        console.error('POST /api/v1/app_investments/investments/individual: Failed to create service role client');
        return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
    }

    // 4. Call the appropriate SQL function based on payload type
    try {
        let rpcResult;

        if (payload.type === 'normal') {
            console.log(`Calling create_normal_individual_investment for user ${user.id} with amount ${payload.amount}`);
            rpcResult = await supabaseServiceRoleClient.schema(targetSchema).rpc(
                'create_normal_individual_investment',
                {
                    p_user_id: user.id,
                    p_amount: payload.amount,
                }
            );
        } else if (payload.type === 'locked') {
            if (typeof payload.lockedMonths !== 'number' || payload.lockedMonths <= 0) {
                return NextResponse.json({ error: 'Invalid input: Missing or invalid lockedMonths for locked investment.' }, { status: 400 });
            }
            console.log(`Calling create_locked_individual_investment for user ${user.id} with amount ${payload.amount}, lockedMonths ${payload.lockedMonths}`);
            rpcResult = await supabaseServiceRoleClient.schema(targetSchema).rpc(
                'create_locked_individual_investment',
                {
                    p_user_id: user.id,
                    p_amount: payload.amount,
                    p_locked_months: payload.lockedMonths,
                }
            );
        } else {
            return NextResponse.json({ error: 'Invalid investment type specified' }, { status: 400 });
        }

        const { data: investmentId, error: rpcError } = rpcResult;

        if (rpcError) {
            console.error(`POST /api/v1/app_investments/investments/individual: RPC Error (Type: ${payload.type}):`, rpcError);
            // Check for specific PostgreSQL errors if needed (e.g., constraint violations)
            if (rpcError.message.includes('must be positive') || rpcError.message.includes('check constraint')) {
                return NextResponse.json({ error: `Invalid input: ${rpcError.message}` }, { status: 400 });
            }
            return NextResponse.json({ error: 'Failed to create investment', details: rpcError.message }, { status: 500 });
        }

        if (!investmentId) {
            console.error(`POST /api/v1/app_investments/investments/individual: RPC returned no data (Type: ${payload.type})`);
            return NextResponse.json({ error: 'Failed to create investment: No ID returned.' }, { status: 500 });
        }

        // 5. Return Success Response
        console.log(`Successfully created investment (Type: ${payload.type}) with ID: ${investmentId}`);
        return NextResponse.json({ message: 'Investment created successfully', investmentId: investmentId }, { status: 201 });

    } catch (error: any) {
        console.error(`POST /api/v1/app_investments/investments/individual: Unhandled Exception (Type: ${payload.type}):`, error);
        return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
    }
}
