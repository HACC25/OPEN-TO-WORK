'use client'

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


export default function Layout({
    vendor,
    admin,
}: {
    vendor: React.ReactNode
    admin: React.ReactNode
}) {
    const isAdmin = useQuery(api.users.isAdmin)
    return isAdmin ? admin : vendor
}