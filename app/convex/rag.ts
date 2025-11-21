import { components, internal } from "./_generated/api";
import { action, internalAction, internalQuery } from "./_generated/server";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

const rag = new RAG(components.rag, {
    textEmbeddingModel: openai.embedding("text-embedding-3-small"),
    embeddingDimension: 1536,
});

export const getAllReports = internalQuery({
    handler: async (ctx) => {
        const reports = await ctx.db.query("reports").collect();
        const reportsWithCompleteInfo = await Promise.all(reports.map(async (report) => {
            const findings = await ctx.db.query('findings').withIndex('by_report_id', q => q.eq('reportId', report._id)).collect();
            const project = await ctx.db.get(report.projectId);
            return {
                ...report,
                findings,
                project: project,
            };
        }));
        return reportsWithCompleteInfo;
    },
});

export const getReportById = internalQuery({
    args: {
        reportId: v.id('reports'),
    },
    handler: async (ctx, args): Promise<{ report: Doc<'reports'>, project: Doc<'projects'> | null } | null> => {
        const report = await ctx.db.get(args.reportId);
        if (!report) {
            return null;
        }
        const project = await ctx.db.get(report.projectId);
        return {
            report: report,
            project: project,
        };
    },
});

export const loadRagContexts = internalAction({
    handler: async (ctx) => {
        // Use ctx.runQuery to call the internal query
        const reports = await ctx.runQuery(internal.rag.getAllReports);
        await Promise.all(reports.map((report) =>
            rag.add(ctx, {
                namespace: "reports",
                title: `${report.project?.projectName} - ${report.month}/${report.year}`,
                key: report._id,
                text: JSON.stringify(report),
            })
        ));
    },
});

export const purgeRagContexts = internalAction({
    handler: async (ctx) => {
        const allEntries = await rag.list(ctx, { paginationOpts: { cursor: null, numItems: 1000 } });
        for (const entry of allEntries.page) {
            await rag.delete(ctx, { entryId: entry.entryId });
        }
    },
});

export const semanticSearch = action({
    args: {
        query: v.string(),
    },
    handler: async (ctx, args): Promise<Array<{ report: Doc<'reports'>, project: Doc<'projects'> | null }>> => {
        await ctx.runAction(internal.rag.purgeRagContexts);
        await ctx.runAction(internal.rag.loadRagContexts);
        const { entries } = await rag.search(ctx, {
            namespace: "reports",
            query: args.query,
            limit: 1,
        });
        const reportIds = entries
            .map((entry) => entry.key as Id<'reports'> | undefined)
            .filter((key): key is Id<'reports'> => typeof key !== "undefined");
        const reports = await Promise.all(
            reportIds.map((reportId) =>
                ctx.runQuery(internal.rag.getReportById, { reportId })
            )
        );
        // Filter out null results and ensure proper typing
        return reports.filter((r): r is { report: Doc<'reports'>, project: Doc<'projects'> | null } => r !== null);
    },
});


export const askQuestion = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.runAction(internal.rag.purgeRagContexts);
        await ctx.runAction(internal.rag.loadRagContexts);
        const { text } = await rag.generateText(ctx, {
            search: { namespace: "reports", limit: 10 },
            prompt: args.prompt,
            model: openai.chat("gpt-4o-mini"),
        });
        return text;
    },
});