"use client";

import ProjectTable from "@/components/dashboard/admin/project-table";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";

export default function Page() {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Project Management", href: "/dashboard/projects" },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <ProjectTable />
            </main>
        </>
    );
}
