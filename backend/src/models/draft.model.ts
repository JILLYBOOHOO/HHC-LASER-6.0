// backend/src/models/draft.model.ts
export interface DraftBooking {
  id: string; // UUID
  user_id: number;
  location_id: number;
  employee_id: number;
  service_ids: string; // JSON array stored as text
  scheduled_date?: string; // DATE string
  start_time?: string; // TIME string
  customer_info?: string; // JSON string
  current_step: 'service' | 'location' | 'type' | 'datetime' | 'details' | 'payment' | 'confirmation';
  last_updated: string; // timestamp
  resume_prompt_dismissed: boolean;
}
