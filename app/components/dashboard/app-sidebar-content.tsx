import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import React from "react";

type BreadcrumbItem = {
    label: string;
    href: string;
}

export function AppSidebarContent({ children, breadcrumbItems }: { children: React.ReactNode, breadcrumbItems: BreadcrumbItem[] }) {
    return (
        <div className='z-1 mx-auto flex size-full max-w-20xl flex-1 flex-col px-4 py-6 sm:px-6'>
            <header className='bg-card mb-6 flex items-center rounded-xl px-6 py-3.5 gap-2'>
                <SidebarTrigger className='cursor-pointer [&_svg]:size-5!' />
                <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbItems.map((item, idx) => (
                            <React.Fragment key={item.label}>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href={item.href} className="text-sm font-medium">
                                        {item.label}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {idx < breadcrumbItems.length - 1 && (
                                    <BreadcrumbSeparator className="hidden md:block" />
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <main className='size-full flex-1'>
                {children}
            </main>
        </div>
    )
}