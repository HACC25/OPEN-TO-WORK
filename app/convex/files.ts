import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const purgeOrphanedFiles = internalMutation({
    handler: async (ctx) => {
        const files = await ctx.db.system.query("_storage").collect();
        if (files.length === 0) {
            return { deleted: 0 };
        }

        const reports = await ctx.db.query("reports").collect();

        const referencedFileIds = new Set<Id<"_storage">>();
        for (const report of reports) {
            referencedFileIds.add(report.attachmentId);
            if (report.finalAttachmentId) {
                referencedFileIds.add(report.finalAttachmentId);
            }
        }

        let deleted = 0;
        for (const file of files) {
            if (!referencedFileIds.has(file._id)) {
                await ctx.storage.delete(file._id);
                deleted += 1;
            }
        }

        return { deleted };
    },
});