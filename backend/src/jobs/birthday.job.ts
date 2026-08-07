import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';
import { notificationService } from '../services/notification.service';

// Run a check every day
// (Uses a simple setInterval-based scheduler to avoid adding node-cron as a dependency)
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function startBirthdayJob(): void {
  const run = async () => {
    try {
      const now = new Date();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDay = String(now.getDate()).padStart(2, '0');
      
      const query = `
        SELECT id, email, first_name 
        FROM users 
        WHERE date_of_birth LIKE '%-' || ? || '-' || ?
           OR strftime('%m-%d', date_of_birth) = ? || '-' || ?
      `;
      // We handle potential variations in date_of_birth formatting (YYYY-MM-DD)
      const users = await executeQuery(query, [currentMonth, currentDay, currentMonth, currentDay]);
      
      if (users.length > 0) {
        logger.info(`[BirthdayJob] Found ${users.length} users with a birthday today. Sending emails...`);
        for (const user of users) {
          if (user.email) {
            await notificationService.sendBirthdayEmail(user as any);
          }
        }
      } else {
        logger.info(`[BirthdayJob] No birthdays found today.`);
      }
    } catch (err) {
      logger.error('[BirthdayJob] Error checking for birthdays:', err);
    }
  };

  // Run once shortly after startup, then every 24 h
  setTimeout(run, 60_000); // 1 minute after start
  setInterval(run, INTERVAL_MS);

  logger.info('[BirthdayJob] Birthday email job scheduled (every 24 hours).');
}
