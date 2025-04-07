'use client'

import GroupFormContainer from "./GroupFormContainer";
import { GroupData } from "./types";

export default function () {
    const handleSubmit = async (data: GroupData) => {
        // Handle group submission
        console.log('Submitting group:', data);
    };

    const fetchMembers = async (page: number, limit: number) => {
        // Fetch members for edit mode
        return {
            members: [],
            total: 0
        };
    };

    return (
        <GroupFormContainer
            mode="create"
            onSubmit={handleSubmit}
            onBack={() => {/* handle navigation */ }}
        // For edit mode
        // groupId="123"
        // fetchMembers={fetchMembers}
        // initialData={{ name: "My Group", description: "Description" }}
        />
    );
};

