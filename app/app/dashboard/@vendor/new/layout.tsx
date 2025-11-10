import { AppSidebarContent } from "@/components/dashboard/app-sidebar-content"

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Submit Monthly Report", href: "/dashboard/new" },
    ]

    return (
        <AppSidebarContent breadcrumbItems={breadcrumbItems}>
            {children}
        </AppSidebarContent>
    )
}
