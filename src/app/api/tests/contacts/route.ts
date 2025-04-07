import { createServiceRoleClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


export interface ContactInsertData {
    first_name: string;
    last_name: string;
    email: string;
    tags?: string[] | null; // Match the JSON structure: tags can be an array or absent/null
}

// Define some mock data matching the ContactInsertData interface
const mockContacts: ContactInsertData[] = [
    // {
    //     first_name: 'Geralt',
    //     last_name: 'of Rivia',
    //     email: `geralt.${Date.now()}@kaermorhen.ws`, // Unique email for testing
    //     tags: ['witcher', 'monster slayer', 'gwent enthusiast']
    // },
    // {
    //     first_name: 'Yennefer',
    //     last_name: 'of Vengerberg',
    //     email: `yennefer.${Date.now()}@aedirn.mg`, // Unique email
    //     tags: ['sorceress', 'powerful', 'lilac & gooseberries']
    // },
    {
        first_name: 'Cirilla',
        last_name: 'of Cintra',
        email: `ciri.${Date.now()}@cintra.nr`, // Unique email
        // No tags provided for this contact
    },
    {
        first_name: 'Jaskier',
        last_name: 'Pankratz',
        email: `jaskier.${Date.now()}@oxenfurt.rd`, // Unique email
        tags: null // Explicitly null tags
    },
];

export async function GET(request: Request) {
    console.log('API route /api/tests/contacts called');
    
    // Create a Supabase client instance for server-side operations
    const supabase = await createServiceRoleClient();

    try {
        console.log('Calling database function insert_contacts_jsonb...');

        // Call the PostgreSQL function using rpc()
        // Pass the mock data array as the '_contacts' argument (matching the function definition)
        const { error } = await supabase.rpc('insert_contacts_jsonb', {
            _contacts: mockContacts
        });

        // Check for errors from the RPC call
        if (error) {
            console.error('Supabase RPC Error:', error);
            return NextResponse.json(
                { message: 'Error inserting contacts', error: error.message },
                { status: 500 }
            );
        }

        console.log('Successfully inserted contacts via RPC.');
        return NextResponse.json(
            { message: `Successfully inserted ${mockContacts.length} contacts.` },
            { status: 200 }
        );

    } catch (err) {
        console.error('API Route Handler Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        return NextResponse.json(
            { message: 'Failed to process request', error: errorMessage },
            { status: 500 }
        );
    }
}

// Optional: Add basic security or disable in production if needed
export const dynamic = 'force-dynamic'; // Ensures the route is executed on every request

