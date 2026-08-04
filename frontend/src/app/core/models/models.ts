// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'manager' | 'specialist' | 'customer' | 'developer' | 'staff';

export type AppointmentStatus =
  | 'pending' | 'confirmed' | 'checked_in' | 'in_treatment'
  | 'completed' | 'cancelled' | 'no_show';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type BookingType = 'self' | 'other' | 'group';

export type FitzpatrickType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  roles: UserRole[];
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  parish: string;
  phone: string;
  email: string;
  google_maps_url?: string;
  whatsapp_number?: string;
  is_active: boolean;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url?: string;
  sort_order: number;
}

export interface Service {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price_jmd: number;
  duration_minutes: number;
  thumbnail_url?: string;
  gallery_images?: string | Array<string | {
    id?: number;
    image_url?: string;
    video_url?: string | null;
    media_type?: string;
    url?: string;
    caption?: string | null;
    sort_order?: number;
  }>;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}



// ─── Employees ────────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  user_id: number;
  full_name: string;
  title?: string;
  bio?: string;
  specializations?: string;
  profile_photo_url?: string;
  location_name: string;
  location_id: number;
  is_accepting_clients: boolean;
}

export interface EmployeeSchedule {
  id: number;
  employee_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// ─── Appointments / Bookings ──────────────────────────────────────────────────

export interface Appointment {
  id: number;
  booking_type: BookingType;
  customer_user_id: number;
  employee_id: number;
  employee_name: string;
  location_id: number;
  location_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  services: string;
  notes?: string;
  total_amount_jmd: number;
  deposit_paid_jmd: number;
  created_at: string;
  confirmation_code?: string;
  payment_status?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface BookingGuest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

export interface CreateBookingDto {
  booking_type: BookingType;
  employee_id: number;
  location_id: number;
  scheduled_date: string;
  start_time: string;
  service_ids: number[];
  notes?: string;
  booked_for_user_id?: number;
  group_guests?: BookingGuest[];
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  appointment_id?: number;
  idempotency_key: string;
  amount_jmd: number;
  currency: string;
  status: PaymentStatus;
  fiserv_approval_code?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentSession {
  transactionId: number;
  idempotencyKey: string;
  redirectUrl: string;
  formFields: Record<string, string>;
}

// ─── Memberships ─────────────────────────────────────────────────────────────

export interface MembershipPlan {
  id: number;
  name: string;
  plan_type: 'monthly' | 'annual';
  price_jmd: number;
  sessions_per_cycle: number;
  services_included: string;
  description: string;
}

export interface CustomerMembership {
  id: number;
  plan_name: string;
  plan_type: string;
  price_jmd: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  sessions_remaining: number;
  auto_renew: boolean;
}

// ─── Medical ──────────────────────────────────────────────────────────────────

export interface IntakeForm {
  fitzpatrick_type?: FitzpatrickType;
  skin_conditions?: string;
  allergies?: string;
  medications?: string;
  contraindications?: string;
  previous_treatments?: string;
  pregnancy_status: boolean;
  pacemaker_status: boolean;
  keloid_history: boolean;
  sun_exposure_recent: boolean;
  additional_notes?: string;
}

export interface TreatmentNote {
  id: number;
  appointment_id: number;
  service_name: string;
  specialist_name: string;
  notes: string;
  fluence?: number;
  pulse_width?: number;
  frequency_hz?: number;
  spot_size_mm?: number;
  body_area?: string;
  created_at: string;
}

// ─── CMS / Public ─────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: number;
  image_url: string;
  alt_text: string;
  category?: string;
  is_featured: boolean;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  rating: number;
  content: string;
  service_name?: string;
  photo_url?: string;
  is_featured: boolean;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount_pct?: number;
  discount_jmd?: number;
  start_date: string;
  end_date: string;
  image_url?: string;
  promo_code?: string;
}

// ─── API Response Wrapper ────────────────────────────────────────────────────

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

// ─── Admin Analytics ─────────────────────────────────────────────────────────

export interface DashboardStats {
  revenue: { today: number; month: number };
  appointments: { today: number };
  customers: { total: number };
  noShowRate: number;
  popularServices: { name: string; bookings: number }[];
  revenueByDay: { date: string; revenue: number }[];
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description?: string;
  price_jmd: number;
  stock_quantity: number;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Booking Drafts ────────────────────────────────────────────────────────────

export type BookingStep = 'service' | 'location' | 'type' | 'datetime' | 'details' | 'payment' | 'confirmation';

export interface BookingDraft {
  id: number;
  user_id: number;
  location_id: number | null;
  employee_id: number | null;
  service_ids: number[];
  scheduled_date: string | null;
  start_time: string | null;
  customer_info: Record<string, any> | null;
  current_step: BookingStep;
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
  current_step?: BookingStep;
}

