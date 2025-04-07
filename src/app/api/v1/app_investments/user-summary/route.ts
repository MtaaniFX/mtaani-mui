import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';

const targetSchema = "app_investments";

export type GetResponseData = {
    totalPaidInvestment: number,
    totalAccruedReturns: number,
    returnsPercentage: number,
};

export async function GET(request: NextRequest) {
    const supabaseClient = await createClient(); // Anon client for auth check

    // 1. Check user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
        console.error("API Auth Error:", authError);
        return NextResponse.json(
            { code: 'UNAUTHENTICATED', message: 'User is not authenticated.' },
            { status: 401 }
        );
    }

    const supabaseServiceRoleClient = await createServiceRoleClient(); // Service Role client

    try {
        // 2. Call the SQL function using the authenticated user's ID
        const { data, error: rpcError } = await supabaseServiceRoleClient
            .schema(targetSchema)
            .rpc('get_user_investment_summary', {
                p_user_id: user.id, // Use the authenticated user's ID
            })
            .single(); // Expecting a single row result

        if (rpcError) {
            console.error(`RPC Error (get_user_investment_summary for user ${user.id}):`, rpcError);
            // Provide a generic error message to the client
            return NextResponse.json(
                { code: 'DB_RPC_ERROR', message: 'Failed to retrieve investment summary.' },
                { status: 500 }
            );
        }

        // 3. Return the summary data
        if (data) {
            const rpcData = data as {
                total_paid_investment: number,
                total_accrued_returns: number,
                returns_percentage: number,
            };
            // Ensure numeric types are handled correctly if needed (though JSON usually handles them)
            const responseData: GetResponseData = {
                totalPaidInvestment: rpcData.total_paid_investment,
                totalAccruedReturns: rpcData.total_accrued_returns,
                returnsPercentage: rpcData.returns_percentage,
            };
            return NextResponse.json(responseData, { status: 200 });
        } else {
            // Should ideally not happen with .single() unless the function itself returned nothing unexpectedly
            console.error(`RPC Error (get_user_investment_summary for user ${user.id}): No data returned`);
            return NextResponse.json(
                { code: 'DB_UNEXPECTED_NODATA', message: 'Unexpected error: No summary data found.' },
                { status: 500 }
            );
        }

    } catch (e: any) {
        console.error("API General Error (user-summary):", e);
        return NextResponse.json(
            { code: 'INTERNAL_SERVER_ERROR', message: `An unexpected error occurred: ${e.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
