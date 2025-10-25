import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        imageUrl: v.string(),
        role: v.union(v.literal('admin'), v.literal('user'), v.literal('vendor')),
        isActive: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

    projects: defineTable({
        projectName: v.string(),
        projectDescription: v.string(),
        sponsoringAgency: v.string(),
        originalContractAmount: v.number(),
        totalPaidToDate: v.number(),
        startDate: v.number(),
        plannedEndDate: v.number(),
        currentProjectedEndDate: v.number(),
        currentStatus: v.union(v.literal('On Track'), v.literal('At Risk'), v.literal('Critical')),
        active: v.boolean(),
        vendorName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }),
});
