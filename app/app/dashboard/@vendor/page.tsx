import { AppSidebarContent } from "@/components/dashboard/app-sidebar-content";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
    ]

    return (
        <AppSidebarContent breadcrumbItems={breadcrumbItems}>
            <Card className='h-full'>
                <CardContent className='h-full'>
                    <div>Home - WIP</div>
                </CardContent>
            </Card>
        </AppSidebarContent>
    )
}
