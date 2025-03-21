import { SupabaseClient, User } from '@supabase/supabase-js';

export interface ReferralCode {
    user_id: string;
    code: string;
    created_at?: string; // Optional, as it's handled by the database
}

export interface Referral {
    id?: number;  // Optional, as it's handled by database
    referrer_id: string;
    referred_id: string;
    used_code: string;
    created_at?: string; // Optional, as it's handled by the database
}

export class ReferralService {
    private supabase: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabase = supabaseClient;
    }

    /**
     * Creates a new referral code for a user.
     * @param userId The ID of the user creating the code.
     * @param code The unique referral code.
     * @returns The created ReferralCode object or an error.
     */
    async createReferralCode(userId: string, code: string): Promise<{ data: ReferralCode | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referral_codes')
            .insert([{ user_id: userId, code }])
            .select()
            .single(); // Use single() to enforce the uniqueness constraint
        return { data, error };
    }

    /**
     * Gets the referral code for a given user.
     * @param userId The ID of the user.
     * @returns The ReferralCode object or an error.
     */
    async getReferralCodeByUserId(userId: string): Promise<{ data: ReferralCode | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referral_codes')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
        return { data, error };
    }

    /**
   * Gets the referral code by the code itself.
   * @param code The referral code.
   * @returns The ReferralCode object or an error.
   */
    async getReferralCodeByCode(code: string): Promise<{ data: ReferralCode | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referral_codes')
            .select('*')
            .eq('code', code)
            .single(); // Expecting a single result
        return { data, error };
    }

    /**
     * Records a successful referral.
     * @param referrerId The ID of the referrer.
     * @param referredId The ID of the referred user.
     * @param usedCode The referral code used.
     * @returns The created Referral object or an error.
     */
    async createReferral(referrerId: string, referredId: string, usedCode: string): Promise<{ data: Referral | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referrals')
            .insert([{ referrer_id: referrerId, referred_id: referredId, used_code: usedCode }])
            .select()
            .single();

        if (error) {
            // Handle unique constraint violation (referred_id already exists)
            if (error.code === '23505') { // 23505 is the code for unique_violation in postgresql
                return { data: null, error: { message: "This user has already been referred.", code: error.code } };
            }
        }

        return { data, error };
    }

    /**
     * Gets referrals made by a specific user (referrer).
     * @param referrerId The ID of the referrer.
     * @returns An array of Referral objects or an error.
     */
    async getReferralsByReferrer(referrerId: string): Promise<{ data: Referral[] | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referrals')
            .select('*')
            .eq('referrer_id', referrerId);
        return { data, error };
    }

    /**
     * Gets referrals made by a specific user (referrer).
     * @param referrerId The ID of the referrer.
     * @returns An array of Referral objects or an error.
     */
    async getReferralsByReferrerPaged(referrerId: string, page: number, rowsPerPage: number): Promise<{ data: Referral[] | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referrals')
            .select('*')
            .eq('referrer_id', referrerId)
            .range(page * rowsPerPage, (page + 1) * rowsPerPage);
        return { data, error };
    }

    /**
     * Gets referrals where a specific user was referred.
     * @param referredId The ID of the referred user.
     * @returns An array of Referral objects, or an error
     */
    async getReferralsByReferred(referredId: string): Promise<{ data: Referral[] | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referrals')
            .select('*')
            .eq('referred_id', referredId);
        return { data, error }
    }

    /**
     * Gets a referral by its ID.  Primarily useful for internal checks or admin functions.
     * @param referralId The ID of the referral.
     * @returns The Referral object or an error.
     */
    async getReferralById(referralId: number): Promise<{ data: Referral | null; error: any }> {
        const { data, error } = await this.supabase
            .schema('app_referrals')
            .from('referrals')
            .select('*')
            .eq('id', referralId)
            .single();
        return { data, error };
    }


    /**
     *  Counts the number of referrals a user has made.
     * @param referrerId
     * @returns the count, or error
     */
    async countReferralsByReferrer(referrerId: string): Promise<{ data: number | null; error: any; }> {
        const { data, error, count } = await this.supabase
            .schema('app_referrals')
            .from('referrals')
            .select('*', { count: 'exact' })
            .eq('referrer_id', referrerId);

        return { data: count, error };
    }

    /**
     * Checks if a referral code is valid (exists in the referral_codes table).
     * @param code - The referral code to check.
     * @returns True if the code is valid, false otherwise.
     */
    async isValidReferralCode(code: string): Promise<boolean> {
        const { data, error } = await this.getReferralCodeByCode(code);
        if (error) {
            console.error("Error checking referral code validity:", error);
            return false;  // Treat errors as invalid
        }
        return !!data; // Return true if data exists (code is valid), false otherwise
    }

    /**
     * Creates or retrieves a referral code for a user.
     * @param userId The ID of the user.
     * @param generateCodeFn A function that generates a referral code (e.g., () => 'ABCDEF').
     * @returns The existing or newly created ReferralCode, or an error.
     */
    async createOrGetReferralCode(
        userId: string,
        generateCodeFn: () => string
    ): Promise<{ data: ReferralCode | null; error: any }> {
        // 1. Check if the user already has a referral code
        const { data: existingCode, error: getError } = await this.getReferralCodeByUserId(userId);
        if (getError && getError.code !== 'PGRST116') { // PGRST116 means not found in supabase
            return { data: null, error: getError };
        }

        if (existingCode) {
            // User already has a code, return it
            return { data: existingCode, error: null };
        }

        // 2. User doesn't have a code, generate a new one
        let newCode: string;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops

        do {
            newCode = generateCodeFn();
            attempts++;

            // 3. Check if the generated code already exists
            const { data: codeExists, error: checkError } = await this.getReferralCodeByCode(newCode);

            if (checkError && checkError.code !== 'PGRST116') { //PGRST116 means not found
                return { data: null, error: checkError }
            }

            if (!codeExists) {
                // Code is unique, try to create the record
                const { data: createdCode, error: createError } = await this.createReferralCode(userId, newCode);

                if (createError) {
                    // Handle unique constraint violation (user_id already exists although we check it)
                    if (createError.code === '23505') {
                        // This should rarely happen if getReferralCodeByUserId is working, but check anyway
                        const { data: finalCode, error: finalError } = await this.getReferralCodeByUserId(userId);
                        if (finalError) return { data: null, error: finalError }; //very very rare, but check just in case
                        return { data: finalCode, error: null }; // we should return the code.
                    }
                    // Some other error occurred during creation
                    return { data: null, error: createError };
                } else {
                    // Code created successfully
                    return { data: createdCode, error: null };
                }
            }

            // Code already exists, try again (up to maxAttempts)
        } while (attempts < maxAttempts);

        return { data: null, error: { message: 'Could not generate a unique referral code after multiple attempts.' } };
    }
}
