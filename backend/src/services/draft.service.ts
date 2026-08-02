import { executeQuery, executeQueryOne, executeUpdate } from '../config/database';
import { logger } from '../utils/logger';

export interface DraftBookingRow {
  id: number;
  user_id: number;
  location_id: number | null;
  employee_id: number | null;
  service_ids: string | null;         // JSON string → number[]
  scheduled_date: string | null;
  start_time: string | null;
  customer_info: string | null;        // JSON string
  current_step: string;
  resume_prompt_dismissed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaveDraftDto {
  location_id?: number | null;
  employee_id?: number | null;
  service_ids?: number[];
  scheduled_date?: string | null;
  start_time?: string | null;
  customer_info?: Record<string, any> | null;
  current_step?: string;
  resume_prompt_dismissed?: boolean;
}

class DraftService {
  // ─── Create / Update ────────────────────────────────────────────────────────
  async upsertDraft(userId: number, dto: SaveDraftDto): Promise<DraftBookingRow> {
    const existing = await this.getDraftByUser(userId);

    const serviceIds = dto.service_ids !== undefined
      ? JSON.stringify(dto.service_ids)
      : existing?.service_ids ?? null;

    const customerInfo = dto.customer_info !== undefined
      ? JSON.stringify(dto.customer_info)
      : existing?.customer_info ?? null;

    const currentStep  = dto.current_step  ?? existing?.current_step  ?? 'select-service';
    const locationId   = dto.location_id   !== undefined ? dto.location_id   : existing?.location_id  ?? null;
    const employeeId   = dto.employee_id   !== undefined ? dto.employee_id   : existing?.employee_id  ?? null;
    const scheduledDate = dto.scheduled_date !== undefined ? dto.scheduled_date : existing?.scheduled_date ?? null;
    const startTime    = dto.start_time    !== undefined ? dto.start_time    : existing?.start_time   ?? null;

    if (existing) {
      await executeUpdate(
        `UPDATE booking_drafts
            SET location_id = ?,
                employee_id = ?,
                service_ids = ?,
                scheduled_date = ?,
                start_time = ?,
                customer_info = ?,
                current_step = ?,
                resume_prompt_dismissed = ?,
                updated_at = NOW()
          WHERE user_id = ?`,
        [
          locationId,
          employeeId,
          serviceIds,
          scheduledDate,
          startTime,
          customerInfo,
          currentStep,
          dto.resume_prompt_dismissed ?? existing.resume_prompt_dismissed ?? false,
          userId,
        ]
      );
    } else {
      await executeUpdate(
        `INSERT INTO booking_drafts
           (user_id, location_id, employee_id, service_ids, scheduled_date,
            start_time, customer_info, current_step, resume_prompt_dismissed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          locationId,
          employeeId,
          serviceIds,
          scheduledDate,
          startTime,
          customerInfo,
          currentStep,
          dto.resume_prompt_dismissed ?? false,
        ]
      );
    }

    return (await this.getDraftByUser(userId))!;
  }

  // ─── Read ────────────────────────────────────────────────────────────────────
  async getDraftByUser(userId: number): Promise<DraftBookingRow | null> {
    return executeQueryOne<DraftBookingRow>(
      `SELECT * FROM booking_drafts WHERE user_id = ? LIMIT 1`,
      [userId]
    );
  }

  // ─── Dismiss resume prompt ───────────────────────────────────────────────────
  async dismissPrompt(userId: number): Promise<void> {
    await executeUpdate(
      `UPDATE booking_drafts SET resume_prompt_dismissed = TRUE WHERE user_id = ?`,
      [userId]
    );
  }

  // ─── Delete user's draft ────────────────────────────────────────────────────
  async deleteDraft(userId: number): Promise<void> {
    await executeUpdate(
      `DELETE FROM booking_drafts WHERE user_id = ?`,
      [userId]
    );
  }

  // ─── Cron: delete drafts older than 30 days ─────────────────────────────────
  async deleteExpiredDrafts(): Promise<number> {
    const result = await executeUpdate(
      `DELETE FROM booking_drafts WHERE updated_at < NOW() - INTERVAL '30 days'`
    );
    logger.info(`[DraftService] Expired drafts cleaned up: ${result.affectedRows} removed`);
    return result.affectedRows;
  }
}

export const draftService = new DraftService();
