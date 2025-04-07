'use server'

import { createServiceRoleClient } from "@/utils/supabase/server";
import { Investment } from "./types";

export type Out = {
    totalPages: number,
    investments: Investment[],
};

export const f = async (user_id: string, page: number, itemsPerPage: number): Promise<Out> => {
    'use server';

    let out: Out = {
        totalPages: 0,
        investments: [],
    };

    const supabase = await createServiceRoleClient();
    try {
        // Get total count for pagination
        const { count } = await supabase
            .schema('app_investments')
            .from('investments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id);

        out.totalPages = (Math.ceil((count || 0) / itemsPerPage));

        // Get paginated data
        const { data, error } = await supabase
            .schema('app_investments')
            .from('investments')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (error) throw error;

        out.investments = data || [];
    } catch (error) {
        console.error('Error fetching investments:', error);
        throw new Error(`Error fetching investments: ${error}`);
    }

    return out;
}
