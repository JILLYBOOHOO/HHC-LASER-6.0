import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Service,
  ServiceCategory,
  Employee,
  EmployeeSchedule,
  Location,
  Appointment,
  CreateBookingDto,
  MembershipPlan,
  CustomerMembership,
  Transaction,
  GalleryImage,
  Testimonial,
  Promotion,
  TreatmentNote,
  IntakeForm,
  DashboardStats,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── Services / Public & Admin ────────────────────────────────────────────────
  getServices(
    categoryId?: number,
    isFeatured?: boolean,
  ): Observable<ApiResponse<Service[]>> {
    let params = new HttpParams();
    if (categoryId) params = params.set('category_id', categoryId);
    if (isFeatured) params = params.set('is_featured', 'true');
    return this.http.get<ApiResponse<Service[]>>(`${this.base}/services`, {
      params,
    });
  }

  getServiceBySlug(slug: string): Observable<ApiResponse<Service>> {
    return this.http.get<ApiResponse<Service>>(`${this.base}/services/${slug}`);
  }

  createService(
    service: Partial<Service>,
  ): Observable<ApiResponse<{ id: number; message: string }>> {
    return this.http.post<ApiResponse<{ id: number; message: string }>>(
      `${this.base}/services`,
      service,
    );
  }

  updateService(
    id: number,
    service: Partial<Service>,
  ): Observable<ApiResponse<{ message: string }>> {
    return this.http.put<ApiResponse<{ message: string }>>(
      `${this.base}/services/${id}`,
      service,
    );
  }

  deleteService(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.base}/services/${id}`,
    );
  }

  getServiceCategories(): Observable<ApiResponse<ServiceCategory[]>> {
    return this.http.get<ApiResponse<ServiceCategory[]>>(
      `${this.base}/services/categories`,
    );
  }

  // ─── Employees ──────────────────────────────────────────────────────────────
  getEmployees(
    locationId?: number,
    serviceId?: number,
  ): Observable<ApiResponse<Employee[]>> {
    let params = new HttpParams();
    if (locationId) params = params.set('location_id', locationId);
    if (serviceId) params = params.set('service_id', serviceId);
    return this.http.get<ApiResponse<Employee[]>>(`${this.base}/employees`, {
      params,
    });
  }

  getEmployeeSchedule(
    employeeId: number,
  ): Observable<ApiResponse<EmployeeSchedule[]>> {
    return this.http.get<ApiResponse<EmployeeSchedule[]>>(
      `${this.base}/employees/${employeeId}/schedule`,
    );
  }

  getEmployeePhotos(employeeId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/employees/${employeeId}/photos`,
    );
  }

  getAvailableSlots(
    employeeId: number,
    locationId: number,
    date: string,
    duration: number,
  ): Observable<ApiResponse<string[]>> {
    const params = new HttpParams()
      .set('employee_id', employeeId)
      .set('location_id', locationId)
      .set('date', date)
      .set('duration_minutes', duration);
    return this.http.get<ApiResponse<string[]>>(
      `${this.base}/bookings/available-slots`,
      { params },
    );
  }

  // ─── Bookings ───────────────────────────────────────────────────────────────
  createBooking(
    dto: CreateBookingDto,
  ): Observable<ApiResponse<{ appointment: Appointment; payment: any }>> {
    return this.http.post<
      ApiResponse<{ appointment: Appointment; payment: any }>
    >(`${this.base}/bookings`, dto);
  }

  getMyBookings(page = 1, limit = 10): Observable<ApiResponse<Appointment[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.base}/bookings/my`,
      { params },
    );
  }

  getBookingById(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(
      `${this.base}/bookings/${id}`,
    );
  }

  getEmployeeBookings(
    employeeId: number,
    date?: string,
  ): Observable<ApiResponse<Appointment[]>> {
    const params = date ? new HttpParams().set('date', date) : undefined;
    return this.http.get<ApiResponse<Appointment[]>>(
      `${this.base}/bookings/employee/${employeeId}`,
      { params },
    );
  }

  updateBookingStatus(
    appointmentId: number,
    status: string,
    notes?: string,
  ): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.base}/bookings/${appointmentId}/status`,
      { status, notes },
    );
  }

  mockPayment(appointmentId: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.base}/bookings/${appointmentId}/mock-payment`,
      {},
    );
  }

  getAvailableDates(
    employeeId: number,
    locationId: number,
    serviceId: number,
    year: number,
    month: number,
  ): Observable<ApiResponse<string[]>> {
    const params = new HttpParams()
      .set('employee_id', employeeId)
      .set('location_id', locationId)
      .set('service_id', serviceId)
      .set('year', year)
      .set('month', month);
    return this.http.get<ApiResponse<string[]>>(
      `${this.base}/bookings/available-dates`,
      { params },
    );
  }

  // Admin Availability Management API calls
  getBlockedDates(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/bookings/admin/blocked-dates`,
    );
  }

  addBlockedDate(blockedDate: string, reason: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.base}/bookings/admin/blocked-dates`,
      { blocked_date: blockedDate, reason },
    );
  }

  deleteBlockedDate(blockedDate: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.base}/bookings/admin/blocked-dates/${blockedDate}`,
    );
  }

  getBusinessHours(locationId: number): Observable<ApiResponse<any[]>> {
    const params = new HttpParams().set('location_id', locationId);
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/bookings/admin/business-hours`,
      { params },
    );
  }

  updateBusinessHours(
    locationId: number,
    dayOfWeek: number,
    openTime: string,
    closeTime: string,
    isClosed: boolean,
  ): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.base}/bookings/admin/business-hours`,
      {
        location_id: locationId,
        day_of_week: dayOfWeek,
        open_time: openTime,
        close_time: closeTime,
        is_closed: isClosed,
      },
    );
  }

  // ─── Payments ───────────────────────────────────────────────────────────────
  createCheckoutSession(
    appointmentId: number,
  ): Observable<
    ApiResponse<{
      idempotencyKey: string;
      redirectUrl: string;
      formFields: Record<string, string>;
    }>
  > {
    return this.http.post<
      ApiResponse<{
        idempotencyKey: string;
        redirectUrl: string;
        formFields: Record<string, string>;
      }>
    >(`${this.base}/payments/create-checkout`, {
      appointment_id: appointmentId,
    });
  }

  /** Creates a Fiserv HPP session directly without requiring a DB appointment record. */
  createDirectCheckout(
    amountJmd: number,
    description: string,
    orderRef?: string,
  ): Observable<
    ApiResponse<{
      idempotencyKey: string;
      redirectUrl: string;
      formFields: Record<string, string>;
    }>
  > {
    return this.http.post<
      ApiResponse<{
        idempotencyKey: string;
        redirectUrl: string;
        formFields: Record<string, string>;
      }>
    >(`${this.base}/payments/create-direct-checkout`, {
      amount_jmd: amountJmd,
      description,
      order_ref: orderRef,
    });
  }

  getPaymentStatus(key: string): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(
      `${this.base}/payments/status/${key}`,
    );
  }

  getPaymentHistory(): Observable<
    ApiResponse<{ transactions: Transaction[] }>
  > {
    return this.http.get<ApiResponse<{ transactions: Transaction[] }>>(
      `${this.base}/payments/history`,
    );
  }

  // ─── Memberships ────────────────────────────────────────────────────────────
  getMembershipPlans(): Observable<ApiResponse<MembershipPlan[]>> {
    return this.http.get<ApiResponse<MembershipPlan[]>>(
      `${this.base}/memberships/plans`,
    );
  }

  getMyMemberships(): Observable<ApiResponse<CustomerMembership[]>> {
    return this.http.get<ApiResponse<CustomerMembership[]>>(
      `${this.base}/memberships/my`,
    );
  }

  subscribeMembership(
    planId: number,
    autoRenew = true,
  ): Observable<ApiResponse<{ membershipId: number }>> {
    return this.http.post<ApiResponse<{ membershipId: number }>>(
      `${this.base}/memberships/subscribe`,
      {
        plan_id: planId,
        auto_renew: autoRenew,
      },
    );
  }

  cancelMembership(membershipId: number): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.base}/memberships/${membershipId}/cancel`,
      {},
    );
  }

  // ─── Medical ─────────────────────────────────────────────────────────────────
  getIntakeForm(userId: number): Observable<ApiResponse<IntakeForm>> {
    return this.http.get<ApiResponse<IntakeForm>>(
      `${this.base}/medical/${userId}/intake`,
    );
  }

  submitIntakeForm(
    userId: number,
    form: IntakeForm,
  ): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(
      `${this.base}/medical/${userId}/intake`,
      form,
    );
  }

  getTreatmentHistory(
    userId: number,
  ): Observable<ApiResponse<TreatmentNote[]>> {
    return this.http.get<ApiResponse<TreatmentNote[]>>(
      `${this.base}/medical/${userId}/treatment-history`,
    );
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(
      `${this.base}/admin/dashboard`,
    );
  }

  getAdminCustomers(
    page = 1,
    limit = 20,
    search?: string,
  ): Observable<ApiResponse<any[]>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<any[]>>(`${this.base}/admin/customers`, {
      params,
    });
  }

  getAdminUsers(
    page = 1,
    limit = 20,
    search?: string,
  ): Observable<ApiResponse<any[]>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<any[]>>(`${this.base}/admin/users`, {
      params,
    });
  }

  getAdminTransactions(
    page = 1,
    limit = 20,
    search?: string,
    status?: string,
    from?: string,
    to?: string
  ): Observable<ApiResponse<any[]>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    
    return this.http.get<ApiResponse<any[]>>(`${this.base}/admin/transactions`, {
      params,
    });
  }

  updateUserStatus(userId: number, isActive: boolean): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(
      `${this.base}/admin/users/${userId}/status`,
      { is_active: isActive },
    );
  }

  assignUserRole(userId: number, role: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.base}/admin/users/${userId}/roles`,
      { role },
    );
  }

  getRevenueReport(
    from?: string,
    to?: string,
    locationId?: number,
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (locationId) params = params.set('location_id', locationId);
    return this.http.get<ApiResponse<any>>(
      `${this.base}/admin/reports/revenue`,
      { params },
    );
  }
}
