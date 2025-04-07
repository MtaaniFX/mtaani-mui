export interface Investment {
    id: string; // uuid
    user_id: string; // uuid
    paid: boolean;
    paid_at: string | null; // ISO date string or null
    terminated: boolean;
    terminated_at: string | null; // ISO date string or null
    type: number; // 1-4 corresponding to investment_types
    amount: number; // in Kenyan Shillings
    locked_months: number;
    accrued_returns: number;
    group_id: string | null; // uuid or null
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Additional related types that would be in the same file
export interface GroupMemberInput {
    name: string;
    nationalId: string;
    phone: string;
    frontPhoto: string;
    backPhoto: string;
    titles?: string[];
}

export interface CreateNormalGroupInvestmentParams {
    userId: string;
    amount: number;
    groupName: string;
    groupDescription?: string;
    members?: GroupMemberInput[];
}

export interface CreateLockedGroupInvestmentParams {
    userId: string;
    amount: number;
    lockedMonths: number;
    groupName: string;
    groupDescription?: string;
    members?: GroupMemberInput[];
}
