"use client";

import UserTable from "@/components/dashboard/admin/user-table";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { Card } from "@/components/ui/card";

export default function Page() {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "User Management", href: "/dashboard/users" },
    ]

    const [searchString, setSearchString] = useState('');
    const users = useQuery(api.users.getUsers, { searchString });
    const updateUserMetadata = useMutation(api.users.updateUserMetadata);

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <Card className='h-full col-span-full py-0'>
                    <UserTable
                        users={users}
                        updateUserMetadata={updateUserMetadata}
                        searchString={searchString}
                        setSearchString={setSearchString}
                    />
                </Card>
            </main>
        </>
    );
}
