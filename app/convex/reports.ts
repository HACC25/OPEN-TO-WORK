import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createReport = mutation({
    args: {
        projectId: v.id('projects'),
        draft: v.boolean(),
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
        findings: v.optional(v.array(v.object({
            findingNumber: v.string(),
            findingType: v.union(v.literal('Risk'), v.literal('Issue')),
            description: v.string(),
            impactRating: v.union(v.literal('Low'), v.literal('Medium'), v.literal('High')),
            likelihoodRating: v.union(v.literal('Low'), v.literal('Medium'), v.literal('High')),
            recommendation: v.string(),
            status: v.union(v.literal('Open'), v.literal('In Progress'), v.literal('Closed')),
        }))),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('User not authenticated');
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            throw new Error('User not found in database');
        }
        if (user.role !== 'vendor') {
            throw new Error('User is not authorized to create report');
        }
        const { findings, ...reportData } = args;
        const reportId = await ctx.db.insert('reports', {
            ...reportData,
            authorId: user._id,
            aproved: false,
            published: false,
            updatedAt: Date.now(),
        })
        for (const finding of findings || []) {
            await ctx.db.insert('findings', {
                ...finding,
                projectId: args.projectId,
                reportId: reportId,
                authorId: user._id,
                updatedAt: Date.now(),
            })
        }
        return reportId;
    }
});

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('User not authenticated');
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            throw new Error('User not found in database');
        }
        if (user.role == 'user') {
            throw new Error('User is not authorized to generate upload url');
        }
        return await ctx.storage.generateUploadUrl();
    },
});

export const getMyReports = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            return [];
        }
        const projects = await ctx.db.query('projectMembers').withIndex('by_user_id', q => q.eq('userId', user._id)).collect();
        const reports = await Promise.all(projects.map(async (project) => {
            const projectReports = await ctx.db.query('reports').withIndex('by_project_id', q => q.eq('projectId', project.projectId)).collect();
            return projectReports;
        }));
        console.log('refreshed reports')
        return reports.flat().sort((a, b) => b.updatedAt - a.updatedAt);
    }
});
