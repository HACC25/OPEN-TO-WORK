import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import AdminDashboard from "@/components/dashboard/admin/dashboard";

export default function Page() {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <AdminDashboard />
            </main>
        </>
    )
}
