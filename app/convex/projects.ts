import { mutation } from "./_generated/server";
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
        vendorName: v.string(),
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
            projectName: args.projectName,
            projectDescription: args.projectDescription,
            sponsoringAgency: args.sponsoringAgency,
            originalContractAmount: args.originalContractAmount,
            totalPaidToDate: args.totalPaidToDate,
            startDate: args.startDate,
            plannedEndDate: args.plannedEndDate,
            currentProjectedEndDate: args.currentProjectedEndDate,
            currentStatus: args.currentStatus,
            active: args.active,
            vendorName: args.vendorName,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
    }
});
