// ─── Domain Types ──────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'manager' | 'specialist' | 'customer' | 'developer';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_treatment'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentPaymentStatus = 'pending_payment' | 'paid_online' | 'paid_in_store' | 'paid_by_phone' | 'deposit_paid' | 'pay_at_appointment' | 'refunded' | 'complimentary';

export type TransactionPaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partial';

export type BookingSource = 'website' | 'phone' | 'walk_in' | 'whatsapp' | 'social_media' | 'admin' | 'staff';

export type MembershipPlan = 'monthly' | 'annual';

export type MembershipStatus = 'active' | 'paused' | 'cancelled' | 'expired';

export type NotificationType = 'email' | 'sms' | 'push';

export type BookingType = 'self' | 'other' | 'group';

export type FitzpatrickType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

// ─── User Models ────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: Date | null;
  profile_photo_url: string | null;
  google_id: string | null;
  token_version: number;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithRoles extends User {
  roles: UserRole[];
}

export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
}

// ─── Location Models ────────────────────────────────────────────────────────────

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  parish: string;
  phone: string;
  email: string;
  google_maps_url: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface BusinessHours {
  id: number;
  location_id: number;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

// ─── Service Models ──────────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Service {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  duration_minutes: number;
  price_jmd: number;
  price_usd: number | null;
  deposit_required: boolean;
  deposit_amount_jmd: number | null;
  requires_consultation: boolean;
  preparation_notes: string | null;
  aftercare_notes: string | null;
  thumbnail_url: string | null;
  prep_video_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
}

// ─── Employee Models ─────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  user_id: number;
  location_id: number;
  title: string | null;
  bio: string | null;
  specializations: string | null;
  certifications: string | null;
  is_accepting_clients: boolean;
  created_at: Date;
}

export interface EmployeeSchedule {
  id: number;
  employee_id: number;
  location_id: number;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// ─── Appointment Models ──────────────────────────────────────────────────────────

export interface Appointment {
  id: number;
  booking_type: BookingType;
  group_id: string | null;
  customer_user_id: number;
  booked_for_user_id: number | null;
  employee_id: number;
  location_id: number;
  resource_id: number | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  booking_source: BookingSource;
  status: AppointmentStatus;
  payment_status: AppointmentPaymentStatus;
  notes: string | null;
  total_amount_jmd: number;
  deposit_paid_jmd: number;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentService {
  id: number;
  appointment_id: number;
  service_id: number;
  price_jmd: number;
  duration_minutes: number;
}

export interface CreateAppointmentDto {
  booking_type: BookingType;
  employee_id: number;
  location_id: number;
  scheduled_date: string;
  start_time: string;
  service_ids: number[];
  booking_source?: BookingSource;
  notes?: string;
  booked_for_user_id?: number;
  group_size?: number;
  group_guests?: { first_name: string; last_name: string; email?: string; phone?: string }[];
}

// ─── Payment Models ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  appointment_id: number | null;
  customer_user_id: number;
  recorded_by_user_id: number | null;
  fiserv_txn_id: string | null;
  idempotency_key: string;
  amount_jmd: number;
  currency: string;
  status: TransactionPaymentStatus;
  payment_method: string | null;
  fiserv_approval_code: string | null;
  fiserv_response_code: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// ─── Membership Models ────────────────────────────────────────────────────────────

export interface MembershipPlanDef {
  id: number;
  name: string;
  plan_type: MembershipPlan;
  price_jmd: number;
  sessions_per_cycle: number;
  services_included: string;
  description: string;
  is_active: boolean;
}

export interface CustomerMembership {
  id: number;
  customer_user_id: number;
  plan_id: number;
  status: MembershipStatus;
  start_date: string;
  end_date: string;
  sessions_remaining: number;
  auto_renew: boolean;
  last_transaction_id: number | null;
  created_at: Date;
}

// ─── Medical Record Models ────────────────────────────────────────────────────────

export interface IntakeForm {
  id: number;
  customer_user_id: number;
  appointment_id: number | null;
  fitzpatrick_type: FitzpatrickType | null;
  skin_conditions: string | null;
  allergies: string | null;
  medications: string | null;
  contraindications: string | null;
  previous_treatments: string | null;
  pregnancy_status: boolean;
  pacemaker_status: boolean;
  keloid_history: boolean;
  sun_exposure_recent: boolean;
  additional_notes: string | null;
  submitted_at: Date;
}

export interface TreatmentNote {
  id: number;
  appointment_id: number;
  employee_id: number;
  customer_user_id: number;
  service_id: number;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface DraftBooking {
  id: number;
  customer_user_id: number;
  data: string; // JSON string of incomplete booking data
  created_at: Date;
  updated_at: Date;
}

export interface LaserSettings {
  id: number;
  treatment_note_id: number;
  body_area: string;
  fluence: number;
  pulse_width: number;
  frequency_hz: number;
  spot_size_mm: number;
  passes: number;
  skin_reaction: string | null;
}

// ─── Resource Models ──────────────────────────────────────────────────────────────

export interface Resource {
  id: number;
  location_id: number;
  name: string;
  type: 'room' | 'laser_machine' | 'equipment';
  description: string | null;
  is_active: boolean;
}

// ─── CMS Models ───────────────────────────────────────────────────────────────────

export interface CmsContent {
  id: number;
  key: string;
  type: 'text' | 'html' | 'image_url' | 'json';
  value: string;
  label: string;
  updated_by: number;
  updated_at: Date;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function errorResponse(message: string, errors?: Record<string, string[]>): ApiResponse {
  return { success: false, message, errors };
}

export function paginatedResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number
): ApiResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
