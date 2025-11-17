"use client";

import { use } from "react";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { Id } from "@/convex/_generated/dataModel";
import ReportDetails from "@/components/dashboard/report-details";

export default function Page({
    params
}: {
    params: Promise<{ reportId: Id<'reports'> }>
}) {
    const { reportId } = use(params);
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Report Details", href: `/dashboard/reports/${reportId}` },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <ReportDetails reportId={reportId} />
            </main>
        </>
    );
}
