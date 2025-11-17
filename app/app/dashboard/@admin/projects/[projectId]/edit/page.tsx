"use client";

import { use } from "react";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { Id } from "@/convex/_generated/dataModel";
import ProjectDetailsUpdateForm from "@/components/dashboard/project-details-update-form";
import { Card, CardContent } from "@/components/ui/card";

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
        { label: "Edit Project", href: `/dashboard/projects/${projectId}/edit` },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <Card className='h-full'>
                    <CardContent className='h-full'>
                        <ProjectDetailsUpdateForm projectId={projectId} />
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
