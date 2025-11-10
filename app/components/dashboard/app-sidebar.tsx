"use client"

import * as React from "react"
import { ComponentType, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

import {
    ArrowRightLeftIcon,
    ChevronRightIcon,
    HomeIcon,
    PackageIcon,
    Plus,
    ChartArea,
    KanbanSquare,
    User,
    ChevronsUpDown,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { UserButton, useUser } from "@clerk/nextjs"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"

type MenuSubItem = {
    label: string
    href: string
    badge?: string
}

type MenuItem = {
    icon: ComponentType
    label: string
    highlighted?: boolean
} & (
        | { href: string; badge?: string; items?: never }
        | { href?: never; badge?: never; items: MenuSubItem[] }
    )

const adminPagesItems: MenuItem[] = [
    { icon: Plus, label: "New Project", highlighted: true, href: "/dashboard/new" },
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: ChartArea, label: "Dashboard", href: "/dashboard" },
    { icon: KanbanSquare, label: "Project Management", href: "/dashboard/projects" },
    { icon: User, label: "User Management", href: "/dashboard/users" },
    {
        icon: PackageIcon,
        label: "Projects",
        items: [
        ],
    },
    {
        icon: ArrowRightLeftIcon,
        label: "Reports",
        items: [
        ],
    },
]

const vendorPagesItems: MenuItem[] = [
    { icon: Plus, label: "Submit Report", highlighted: true, href: "/dashboard/new" },
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: ChartArea, label: "Dashboard", href: "/dashboard" },
    { icon: User, label: "User Management", href: "/dashboard/users" },
    {
        icon: PackageIcon,
        label: "Projects",
        items: [
            { label: "Project Overview", href: "#" },
            { label: "Add New Project", href: "#" },
            { label: "View Projects", href: "#" },
        ],
    },
    {
        icon: ArrowRightLeftIcon,
        label: "Reports",
        items: [
            { label: "Report Overview", href: "#" },
            { label: "Report Methods", href: "#" },
        ],
    },
]

export function AppSidebar({ role = 'vendor', ...props }: React.ComponentProps<typeof Sidebar> & { role: 'admin' | 'vendor' }) {
    const { open } = useSidebar()
    const { user } = useUser()
    const userButtonRef = useRef<HTMLButtonElement>(null)
    const projects = useQuery(api.projects.getProjects, {}) || []
    const reports = useQuery(api.reports.getMyReports, {}) || []

    const pagesItems = () => {
        const baseItems = role === 'admin' ? adminPagesItems : vendorPagesItems
        const projectNameById = new Map((projects || []).map(project => [project._id, project.projectName]))
        const projectSubItems: MenuSubItem[] = (projects || []).map(project => ({
            label: project.projectName,
            href: `/dashboard/projects/${project._id}`,
        }))
        const reportSubItems: MenuSubItem[] = (reports || []).map(report => ({
            label: `${report.month}/${report.year} - ${projectNameById.get(report.projectId) ?? "Project"}`,
            href: `/dashboard/reports/${report._id}`,
        }))

        return baseItems.map(item => {
            if ('items' in item && item.label === 'Projects') {
                return { ...item, items: projectSubItems }
            }
            if ('items' in item && item.label === 'Reports') {
                return { ...item, items: reportSubItems }
            }
            return item
        })
    }

    return (
        <Sidebar
            variant='floating'
            collapsible='icon'
            className='p-6 pr-0 *:data-[slot=sidebar-inner]:group-data-[variant=floating]:rounded-xl'
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className={open ? "mt-3" : ""}>
                        <SidebarMenuButton size='lg' className='bg-transparent! [&>svg]:size-8' asChild>
                            <Link href="/dashboard">
                                <Image src={open ? "/logo-text.svg" : "/logo.svg"} alt="logo" width={150} height={0} className='[&_rect]:fill-sidebar [&_rect:first-child]:fill-primary' />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {pagesItems().map((item) =>
                                item.items ? (
                                    <Collapsible className="group/collapsible" key={item.label}>
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton className="truncate">
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.label}>
                                                            <SidebarMenuSubButton asChild>
                                                                <Link href={subItem.href} className="truncate">
                                                                    {subItem.label}
                                                                    {subItem.badge && (
                                                                        <span className="bg-primary/10 flex h-5 min-w-5 items-center justify-center rounded-full text-xs">
                                                                            {subItem.badge}
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton asChild className={item.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}>
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        {item.badge && (
                                            <SidebarMenuBadge className="bg-primary/10 rounded-full">{item.badge}</SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                )
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            ref={userButtonRef}
                            size="lg"
                            className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            onClick={(e) => {
                                if (userButtonRef.current) {
                                    const clerkButton = userButtonRef.current.querySelector('[data-clerk-element="userButton"]') as HTMLElement;
                                    const fallbackButton = userButtonRef.current.querySelector('button') as HTMLButtonElement;
                                    const userButtonTrigger = clerkButton?.querySelector('button') as HTMLButtonElement ||
                                        (clerkButton instanceof HTMLButtonElement ? clerkButton : null) ||
                                        fallbackButton;

                                    if (userButtonTrigger &&
                                        userButtonTrigger !== e.target &&
                                        !userButtonTrigger.contains(e.target as Node)) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        userButtonTrigger.click();
                                    }
                                }
                            }}
                        >
                            <UserButton appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9 rounded-lg",
                                },
                            }} />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.firstName} {user?.lastName}</span>
                                <span className="truncate text-xs">{user?.emailAddresses?.[0]?.emailAddress}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
