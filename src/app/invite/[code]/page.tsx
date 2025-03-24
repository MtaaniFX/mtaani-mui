'use client'

import InvitePage from './InvitePage';
import { ReferralService } from '@/database/referrals/crud';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from 'js-cookie';
import React from 'react';

export default async function InviteHandler({params}: {params: Promise<{ code: string }>})  {
    const {code} = await params;
    console.log(`/invite: code: '${code}'`);

    // const searchParams = useSearchParams()
    // const next = searchParams.get('next') 
  
    // Store the invite code in a cookie
    Cookies.set('inviteCode', code, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });

    // If next parameter is provided, redirect to that page
    // if (next) {
    //     router.replace(next);
    //     return;
    // }

    const supabase = await createClient();
    const crud = new ReferralService(supabase);

    // Check if the code is valid
    const isValidCode = await crud.isValidReferralCode(code);
    return <InvitePage inviteCode={code} isValid={isValidCode} />;
}
