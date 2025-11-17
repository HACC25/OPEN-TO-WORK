import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getComments = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    async handler(ctx, args) {
        const paginatedResult = await ctx.db.query('comments').order("desc").paginate(args.paginationOpts);
        // Fetch author information for each comment
        const commentsWithAuthors = await Promise.all(
            paginatedResult.page.map(async (comment) => {
                const author = await ctx.db.get(comment.authorId);
                return {
                    ...comment,
                    author: author ? {
                        _id: author._id,
                        name: author.name,
                        imageUrl: author.imageUrl,
                        email: author.email,
                    } : null,
                };
            })
        );
        return {
            ...paginatedResult,
            page: commentsWithAuthors,
        };
    }
});

export const getVendorComments = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return {
                page: [],
                continueCursor: null,
                isDone: true,
            };
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            return {
                page: [],
                continueCursor: null,
                isDone: true,
            };
        }
        // Get user's projects
        const projectMembers = await ctx.db.query('projectMembers').withIndex('by_user_id', q => q.eq('userId', user._id)).collect();
        const projectIds = projectMembers.map(pm => pm.projectId);
        const allReports = await Promise.all(
            projectIds.map(projectId =>
                ctx.db.query('reports').withIndex('by_project_id', q => q.eq('projectId', projectId)).collect()
            )
        );
        const reportIds = allReports.flat().map(report => report._id);
        const allComments = await ctx.db.query('comments').order("desc").collect();
        const vendorComments = allComments.filter(comment => reportIds.includes(comment.reportId));

        const startIndex = args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0;
        const endIndex = startIndex + args.paginationOpts.numItems;
        const paginatedComments = vendorComments.slice(startIndex, endIndex);
        const isDone = endIndex >= vendorComments.length;
        const continueCursor = isDone ? null : endIndex.toString();

        const commentsWithAuthors = await Promise.all(
            paginatedComments.map(async (comment) => {
                const author = await ctx.db.get(comment.authorId);
                return {
                    ...comment,
                    author: author ? {
                        _id: author._id,
                        name: author.name,
                        imageUrl: author.imageUrl,
                        email: author.email,
                    } : null,
                };
            })
        );
        return {
            page: commentsWithAuthors,
            continueCursor,
            isDone,
        };
    }
});

export const getCommentsByReport = query({
    args: {
        reportId: v.id('reports'),
    },
    async handler(ctx, args) {
        const comments = await ctx.db.query('comments').withIndex('by_report_id', q => q.eq('reportId', args.reportId)).collect();
        // Fetch author information for each comment
        const commentsWithAuthors = await Promise.all(
            comments.map(async (comment) => {
                const author = await ctx.db.get(comment.authorId);
                return {
                    ...comment,
                    author: author ? {
                        _id: author._id,
                        name: author.name,
                        imageUrl: author.imageUrl,
                        email: author.email,
                    } : null,
                };
            })
        );
        return commentsWithAuthors.sort((a, b) => a._creationTime - b._creationTime);
    }
});

export const createComment = mutation({
    args: {
        reportId: v.id('reports'),
        content: v.string(),
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

        const report = await ctx.db.get(args.reportId);
        if (!report) {
            throw new Error('Report not found in database');
        }
        const commentId = await ctx.db.insert('comments', {
            projectId: report.projectId,
            reportId: args.reportId,
            authorId: user._id,
            content: args.content,
        });
        await ctx.db.insert('log', {
            action: 'creation',
            description: `Comment on report for month ${report.month}/${report.year} sent by ${user.name}`,
        });
        return commentId;
    }
});