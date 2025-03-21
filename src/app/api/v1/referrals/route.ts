import { createSuperuserClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { ReferralService } from "@/database/referrals/crud";

export async function POST(request: Request) {
    const supabase = await createSuperuserClient();

    const response = await supabase.auth.getUser();
    if (response.error || !response.data) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const crud = new ReferralService(supabase);
    const refCreationResponse = await crud.createOrGetReferralCode(
        response.data.user.id,
        generateRandomCode
    );

    if (refCreationResponse.error ) {
        return NextResponse.json({ error: refCreationResponse.error }, { status: 401 });
    }
    
    if (!refCreationResponse.data) {
        return NextResponse.json({ error: "Unknown error" }, { status: 401 });
    }

    const data = refCreationResponse.data
    return NextResponse.json({ data }, { status: 201 });
}

// Example output: A3B2C9
function generateRandomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }

    return code;
}
