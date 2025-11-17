import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import React from "react";

type BreadcrumbItem = {
    label: string;
    href: string;
}

export function AppSidebarHeader({
    breadcrumbItems
}: {
    breadcrumbItems: BreadcrumbItem[]
}) {
    return (
        <header className='sticky shadow-xl bg-card top-6 z-10 mx-2 mb-6 flex items-center rounded-xl px-6 py-3.5 gap-2 backdrop-blur supports-backdrop-filter:bg-background/80'>
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
                                <BreadcrumbLink href={item.href} className="text-foreground hover:text-primary transition-colors text-sm font-medium">
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
    )
}