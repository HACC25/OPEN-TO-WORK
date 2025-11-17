"use client";

import { use } from "react";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { Id } from "@/convex/_generated/dataModel";
import ProjectDetails from "@/components/dashboard/project-details";

export default function Page({
    params
}: {
    params: Promise<{ projectId: Id<'projects'> }>
}) {
    const { projectId } = use(params);
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Project Management", href: "/dashboard/projects" },
        { label: "Project Details", href: `/dashboard/projects/${projectId}` },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <ProjectDetails projectId={projectId} />
            </main>
        </>
    );
}
