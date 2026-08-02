"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draftService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class DraftService {
    // ─── Create / Update ────────────────────────────────────────────────────────
    async upsertDraft(userId, dto) {
        const existing = await this.getDraftByUser(userId);
        const serviceIds = dto.service_ids !== undefined
            ? JSON.stringify(dto.service_ids)
            : existing?.service_ids ?? null;
        const customerInfo = dto.customer_info !== undefined
            ? JSON.stringify(dto.customer_info)
            : existing?.customer_info ?? null;
        const currentStep = dto.current_step ?? existing?.current_step ?? 'select-service';
        const locationId = dto.location_id !== undefined ? dto.location_id : existing?.location_id ?? null;
        const employeeId = dto.employee_id !== undefined ? dto.employee_id : existing?.employee_id ?? null;
        const scheduledDate = dto.scheduled_date !== undefined ? dto.scheduled_date : existing?.scheduled_date ?? null;
        const startTime = dto.start_time !== undefined ? dto.start_time : existing?.start_time ?? null;
        if (existing) {
            await (0, database_1.executeUpdate)(`UPDATE booking_drafts
            SET location_id = ?,
                employee_id = ?,
                service_ids = ?,
                scheduled_date = ?,
                start_time = ?,
                customer_info = ?,
                current_step = ?,
                resume_prompt_dismissed = ?,
                updated_at = NOW()
          WHERE user_id = ?`, [
                locationId,
                employeeId,
                serviceIds,
                scheduledDate,
                startTime,
                customerInfo,
                currentStep,
                dto.resume_prompt_dismissed ?? existing.resume_prompt_dismissed ?? false,
                userId,
            ]);
        }
        else {
            await (0, database_1.executeUpdate)(`INSERT INTO booking_drafts
           (user_id, location_id, employee_id, service_ids, scheduled_date,
            start_time, customer_info, current_step, resume_prompt_dismissed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                userId,
                locationId,
                employeeId,
                serviceIds,
                scheduledDate,
                startTime,
                customerInfo,
                currentStep,
                dto.resume_prompt_dismissed ?? false,
            ]);
        }
        return (await this.getDraftByUser(userId));
    }
    // ─── Read ────────────────────────────────────────────────────────────────────
    async getDraftByUser(userId) {
        return (0, database_1.executeQueryOne)(`SELECT * FROM booking_drafts WHERE user_id = ? LIMIT 1`, [userId]);
    }
    // ─── Dismiss resume prompt ───────────────────────────────────────────────────
    async dismissPrompt(userId) {
        await (0, database_1.executeUpdate)(`UPDATE booking_drafts SET resume_prompt_dismissed = TRUE WHERE user_id = ?`, [userId]);
    }
    // ─── Delete user's draft ────────────────────────────────────────────────────
    async deleteDraft(userId) {
        await (0, database_1.executeUpdate)(`DELETE FROM booking_drafts WHERE user_id = ?`, [userId]);
    }
    // ─── Cron: delete drafts older than 30 days ─────────────────────────────────
    async deleteExpiredDrafts() {
        const result = await (0, database_1.executeUpdate)(`DELETE FROM booking_drafts WHERE updated_at < NOW() - INTERVAL 30 DAY`);
        logger_1.logger.info(`[DraftService] Expired drafts cleaned up: ${result.affectedRows} removed`);
        return result.affectedRows;
    }
}
exports.draftService = new DraftService();
//# sourceMappingURL=draft.service.js.map