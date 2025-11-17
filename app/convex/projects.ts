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
        const projectId = await ctx.db.insert('projects', {
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
        });
        await ctx.db.insert('log', {
            action: 'creation',
            description: `Project "${args.projectName.trim()}" created by ${user.name}`,
        });
        return projectId;
    }
});

export const updateProject = mutation({
    args: {
        projectId: v.id('projects'),
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
        const project = await ctx.db.get(args.projectId);
        if (!project) {
            throw new Error('Project not found in database');
        }
        await ctx.db.patch(project._id, {
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
        });
        await ctx.db.insert('log', {
            action: 'update',
            description: `Project "${args.projectName.trim()}" updated by ${user.name}`,
        });
        return project._id;
    }
});

export const getProjectById = query({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project) {
            throw new Error('Project not found in database');
        }
        return project;
    }
});

export const getProjects = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            return [];
        }
        if (user.role === 'vendor') {
            const projectMembers = await ctx.db.query("projectMembers").withIndex('by_user_id', q => q.eq('userId', user._id)).collect();
            const projects = (await Promise.all(projectMembers.map(pm => ctx.db.get(pm.projectId)))).filter((project): project is NonNullable<typeof project> => project !== null);
            return projects.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        const projects = await ctx.db.query("projects").collect();
        return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    }
});

export const getProjectMembers = query({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const projectMembers = await ctx.db.query('projectMembers').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        return (await Promise.all(projectMembers.map(pm => ctx.db.get(pm.userId)))).filter((user): user is NonNullable<typeof user> => user !== null);
    }
});

export const getProjectReports = query({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const report = await ctx.db.query('reports').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        const reportWithFindings = await Promise.all(report.map(async (r) => {
            const findings = await ctx.db.query('findings').withIndex('by_report_id', q => q.eq('reportId', r._id)).collect();
            return {
                ...r,
                findings,
            };
        }));
        return reportWithFindings.sort((a, b) => b.year + b.month - (a.year + a.month));
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
        const projectMemberId = await ctx.db.insert('projectMembers', {
            projectId: args.projectId,
            userId: args.userId,
        });
        await ctx.db.insert('log', {
            action: 'creation',
            description: `Project member added to project by ${user.name}`,
        });
        return projectMemberId;
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
        await ctx.db.delete(projectMember._id);
        await ctx.db.insert('log', {
            action: 'deletion',
            description: `Project member removed from project by ${user.name}`,
        });
        return projectMember._id;
    }
});

export const deleteProject = mutation({
    args: {
        projectId: v.id('projects'),
    },
    async handler(ctx, args) {
        const project = await ctx.db.get(args.projectId);
        if (!project) {
            throw new Error('Project not found in database');
        }
        const projectMembers = await ctx.db.query('projectMembers').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        const reports = await ctx.db.query('reports').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        const findings = await ctx.db.query('findings').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        const comments = await ctx.db.query('comments').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        await Promise.all(projectMembers.map(pm => ctx.db.delete(pm._id)));
        await Promise.all(reports.map(r => ctx.db.delete(r._id)));
        await Promise.all(findings.map(f => ctx.db.delete(f._id)));
        await Promise.all(comments.map(c => ctx.db.delete(c._id)));
        await ctx.db.delete(project._id);
        await ctx.db.insert('log', {
            action: 'deletion',
            description: `Project "${project.projectName}" and all associated reports, findings, and comments deleted`,
        });
        return project._id;
    }
});

export const getInfoForApi = query({
    handler: async (ctx) => {
        const projects = await ctx.db.query('projects').collect();
        const projectWithReports = await Promise.all(projects.map(async (project) => {
            const reports = await ctx.db.query('reports').withIndex('by_project_id', q => q.eq('projectId', project._id)).collect();
            const approvedReports = reports.filter(report => report.aproved);
            const reportsWithFindings = await Promise.all(approvedReports.map(async (report) => {
                const findings = await ctx.db.query('findings').withIndex('by_report_id', q => q.eq('reportId', report._id)).collect();
                return {
                    ...report,
                    findings,
                };
            }));
            return {
                project,
                reports: reportsWithFindings,
            };
        }));
        return projectWithReports.sort((a, b) => b.project.updatedAt - a.project.updatedAt);
    }
});
