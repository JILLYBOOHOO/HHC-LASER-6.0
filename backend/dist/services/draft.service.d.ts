export interface DraftBookingRow {
    id: number;
    user_id: number;
    location_id: number | null;
    employee_id: number | null;
    service_ids: string | null;
    scheduled_date: string | null;
    start_time: string | null;
    customer_info: string | null;
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
declare class DraftService {
    upsertDraft(userId: number, dto: SaveDraftDto): Promise<DraftBookingRow>;
    getDraftByUser(userId: number): Promise<DraftBookingRow | null>;
    dismissPrompt(userId: number): Promise<void>;
    deleteDraft(userId: number): Promise<void>;
    deleteExpiredDrafts(): Promise<number>;
}
export declare const draftService: DraftService;
export {};
//# sourceMappingURL=draft.service.d.ts.map