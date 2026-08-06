"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBirthdayJob = startBirthdayJob;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const notification_service_1 = require("../services/notification.service");
// Run a check every day
// (Uses a simple setInterval-based scheduler to avoid adding node-cron as a dependency)
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
function startBirthdayJob() {
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
            const users = await (0, database_1.executeQuery)(query, [currentMonth, currentDay, currentMonth, currentDay]);
            if (users.length > 0) {
                logger_1.logger.info(`[BirthdayJob] Found ${users.length} users with a birthday today. Sending emails...`);
                for (const user of users) {
                    if (user.email) {
                        await notification_service_1.notificationService.sendBirthdayEmail(user);
                    }
                }
            }
            else {
                logger_1.logger.info(`[BirthdayJob] No birthdays found today.`);
            }
        }
        catch (err) {
            logger_1.logger.error('[BirthdayJob] Error checking for birthdays:', err);
        }
    };
    // Run once shortly after startup, then every 24 h
    setTimeout(run, 60000); // 1 minute after start
    setInterval(run, INTERVAL_MS);
    logger_1.logger.info('[BirthdayJob] Birthday email job scheduled (every 24 hours).');
}
//# sourceMappingURL=birthday.job.js.map