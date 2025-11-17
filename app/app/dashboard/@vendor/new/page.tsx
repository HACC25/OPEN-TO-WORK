import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import ReportSubmissionForm from "@/components/dashboard/vendor/new/report-submission-form";

export default function Page() {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Submit Monthly Report", href: "/dashboard/new" },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <ReportSubmissionForm />
            </main>
        </>
    );
}
