import { Appointment, CreateAppointmentDto, AppointmentStatus, Service } from '../models/types';
export declare class BookingService {
    /**
     * Checks availability for a given employee/resource/time slot.
     * Returns true if the slot is free.
     */
    checkAvailability(params: {
        employeeId: number;
        locationId: number;
        date: string;
        startTime: string;
        endTime: string;
        excludeAppointmentId?: number;
        isAdmin?: boolean;
    }): Promise<{
        available: boolean;
        conflicts: string[];
    }>;
    /**
     * Calculates total duration and price for a set of service IDs.
     */
    calculateServiceTotals(serviceIds: number[]): Promise<{
        totalDurationMinutes: number;
        totalAmountJmd: number;
        services: Service[];
    }>;
    /**
     * Calculates end time from start time and duration.
     */
    private addMinutes;
    createAppointment(customerId: number, dto: CreateAppointmentDto): Promise<Appointment>;
    createAdminAppointment(staffUserId: number, customerId: number, dto: CreateAppointmentDto & {
        payment_status?: any;
    }): Promise<Appointment>;
    getAppointmentsByCustomer(customerId: number, page: number, limit: number): Promise<{
        appointments: any[];
        total: number;
    }>;
    getAppointmentById(appointmentId: number): Promise<any | null>;
    getAppointmentsByEmployee(employeeId: number, date?: string): Promise<any[]>;
    updateAppointmentStatus(appointmentId: number, newStatus: AppointmentStatus, updatedBy: number, notes?: string): Promise<void>;
    getAvailableSlots(params: {
        employeeId: number;
        locationId: number;
        date: string;
        durationMinutes: number;
    }): Promise<string[]>;
    getAvailableDates(params: {
        employeeId: number;
        locationId: number;
        serviceId: number;
        year: number;
        month: number;
    }): Promise<string[]>;
    rescheduleAppointment(appointmentId: number, newDate: string, newTime: string, userId: number): Promise<void>;
    getBlockedDates(): Promise<any[]>;
    addBlockedDate(blockedDate: string, reason: string): Promise<void>;
    deleteBlockedDate(blockedDate: string): Promise<void>;
    getBusinessHours(locationId: number): Promise<any[]>;
    updateBusinessHours(locationId: number, dayOfWeek: number, openTime: string, closeTime: string, isClosed: boolean): Promise<void>;
}
export declare const bookingService: BookingService;
//# sourceMappingURL=booking.service.d.ts.map