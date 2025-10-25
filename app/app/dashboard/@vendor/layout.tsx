import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CSSProperties } from "react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className='bg-muted before:bg-primary relative flex min-h-dvh w-full before:fixed before:inset-x-0 before:top-0 before:h-65'>
            <SidebarProvider
                style={
                    {
                        '--sidebar': 'var(--card)',
                        '--sidebar-width': '17.5rem',
                        '--sidebar-width-icon': '3.5rem'
                    } as CSSProperties
                }
            >
                <AppSidebar />
                {children}
            </SidebarProvider>
        </div>
    )
}
