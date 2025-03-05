import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the schema for the request body validation
const CreateGroupInvestmentSchema = z.object({
    group_name: z.string().min(1), // Group name is required
    group_description: z.string().optional(), // Group description is optional
    inv_type: z.enum(['normal', 'locked']), // Investment type must be 'normal' or 'locked'
    locked_months: z.number().int().min(0).max(36).optional(), // Locked months must be between 0 and 36 (optional)
    members: z.array(
        z.object({
            phone_number: z.string().min(1), // Phone number is required
            full_name: z.string(), 
            national_id_number: z.string(), 
            positions: z.array(z.string()), // Positions are required (e.g., ['chairman', 'admin'])
        })
    ),
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
        const { group_name, group_description, inv_type, locked_months, members } = CreateGroupInvestmentSchema.parse(body);

        // Start a transaction to ensure atomicity
        const { data: groupInvestment, error: groupError } = await supabase
            .schema('app_lank_investments')
            .from('group_investments')
            .insert([
                {
                    owner: user.id, // Set the current user as the owner
                    group_name,
                    group_description,
                    inv_type,
                    locked_months: inv_type === 'locked' ? locked_months : 0, // Set locked_months only if the type is 'locked'
                    status: 'created', // Default status
                },
            ])
            .select('id')
            .single();

        if (groupError || !groupInvestment) {
            console.error('Error creating group investment:', groupError);
            return NextResponse.json({ error: groupError?.message || 'Failed to create group investment' }, { status: 500 });
        }

        // Process each member
        for (const member of members) {
            // Check if the user already exists
            const { data: existingUser, error: userError } = await supabase
                .schema('app_lank_investments')
                .from('users')
                .select('id, positions')
                .eq('phone_number', member.phone_number)
                .single();

            let userId: string;
            let updatedPositions: string;

            if (userError || !existingUser) {
                // If the user doesn't exist, create a new user
                const { data: newUser, error: newUserError } = await supabase
                    .schema('app_lank_investments')
                    .from('users')
                    .insert([
                        {
                            phone_number: member.phone_number,
                            full_name: member.full_name,
                            national_id_number: member.national_id_number,
                            positions: member.positions.join(':'), // Store positions as a concatenated string
                        },
                    ])
                    .select('id')
                    .single();

                if (newUserError || !newUser) {
                    console.error('Error creating user:', newUserError);
                    return NextResponse.json({ error: newUserError?.message || 'Failed to create user' }, { status: 500 });
                }

                userId = newUser.id;
            } else {
                // If the user exists, update their positions
                const existingPositions = existingUser.positions ? existingUser.positions.split(':') : [];
                const newPositions = [...new Set([...existingPositions, ...member.positions])]; // Merge and deduplicate positions
                updatedPositions = newPositions.join(':');

                const { error: updateError } = await supabase
                    .schema('app_lank_investments')
                    .from('users')
                    .update({ positions: updatedPositions })
                    .eq('id', existingUser.id);

                if (updateError) {
                    console.error('Error updating user positions:', updateError);
                    return NextResponse.json({ error: updateError.message }, { status: 500 });
                }

                userId = existingUser.id;
            }

            // Link the user as a member of the group
            const { error: memberError } = await supabase
                .schema('app_lank_investments')
                .from('group_investment_members')
                .insert([
                    {
                        group_id: groupInvestment.id,
                        member: userId,
                    },
                ]);

            if (memberError) {
                console.error('Error adding member to group:', memberError);
                return NextResponse.json({ error: memberError.message }, { status: 500 });
            }
        }

        // Return the created group investment
        return NextResponse.json({ groupInvestment }, { status: 201 });
    } catch (err) {
        console.error('Validation or server error:', err);
        return NextResponse.json({ error: 'Invalid request body or server error' }, { status: 400 });
    }
}