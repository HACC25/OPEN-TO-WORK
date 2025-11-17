import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Purge all orphaned storage files
crons.interval(
    "purge orphaned storage files",
    { hours: 1 }, // every hour
    internal.files.purgeOrphanedFiles,
);

export default crons;