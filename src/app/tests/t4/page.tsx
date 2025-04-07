'use client'

import { GroupManagementForm } from "./GroupManagementForm";
import { Group, GroupMember } from "./types";

// Example usage in a page component
const GroupPage: React.FC = () => {
    const handleSubmit = async (group: Group) => {
        // Handle group submission
        console.log('Submitting group:', group);
    };

    const handleBack = () => {
        // Handle navigation
    };

    const fetchMembers = async (page: number, pageSize: number) => {
        // Fetch members from API
        return {
            data: [],
            total: 0,
            page,
            pageSize,
        };
    };

    const updateMember = async (member: GroupMember) => {
        // Update member in API
    };

    return (
        <GroupManagementForm
            mode="create"
            onSubmit={handleSubmit}
            onBack={handleBack}
            fetchMembers={fetchMembers}
            updateMember={updateMember}
        />
    );
};

export default GroupPage;
