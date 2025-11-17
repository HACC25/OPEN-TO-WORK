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
        await ctx.db.insert('log', {
            action: 'creation',
            description: `Report for month ${args.month}/${args.year} created by ${user.name}`,
        });
        return reportId;
    }
});

export const updateReport = mutation({
    args: {
        reportId: v.id('reports'),
        draft: v.boolean(),
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

        const report = await ctx.db.get(args.reportId);
        if (!report) {
            throw new Error('Report not found');
        }
        const existingFindings = await ctx.db.query('findings').withIndex('by_report_id', q => q.eq('reportId', args.reportId)).collect();
        for (const finding of existingFindings) {
            await ctx.db.delete(finding._id);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { findings, reportId, ...reportData } = args;
        await ctx.db.patch(args.reportId, {
            ...reportData,
            updatedAt: Date.now(),
        });

        for (const finding of findings || []) {
            await ctx.db.insert('findings', {
                ...finding,
                projectId: report.projectId,
                reportId: args.reportId,
                authorId: user._id,
                updatedAt: Date.now(),
            });
        }
        await ctx.db.insert('log', {
            action: 'update',
            description: `Report updated by ${user.name}`,
        });
        return args.reportId;
    }
});

export const deleteReport = mutation({
    args: {
        reportId: v.id('reports'),
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
        if (user.role == 'user') {
            throw new Error('User is not authorized to delete report');
        }

        const findings = await ctx.db.query('findings').withIndex('by_report_id', q => q.eq('reportId', args.reportId)).collect();
        await Promise.all(findings.map(f => ctx.db.delete(f._id)));
        const comments = await ctx.db.query('comments').withIndex('by_report_id', q => q.eq('reportId', args.reportId)).collect();
        await Promise.all(comments.map(c => ctx.db.delete(c._id)));
        const report = await ctx.db.get(args.reportId);
        if (!report) {
            throw new Error('Report not found');
        }
        await ctx.db.delete(args.reportId);
        await ctx.db.insert('log', {
            action: 'deletion',
            description: `Report for month ${report.month}/${report.year} deleted by ${user.name}`,
        });
        return args.reportId;
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
        if (user.role == 'admin') {
            const reports = await ctx.db.query('reports').collect();
            return reports.sort((a, b) => {
                const aYearMonth = a.year * 10 + a.month;
                const bYearMonth = b.year * 10 + b.month;
                return bYearMonth - aYearMonth;
            });
        }
        const projects = await ctx.db.query('projectMembers').withIndex('by_user_id', q => q.eq('userId', user._id)).collect();
        const reports = await Promise.all(projects.map(async (project) => {
            const projectReports = await ctx.db.query('reports').withIndex('by_project_id', q => q.eq('projectId', project.projectId)).collect();
            return projectReports;
        }));
        return reports.flat().sort((a, b) => {
            const aYearMonth = a.year * 10 + a.month;
            const bYearMonth = b.year * 10 + b.month;
            return bYearMonth - aYearMonth;
        });
    }
});

export const getReport = query({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const reports = await ctx.db.query('reports').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        return reports;
    }
});

export const getReportById = query({
    args: {
        reportId: v.id('reports'),
    },
    handler: async (ctx, args) => {
        const report = await ctx.db.get(args.reportId);
        return report;
    }
});

export const getFindingsByReport = query({
    args: {
        reportId: v.id('reports'),
    },
    handler: async (ctx, args) => {
        const findings = await ctx.db.query('findings').withIndex('by_report_id', q => q.eq('reportId', args.reportId)).collect();
        return findings;
    }
});

export const getFindingsByProject = query({
    args: {
        projectId: v.id('projects'),
    },
    handler: async (ctx, args) => {
        const findings = await ctx.db.query('findings').withIndex('by_project_id', q => q.eq('projectId', args.projectId)).collect();
        return findings;
    }
});

export const updateFinalAttachment = mutation({
    args: {
        reportId: v.id('reports'),
        finalAttachmentId: v.id('_storage'),
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
            throw new Error('Report not found');
        }
        await ctx.db.patch(args.reportId, {
            finalAttachmentId: args.finalAttachmentId,
            updatedAt: Date.now(),
        });
        await ctx.db.insert('log', {
            action: 'update',
            description: `Final attachment updated for report by ${user.name}`,
        });
        return args.reportId;
    }
});

export const toggleReportApproval = mutation({
    args: {
        reportId: v.id('reports'),
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
            throw new Error('Report not found');
        }

        const newApprovedStatus = !report.aproved;
        await ctx.db.patch(args.reportId, {
            aproved: newApprovedStatus,
            published: newApprovedStatus,
            updatedAt: Date.now(),
        });
        await ctx.db.insert('log', {
            action: 'update',
            description: `Report approval ${newApprovedStatus ? 'approved' : 'rejected'} by ${user.name}`,
        });
        return args.reportId;
    }
});

export const getReportStats = query({
    args: {
        month: v.number(),
        year: v.number(),
    },
    handler: async (ctx, args) => {
        const { month, year } = args;
        const reports = await ctx.db.query('reports').withIndex('by_month_year', q => q.eq('month', month).eq('year', year)).collect();
        const totalReports = reports.length;
        const totalReportsInReview = reports.filter(report => !report.aproved).length;
        const totalReportsPublished = reports.filter(report => report.published).length;
        const totalHighRiskReports = reports.filter(report => report.currentStatus === 'Critical').length;

        const lastMonth = month - 1 > 0 ? month - 1 : 12;
        const lastYear = month - 1 > 0 ? year : year - 1;
        const lastMonthReports = await ctx.db.query('reports').withIndex('by_month_year', q => q.eq('month', lastMonth).eq('year', lastYear)).collect();
        const totalLastMonthReports = lastMonthReports.length;
        const totalLastMonthReportsInReview = lastMonthReports.filter(report => !report.aproved).length;
        const totalLastMonthReportsPublished = lastMonthReports.filter(report => report.published).length;
        const totalLastMonthHighRiskReports = lastMonthReports.filter(report => report.currentStatus === 'Critical').length;

        return {
            totalReports,
            totalReportsInReview,
            totalReportsPublished,
            totalHighRiskReports,
            totalLastMonthReports,
            totalLastMonthReportsInReview,
            totalLastMonthReportsPublished,
            totalLastMonthHighRiskReports,
        };
    }
});

export const getReportsPendingApproval = query({
    handler: async (ctx) => {
        const reports = await ctx.db.query('reports').withIndex('by_approved', q => q.eq('aproved', false)).collect();
        const reportsWithProjectName = await Promise.all(reports.map(async (report) => {
            const project = await ctx.db.get(report.projectId);
            return {
                ...report,
                projectName: project?.projectName,
                sponsoringAgency: project?.sponsoringAgency,
                vendorName: project?.vendorName,
            };
        }));
        return reportsWithProjectName;
    }
});

export const getVendorReportsPendingApproval = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            return [];
        }

        const projectMembers = await ctx.db.query('projectMembers').withIndex('by_user_id', q => q.eq('userId', user._id)).collect();
        const projectIds = projectMembers.map(pm => pm.projectId);
        const allPendingReports = await ctx.db.query('reports').withIndex('by_approved', q => q.eq('aproved', false)).collect();
        const vendorReports = allPendingReports.filter(report => projectIds.includes(report.projectId));
        const reportsWithProjectName = await Promise.all(vendorReports.map(async (report) => {
            const project = await ctx.db.get(report.projectId);
            return {
                ...report,
                projectName: project?.projectName,
                sponsoringAgency: project?.sponsoringAgency,
                vendorName: project?.vendorName,
            };
        }));
        return reportsWithProjectName;
    }
});

export const getApprovedFilterSelections = query({
    handler: async (ctx) => {
        const approvedReports = await ctx.db.query('reports').withIndex('by_approved', q => q.eq('aproved', true)).collect();
        if (approvedReports.length === 0) {
            return {
                agencies: [],
                vendors: [],
                periods: [],
                ratings: [],
            };
        }

        const projectIds = Array.from(new Set(approvedReports.map(report => report.projectId)));
        const projects = await Promise.all(projectIds.map(projectId => ctx.db.get(projectId)));
        const agencySet = new Set<string>();
        const vendorSet = new Set<string>();
        for (const project of projects) {
            if (!project) continue;
            if (project.sponsoringAgency) {
                agencySet.add(project.sponsoringAgency);
            }
            if (project.vendorName) {
                vendorSet.add(project.vendorName);
            }
        }
        const periodSet = new Set<string>();
        const ratingSet = new Set<string>();
        for (const report of approvedReports) {
            periodSet.add(`${report.month}/${report.year}`);
            ratingSet.add(report.currentStatus);
        }
        return {
            agencies: Array.from(agencySet).sort(),
            vendors: Array.from(vendorSet).sort(),
            periods: Array.from(periodSet).sort(),
            ratings: Array.from(ratingSet).sort(),
        };
    }
});

export const getApprovedReports = query({
    args: {
        agency: v.optional(v.string()),
        vendor: v.optional(v.string()),
        period: v.optional(v.string()),
        rating: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { agency, vendor, period, rating, search } = args;
        const approvedReports = await ctx.db.query('reports').withIndex('by_approved', q => q.eq('aproved', true)).collect();
        if (approvedReports.length === 0) {
            return [];
        }

        const projectIds = Array.from(new Set(approvedReports.map(report => report.projectId)));
        const projects = await Promise.all(projectIds.map(projectId => ctx.db.get(projectId)));
        const projectMap = new Map<typeof projectIds[number], NonNullable<typeof projects[number]>>();
        projects.forEach((project, index) => {
            if (project) {
                projectMap.set(projectIds[index], project);
            }
        });

        let targetMonth: number | undefined;
        let targetYear: number | undefined;
        if (period && period.trim().length > 0) {
            const [monthStr, yearStr] = period.split('/');
            const parsedMonth = Number(monthStr);
            const parsedYear = Number(yearStr);
            if (!Number.isNaN(parsedMonth) && !Number.isNaN(parsedYear)) {
                targetMonth = parsedMonth;
                targetYear = parsedYear;
            }
        }

        const normalizedSearch = search?.trim().toLowerCase();

        const filteredReports = approvedReports
            .map(report => {
                const project = projectMap.get(report.projectId);
                return {
                    ...report,
                    projectName: project?.projectName,
                    sponsoringAgency: project?.sponsoringAgency,
                    vendorName: project?.vendorName,
                    currentStatus: report.currentStatus,
                    month: report.month,
                    year: report.year,
                    finalAttachmentId: report.finalAttachmentId,
                    summary: report.summary,
                };
            })
            .filter(report => {
                if (agency?.trim().length && report.sponsoringAgency !== agency) return false;
                if (vendor?.trim().length && report.vendorName !== vendor) return false;
                if (rating?.trim().length && report.currentStatus !== rating) return false;
                if (targetMonth !== undefined && targetYear !== undefined && (report.month !== targetMonth || report.year !== targetYear)) return false;
                if (normalizedSearch) {
                    const haystacks = [report.projectName, report.sponsoringAgency, report.vendorName, report.summary]
                        .filter((value): value is string => Boolean(value))
                        .map(value => value.toLowerCase());
                    const hasMatch = haystacks.some(value => value.includes(normalizedSearch));
                    if (!hasMatch) return false;
                }
                return true;
            })
            .sort((a, b) => b.updatedAt - a.updatedAt);
        return filteredReports;
    }
});

export const getHomePageReports = query({
    handler: async (ctx) => {
        const reports = await ctx.db
            .query('reports')
            .withIndex('by_approved', q => q.eq('aproved', true))
            .take(3);
        const reportsWithProjectName = await Promise.all(reports.map(async (report) => {
            const project = await ctx.db.get(report.projectId);
            return {
                ...report,
                projectName: project?.projectName,
                sponsoringAgency: project?.sponsoringAgency,
                vendorName: project?.vendorName,
            };
        }));
        return reportsWithProjectName;
    }
});
