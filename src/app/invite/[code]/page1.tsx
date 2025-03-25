import InvitePage from './InvitePage';
import { ReferralService } from '@/database/referrals/crud';
import { createClient } from '@/utils/supabase/client';
import { setCookies } from './actions';

export default async function InviteHandler({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    console.log(`/invite: code: '${code}'`);
   
    setCookies(code as string);

    // const searchParams = useSearchParams()
    // const next = searchParams.get('next') 

    // Store the invite code in a cookie
    // Cookies.set('inviteCode', code, {
    //     httpOnly: true,
    //     secure: false,
    //     maxAge: 60 * 60 * 24 * 30, // 30 days
    //     path: '/',
    // });

    // If next parameter is provided, redirect to that page
    // if (next) {
    //     router.replace(next);
    //     return;
    // }

    const supabase = createClient();
    const crud = new ReferralService(supabase);

    // Check if the code is valid
    const isValidCode = await crud.isValidReferralCode(code);
    return <InvitePage inviteCode={code} isValid={isValidCode} />;
}
