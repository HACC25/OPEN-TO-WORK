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

    reports: defineTable({
        projectId: v.id('projects'),
        authorId: v.id('users'),
        draft: v.boolean(),
        aproved: v.boolean(),
        published: v.boolean(),
        month: v.number(),
        year: v.number(),
        currentStatus: v.union(v.literal('On Track'), v.literal('Minor Issues'), v.literal('Critical')),
        teamPerformance: v.optional(v.union(v.literal('On Track'), v.literal('Minor Issues'), v.literal('Critical'))),
        projectManagement: v.optional(v.union(v.literal('On Track'), v.literal('Minor Issues'), v.literal('Critical'))),
        technicalReadiness: v.optional(v.union(v.literal('On Track'), v.literal('Minor Issues'), v.literal('Critical'))),
        summary: v.string(),
        accomplishments: v.optional(v.string()),
        challenges: v.optional(v.string()),
        upcomingMilestones: v.optional(v.string()),
        budgetStatus: v.optional(v.string()),
        scheduleStatus: v.optional(v.string()),
        riskSummary: v.optional(v.string()),
        attachmentId: v.id('_storage'),
        finalAttachmentId: v.optional(v.id('_storage')),
        updatedAt: v.number(),
    })
        .index("by_project_id", ["projectId"])
        .index("by_author_id", ["authorId"])
        .index("by_month_year", ["month", "year"])
        .index("by_month_year_project", ["month", "year", "projectId"])
        .index("by_approved", ["aproved"])
        .index("by_attachment_id", ["attachmentId"])
        .index("by_final_attachment_id", ["finalAttachmentId"]),

    findings: defineTable({
        projectId: v.id('projects'),
        reportId: v.id('reports'),
        authorId: v.id('users'),
        findingNumber: v.string(),
        findingType: v.union(v.literal('Risk'), v.literal('Issue')),
        description: v.string(),
        impactRating: v.union(v.literal('Low'), v.literal('Medium'), v.literal('High')),
        likelihoodRating: v.union(v.literal('Low'), v.literal('Medium'), v.literal('High')),
        recommendation: v.string(),
        status: v.union(v.literal('Open'), v.literal('In Progress'), v.literal('Closed')),
        updatedAt: v.number(),
    })
        .index("by_project_id", ["projectId"])
        .index("by_report_id", ["reportId"])
        .index("by_author_id", ["authorId"])
        .index("by_finding_type", ["findingType"])
        .index("by_impact_rating", ["impactRating"])
        .index("by_status", ["status"]),

    comments: defineTable({
        projectId: v.id('projects'),
        reportId: v.id('reports'),
        authorId: v.id('users'),
        content: v.string(),
    })
        .index("by_project_id", ["projectId"])
        .index("by_report_id", ["reportId"])
        .index("by_author_id", ["authorId"]),

    log: defineTable({
        action: v.union(v.literal('creation'), v.literal('update'), v.literal('deletion')),
        description: v.string(),
    })
        .index("by_action", ["action"]),
});
