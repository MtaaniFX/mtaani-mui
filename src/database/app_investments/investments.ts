"use server"

import { createServiceRoleClient } from "@/utils/supabase/server";
import {
    CreateLockedGroupInvestmentParams,
    CreateLockedIndividualInvestmentParams,
    CreateNormalGroupInvestmentParams,
    CreateNormalIndividualInvestmentParams,
    Investment, UpdateGroupDetailsParams,
    AddGroupMembersParams,
    RemoveGroupMembersParams,
    RemoveAllGroupMembersParams,
    UpdateGroupMemberDetailsParams,
} from "./types";

const targetSchema = "app_investments";


export async function createNormalIndividualInvestment(
    params: CreateNormalIndividualInvestmentParams
): Promise<{ data?: Investment; error?: string }> {
    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .schema(targetSchema)
            .rpc('create_normal_individual_investment', {
                p_user_id: params.userId,
                p_amount: params.amount,
            })
            .single();

        if (error) {
            console.error('Error creating normal investment:', error);
            return { error: error.message };
        }

        return { data: data as Investment };
    } catch (err) {
        console.error('Unexpected error creating normal investment:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function createLockedIndividualInvestment(
    params: CreateLockedIndividualInvestmentParams
): Promise<{ data?: Investment; error?: string }> {
    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .schema(targetSchema)
            .rpc('create_locked_individual_investment', {
                p_user_id: params.userId,
                p_amount: params.amount,
                p_locked_months: params.lockedMonths,
            })
            .single();

        if (error) {
            console.error('Error creating locked investment:', error);
            return { error: error.message };
        }

        return { data: data as Investment };
    } catch (err) {
        console.error('Unexpected error creating locked investment:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function createNormalGroupInvestment(
    params: CreateNormalGroupInvestmentParams
): Promise<{ data?: Investment; error?: string }> {
    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .schema(targetSchema)
            .rpc('create_normal_group_investment', {
                p_user_id: params.userId,
                p_amount: params.amount,
                p_group_name: params.groupName,
                p_group_description: params.groupDescription || null,
                p_members: params.members ? JSON.stringify(params.members) : null
            })
            .single();

        if (error) {
            console.error('Error creating normal group investment:', error);
            return { error: error.message };
        }

        return { data: data as Investment };
    } catch (err) {
        console.error('Unexpected error creating normal group investment:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function createLockedGroupInvestment(
    params: CreateLockedGroupInvestmentParams
): Promise<{ data?: Investment; error?: string }> {
    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .schema(targetSchema)
            .rpc('create_locked_group_investment', {
                p_user_id: params.userId,
                p_amount: params.amount,
                p_locked_months: params.lockedMonths,
                p_group_name: params.groupName,
                p_group_description: params.groupDescription || null,
                p_members: params.members ? JSON.stringify(params.members) : null
            })
            .single();

        if (error) {
            console.error('Error creating locked group investment:', error);
            return { error: error.message };
        }

        return { data: data as Investment };
    } catch (err) {
        console.error('Unexpected error creating locked group investment:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function updateGroupDetails(
    params: UpdateGroupDetailsParams
): Promise<{ data?: any; error?: string }> {
    const supabase = await createServiceRoleClient();

    try {
        const { data, error } = await supabase
            .schema(targetSchema)
            .rpc('update_group_details', {
                p_group_id: params.groupId,
                p_user_id: params.userId,
                p_name: params.name || null,
                p_description: params.description || null
            })
            .single();

        if (error) {
            console.error('Error updating group details:', error);
            return { error: error.message };
        }

        return { data };
    } catch (err) {
        console.error('Unexpected error updating group details:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function addGroupMembers(
    params: AddGroupMembersParams
): Promise<{ error?: string }> {
    const supabase = await createServiceRoleClient();

    try {
        const { error } = await supabase
            .schema(targetSchema)
            .rpc('add_group_members', {
                p_group_id: params.groupId,
                p_user_id: params.userId,
                p_members: JSON.stringify(params.members)
            });

        if (error) {
            console.error('Error adding group members:', error);
            return { error: error.message };
        }

        return {};
    } catch (err) {
        console.error('Unexpected error adding group members:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function removeGroupMembers(
    params: RemoveGroupMembersParams
): Promise<{ error?: string }> {
    const supabase = await createServiceRoleClient();


    try {
        const { error } = await supabase
            .schema(targetSchema)
            .rpc('remove_group_members', {
                p_group_id: params.groupId,
                p_user_id: params.userId,
                p_member_ids: params.memberIds
            });

        if (error) {
            console.error('Error removing group members:', error);
            return { error: error.message };
        }

        return {};
    } catch (err) {
        console.error('Unexpected error removing group members:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function removeAllGroupMembers(
    params: RemoveAllGroupMembersParams
): Promise<{ error?: string }> {
    const supabase = await createServiceRoleClient();


    try {
        const { error } = await supabase
            .schema(targetSchema)
            .rpc('remove_all_group_members', {
                p_group_id: params.groupId,
                p_user_id: params.userId
            });

        if (error) {
            console.error('Error removing all group members:', error);
            return { error: error.message };
        }

        return {};
    } catch (err) {
        console.error('Unexpected error removing all group members:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function updateGroupMemberDetails(
    params: UpdateGroupMemberDetailsParams
): Promise<{ error?: string }> {
    const supabase = await createServiceRoleClient();

    try {
        const { error } = await supabase
            .schema(targetSchema)
            .rpc('update_group_member_details', {
                p_group_id: params.groupId,
                p_user_id: params.userId,
                p_member_id: params.memberId,
                p_name: params.name || null,
                p_national_id: params.nationalId || null,
                p_phone: params.phone || null,
                p_front_photo: params.frontPhoto || null,
                p_back_photo: params.backPhoto || null,
                p_titles: params.titles || null
            });

        if (error) {
            console.error('Error updating group member details:', error);
            return { error: error.message };
        }

        return {};
    } catch (err) {
        console.error('Unexpected error updating group member details:', err);
        return { error: 'An unexpected error occurred' };
    }
}

export async function getTotalInvestmentAmount(userId: string): Promise<string | undefined> {
    // TODO: create a Postgresql function and make an RPC call
    const supabase = await createServiceRoleClient();
    const { data, error } = await supabase
        .schema(targetSchema)
        .from('investments')
        .select('amount')
        .limit(1)
        .eq('user_id', userId)
        .maybeSingle();

    if (error || !data) {
        console.error('[error] getting total investment amount');
        console.error('....... fetching inv. amount:', error);
        return;
    }

    console.log('[ok] getting total investment amount');
    return data?.amount;
}
