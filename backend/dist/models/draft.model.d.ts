export interface DraftBooking {
    id: string;
    user_id: number;
    location_id: number;
    employee_id: number;
    service_ids: string;
    scheduled_date?: string;
    start_time?: string;
    customer_info?: string;
    current_step: 'service' | 'location' | 'type' | 'datetime' | 'details' | 'payment' | 'confirmation';
    last_updated: string;
    resume_prompt_dismissed: boolean;
}
//# sourceMappingURL=draft.model.d.ts.map