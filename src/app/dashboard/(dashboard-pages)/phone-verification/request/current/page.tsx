'use server'

import PhoneVerificationNotification from "./PhoneVerificationNotification";
import { createClient } from "@/utils/supabase/server";


async function Page() {
    const supabase = await createClient();
    let code: string = '';

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .schema('app_phone')
            .from('verification_requests')
            .select('verification_code')
            .eq('user_id', user.id)
            .order('updated_at', {ascending: false})
            .limit(1)
            .single();

        if (error) throw error;

        code = data.verification_code as string;
       
    } catch (err: any) {
        console.log(err?.message);
    }
   
    return (
        <>
            <PhoneVerificationNotification
                verificationCode={code}
                companyNumber="0703171615"
            />
        </>
    )
}

export default Page;
