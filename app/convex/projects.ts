import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
    args: {
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
        if (user.role !== 'admin') {
            throw new Error('User is not authorized to create projects');
        }
        return ctx.db.insert('projects', {
            projectName: args.projectName.trim(),
            projectDescription: args.projectDescription.trim(),
            sponsoringAgency: args.sponsoringAgency.trim(),
            originalContractAmount: args.originalContractAmount,
            totalPaidToDate: args.totalPaidToDate,
            startDate: args.startDate,
            plannedEndDate: args.plannedEndDate,
            currentProjectedEndDate: args.currentProjectedEndDate,
            currentStatus: args.currentStatus,
            active: args.active,
            vendorName: args.vendorName?.trim() === '' ? undefined : args.vendorName?.trim(),
            updatedAt: Date.now(),
        })
    }
});

export const getProjects = query({
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('User not authenticated');
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            throw new Error('User not found in database');
        }
        if (user.role !== 'admin') {
            throw new Error('User is not authorized to view projects');
        }
        const projects = await ctx.db.query("projects").collect();
        return await Promise.all(
            projects.map(async (project) => {
                const projectMembers = await ctx.db
                    .query("projectMembers")
                    .withIndex("by_project_id", q => q.eq("projectId", project._id))
                    .collect();

                const userIds = projectMembers.map(pm => pm.userId);
                const members = (await Promise.all(userIds.map(userId => ctx.db.get(userId)))).filter((user): user is NonNullable<typeof user> => user !== null);

                return {
                    ...project,
                    members: members,
                };
            })
        );
    }
});

export const addProjectMember = mutation({
    args: {
        projectId: v.id('projects'),
        userId: v.id('users'),
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
        if (user.role !== 'admin') {
            throw new Error('User is not authorized to add project members');
        }
        const project = await ctx.db.get(args.projectId);
        if (!project) {
            throw new Error('Project not found in database');
        }
        const userToAdd = await ctx.db.get(args.userId);
        if (!userToAdd) {
            throw new Error('User not found in database');
        }
        const projectMember = await ctx.db.query('projectMembers').withIndex('by_user_project_id', q => q.eq('userId', args.userId).eq('projectId', args.projectId)).first();
        if (projectMember) {
            throw new Error('User is already a member of this project');
        }
        return ctx.db.insert('projectMembers', {
            projectId: args.projectId,
            userId: args.userId,
        })
    }
});

export const removeProjectMember = mutation({
    args: {
        projectId: v.id('projects'),
        userId: v.id('users'),
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
        if (user.role !== 'admin') {
            throw new Error('User is not authorized to remove project members');
        }
        const projectMember = await ctx.db.query('projectMembers').withIndex('by_user_project_id', q => q.eq('userId', args.userId).eq('projectId', args.projectId)).first();
        if (!projectMember) {
            throw new Error('Project member not found in database');
        }
        return ctx.db.delete(projectMember._id);
    }
});
