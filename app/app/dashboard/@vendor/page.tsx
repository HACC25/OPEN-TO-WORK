import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import VendorDashboard from "@/components/dashboard/vendor/dashboard";

export default function Page() {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <VendorDashboard />
            </main>
        </>
    )
}
