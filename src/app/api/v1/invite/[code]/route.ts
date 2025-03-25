import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ReferralService } from '@/database/referrals/crud';

export async function GET(request: NextRequest, {params}: {params: Promise<{ code: string }>}) {
    const {code: inviteCode} = await params;
    // const searchParams = request.nextUrl.searchParams;
    // const nextURL = searchParams.get('next');

    const supabase = await createClient();
    const crud = new ReferralService(supabase);
    const valid = await crud.isValidReferralCode(inviteCode);

    const cookieStore = await cookies();
    cookieStore.set('inviteCode', inviteCode, {
        httpOnly: true,
        // Use secure cookies in production
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // Expires in 1 year
        maxAge: 60 * 60 * 24 * 30 * 12, 
    });

    // if (nextURL && valid) {
    //     // Redirect to the 'next' URL if provided and the code is valid.
    //     return redirect(nextURL);
    // }

    // If no 'next' URL, render the invite page.
    const responseData = {
        inviteCode,
        isValid: valid,
    };

    // Return a JSON response that the page component can use.
    return NextResponse.json(responseData);
}
