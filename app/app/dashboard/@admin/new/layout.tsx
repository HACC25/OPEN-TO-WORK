import { AppSidebarContent } from "@/components/dashboard/app-sidebar-content"
import { Card, CardContent } from "@/components/ui/card"

export default function NewLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "New Project", href: "/dashboard/new" },
    ]

    return (
        <AppSidebarContent breadcrumbItems={breadcrumbItems}>
            <Card className='h-full'>
                <CardContent className='h-full'>
                    {children}
                </CardContent>
            </Card>
        </AppSidebarContent>
    )
}
