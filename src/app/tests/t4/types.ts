export type GroupTitle = 'admin' | 'chair' | 'deputy chair' | 'treasurer' | 'secretary' | 'member';

export interface IDPhotos {
    frontUrl?: string;
    backUrl?: string;
}

export interface GroupMember {
    fullName: string;
    nationalId: string;
    groupTitle: GroupTitle;
    phoneNumber: string;
    idPhotos?: IDPhotos;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Group {
    name: string;
    description?: string;
    members: GroupMember[];
}

export interface PaginatedMembers {
    data: GroupMember[];
    total: number;
    page: number;
    pageSize: number;
}

export interface GroupManagementProps {
    mode: 'create' | 'edit';
    groupId?: string;
    onSubmit: (group: Group) => void;
    onBack?: () => void;
    // For edit mode
    fetchMembers?: (page: number, pageSize: number) => Promise<PaginatedMembers>;
    updateMember?: (member: GroupMember) => Promise<void>;
}

export interface MemberTableProps {
    members: GroupMember[];
    onMemberSelect: (member: GroupMember) => void;
    onMemberDelete: (members: GroupMember[]) => void;
    onAddMember: () => void;
    loading?: boolean;
    pagination?: {
        total: number;
        page: number;
        pageSize: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (pageSize: number) => void;
    };
}

export interface GroupBasicInfoProps {
    name: string;
    description?: string;
    onChange: (values: { name: string; description?: string }) => void;
    error?: {
        name?: string;
        description?: string;
    };
}
