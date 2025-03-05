import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for the request body validation
const CreateIndividualInvestmentSchema = z.object({
    user_id: z.string().uuid(), // Ensure the user_id is a valid UUID
    principal: z.number().positive(), // Ensure the principal is a positive number
    inv_type: z.enum(['normal', 'locked']), // Ensure the investment type is either 'normal' or 'locked'
    locked_months: z.number().int().min(0).max(36).optional(), // Ensure locked_months is between 0 and 36 (optional)
});

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const {data: {user}} = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate the request body
        const body = await request.json();
        const { user_id, principal, inv_type, locked_months } = CreateIndividualInvestmentSchema.parse(body);

        // Insert the investment into the database
        const { data, error } = await supabase
            .schema('app_lank_investments')
            .from('individual_investments')
            .insert([
                {
                    user_id: user.id,
                    principal,
                    inv_type,
                    locked_months: inv_type === 'locked' ? locked_months : 0, // Set locked_months only if the type is 'locked'
                    status: 'created', // Default status
                },
            ])
            .select();

        // Handle errors
        if (error) {
            console.error('Error creating individual investment:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return the created investment
        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        console.error('Validation or server error:', err);
        return NextResponse.json({ error: 'Invalid request body or server error' }, { status: 400 });
    }
}
