import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getLogs = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    async handler(ctx, args) {
        return await ctx.db
            .query('log')
            .order("desc")
            .paginate(args.paginationOpts);
    }
});