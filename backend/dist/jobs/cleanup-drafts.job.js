"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDraftCleanupJob = startDraftCleanupJob;
const draft_service_1 = require("../services/draft.service");
const logger_1 = require("../utils/logger");
// Run a cleanup pass every day at 02:00 AM
// (Uses a simple setInterval-based scheduler to avoid adding node-cron as a dependency)
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
function startDraftCleanupJob() {
    const run = async () => {
        try {
            const removed = await draft_service_1.draftService.deleteExpiredDrafts();
            logger_1.logger.info(`[CleanupJob] Booking draft cleanup: ${removed} expired draft(s) removed.`);
        }
        catch (err) {
            logger_1.logger.error('[CleanupJob] Error during draft cleanup:', err);
        }
    };
    // Run once shortly after startup, then every 24 h
    setTimeout(run, 30000);
    setInterval(run, INTERVAL_MS);
    logger_1.logger.info('[CleanupJob] Draft cleanup job scheduled (every 24 hours).');
}
//# sourceMappingURL=cleanup-drafts.job.js.map