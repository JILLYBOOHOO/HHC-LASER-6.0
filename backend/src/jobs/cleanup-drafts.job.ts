import { draftService } from '../services/draft.service';
import { logger } from '../utils/logger';

// Run a cleanup pass every day at 02:00 AM
// (Uses a simple setInterval-based scheduler to avoid adding node-cron as a dependency)
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function startDraftCleanupJob(): void {
  const run = async () => {
    try {
      const removed = await draftService.deleteExpiredDrafts();
      logger.info(`[CleanupJob] Booking draft cleanup: ${removed} expired draft(s) removed.`);
    } catch (err) {
      logger.error('[CleanupJob] Error during draft cleanup:', err);
    }
  };

  // Run once shortly after startup, then every 24 h
  setTimeout(run, 30_000);
  setInterval(run, INTERVAL_MS);

  logger.info('[CleanupJob] Draft cleanup job scheduled (every 24 hours).');
}
