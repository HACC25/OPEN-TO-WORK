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
        updatedAt: v.number(),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"]),

    projectMembers: defineTable({
        userId: v.id('users'),
        projectId: v.id('projects'),
    })
        .index("by_user_id", ["userId"])
        .index("by_project_id", ["projectId"])
        .index("by_user_project_id", ["userId", "projectId"]),

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
        vendorName: v.optional(v.string()),
        updatedAt: v.number(),
    }),

    monthlyReports: defineTable({
        projectId: v.id('projects'),
        month: v.number(),
        year: v.number(),
        currentStatus: v.union(v.literal('On Track'), v.literal('Minor Issues'), v.literal('Critical')),
        summary: v.string(),
        submittedBy: v.id('users'),
        updatedAt: v.number(),
    }),
});
