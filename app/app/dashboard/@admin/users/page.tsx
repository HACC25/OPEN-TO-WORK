"use client";

import UserTable from "@/components/dashboard/admin/user-table";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function Page() {

    const [searchString, setSearchString] = useState('');
    const users = useQuery(api.users.getUsers, { searchString });
    const updateUserMetadata = useMutation(api.users.updateUserMetadata);

    return (
        <UserTable
            users={users}
            updateUserMetadata={updateUserMetadata}
            searchString={searchString}
            setSearchString={setSearchString}
        />
    );
}
