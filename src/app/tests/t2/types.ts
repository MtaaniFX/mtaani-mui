type GroupTitle = 'admin' | 'chair' | 'deputy chair' | 'treasurer' | 'secretary' | 'member';

export interface GroupInfo {
    name: string;
    description?: string;
}

export interface GroupMember {
    fullName: string;
    nationalId: string;
    groupTitle: GroupTitle;
    phoneNumber: string;
    idFrontUrl?: string;
    idBackUrl?: string;
}

export interface GroupData {
    name: string;
    description?: string;
    members: GroupMember[];
}

