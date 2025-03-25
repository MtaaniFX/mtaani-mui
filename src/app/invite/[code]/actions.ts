'use server'

import { cookies } from "next/headers";

export async function setCookies(code: string) {
    const cookieStore = await cookies();
    cookieStore.set('inviteCode', code, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });
}
