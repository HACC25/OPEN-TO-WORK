import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
    ]

    return (
        <>
            <AppSidebarHeader breadcrumbItems={breadcrumbItems} />
            <main className='size-full flex-1'>
                <Card className='h-full'>
                    <CardContent className='h-full'>
                        <div>Home - WIP</div>
                    </CardContent>
                </Card>
            </main>
        </>
    )
}
