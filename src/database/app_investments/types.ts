export interface Investment {
    id: string;
    user_id: string;
    paid: boolean;
    paid_at: string | null;
    terminated: boolean;
    terminated_at: string | null;
    type: number;
    amount: number;
    locked_months: number;
    accrued_returns: number;
    group_id: string | null;
    created_at: string;
    updated_at: string;
}

export type CreateNormalIndividualInvestmentParams = {
    userId: string;
    amount: number;
};

export type CreateLockedIndividualInvestmentParams = {
    userId: string;
    amount: number;
    lockedMonths: number;
};

export interface GroupMemberInput {
    name: string;
    nationalId: string;
    phone: string;
    frontPhoto: string;
    backPhoto: string;
    titles?: string[];
}

export type CreateNormalGroupInvestmentParams = {
    userId: string;
    amount: number;
    groupName: string;
    groupDescription?: string;
    members?: GroupMemberInput[];
};

export type CreateLockedGroupInvestmentParams = {
    userId: string;
    amount: number;
    lockedMonths: number;
    groupName: string;
    groupDescription?: string;
    members?: GroupMemberInput[];
};

export interface UpdateGroupDetailsParams {
    groupId: string;
    userId: string;
    name?: string;
    description?: string;
}

export interface AddGroupMembersParams {
    groupId: string;
    userId: string;
    members: GroupMemberInput[];
}

export interface RemoveGroupMembersParams {
    groupId: string;
    userId: string;
    memberIds: string[];
}

export interface RemoveAllGroupMembersParams {
    groupId: string;
    userId: string;
}

export interface UpdateGroupMemberDetailsParams {
    groupId: string;
    userId: string;
    memberId: string;
    name?: string;
    nationalId?: string;
    phone?: string;
    frontPhoto?: string;
    backPhoto?: string;
    titles?: string[];
}
