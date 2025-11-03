import { AppSidebarContent } from "@/components/dashboard/app-sidebar-content"
import { Card } from "@/components/ui/card"

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "User Management", href: "/dashboard/users" },
    ]

    return (
        <AppSidebarContent breadcrumbItems={breadcrumbItems}>
            <Card className='h-full col-span-full py-0'>
                {children}
            </Card>
        </AppSidebarContent>
    )
}
