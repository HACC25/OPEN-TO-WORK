"use client";

import { use } from "react";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { Id } from "@/convex/_generated/dataModel";
import ReportDetailsUpdateForm from "@/components/dashboard/report-details-update-form";
import { Card, CardContent } from "@/components/ui/card";

export default function Page({
    params
}: {
    params: Promise<{ reportId: Id<'reports'> }>
}) {
    const { reportId } = use(params);
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Report Details", href: `/dashboard/reports/${reportId}` },
        { label: "Edit Report", href: `/dashboard/reports/${reportId}/edit` },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <ReportDetailsUpdateForm reportId={reportId} />
            </main>
        </>
    );
}
