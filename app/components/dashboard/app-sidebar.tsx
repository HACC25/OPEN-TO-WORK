"use client"

import * as React from "react"
import { ComponentType } from "react"
import Link from "next/link"
import Image from "next/image"

import {
    ArrowRightLeftIcon,
    ChevronRightIcon,
    HomeIcon,
    PackageIcon,
    LogOutIcon,
    Plus,
    ChartArea,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { SignOutButton, useUser } from "@clerk/nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

const pagesItems: MenuItem[] = [
    { icon: Plus, label: "New Project", highlighted: true, href: "/dashboard/new" },
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: ChartArea, label: "Dashboard", href: "/dashboard" },
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open, isMobile } = useSidebar()
    const { user } = useUser()

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
                            {pagesItems.map((item) =>
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
                                                            <SidebarMenuSubButton className="justify-between" asChild>
                                                                <Link href={subItem.href}>
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.imageUrl} alt={(user?.firstName ?? "") + " " + (user?.lastName ?? "")} />
                                        <AvatarFallback className="rounded-lg">{user?.fullName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user?.firstName} {user?.lastName}</span>
                                        <span className="truncate text-xs">{user?.emailAddresses?.[0]?.emailAddress}</span>
                                    </div>
                                    <ChevronRightIcon className="ml-auto size-4 rotate-90" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <SignOutButton>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <LogOutIcon className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </SignOutButton>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
