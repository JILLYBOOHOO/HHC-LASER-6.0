import { executeQuery, executeQueryOne, executeUpdate, withTransaction } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Appointment, CreateAppointmentDto, AppointmentStatus, Service } from '../models/types';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export class BookingService {

  /**
   * Checks availability for a given employee/resource/time slot.
   * Returns true if the slot is free.
   */
  async checkAvailability(params: {
    employeeId: number;
    locationId: number;
    date: string;
    startTime: string;
    endTime: string;
    excludeAppointmentId?: number;
    isAdmin?: boolean;
  }): Promise<{ available: boolean; conflicts: string[] }> {
    const { employeeId, locationId, date, startTime, endTime, excludeAppointmentId, isAdmin } = params;
    const conflicts: string[] = [];

    // 1. Check if date is blocked globally
    const isBlocked = await executeQueryOne(
      'SELECT id FROM blocked_dates WHERE blocked_date = ?',
      [date]
    );
    if (isBlocked) {
      conflicts.push('The selected date is blocked/unavailable.');
      return { available: false, conflicts };
    }

    // 2. Check if date is a holiday for this location
    const isHoliday = await executeQueryOne(
      'SELECT id FROM location_holidays WHERE location_id = ? AND holiday_date = ?',
      [locationId, date]
    );
    if (isHoliday) {
      conflicts.push('The selected date is a holiday.');
      return { available: false, conflicts };
    }

    if (!isAdmin) {
      // 3. Check if business is closed on this day of week
      const [year, month, day] = date.split('-').map(Number);
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const bizHours = await executeQueryOne<{ is_closed: boolean }>(
        'SELECT is_closed FROM business_hours WHERE location_id = ? AND day_of_week = ?',
        [locationId, dayOfWeek]
      );
      if (bizHours && bizHours.is_closed) {
        conflicts.push('The business is closed on this day of the week.');
        return { available: false, conflicts };
      }

      // 4. Check if employee is scheduled/working on this day of week
      const schedule = await executeQueryOne<{ start_time: string; end_time: string; is_available: boolean }>(
        `SELECT start_time, end_time, is_available FROM employee_schedules
         WHERE employee_id = ? AND location_id = ? AND day_of_week = ?`,
        [employeeId, locationId, dayOfWeek]
      );
      if (!schedule || !schedule.is_available) {
        conflicts.push('The specialist is not working on this day.');
        return { available: false, conflicts };
      }

      // 5. Check if the start/end times fall within the specialist's working hours
      const slotStartStr = startTime.slice(0, 5);
      const slotEndStr = endTime.slice(0, 5);
      const workStartStr = schedule.start_time.slice(0, 5);
      const workEndStr = schedule.end_time.slice(0, 5);
      if (slotStartStr < workStartStr || slotEndStr > workEndStr) {
        conflicts.push('The selected time falls outside of the specialist\'s working hours.');
        return { available: false, conflicts };
      }
    }

    // 6. Check employee conflicts with existing appointments
    const employeeConflict = await executeQueryOne<Appointment>(
      `SELECT id FROM appointments 
       WHERE employee_id = ? AND scheduled_date = ? 
       AND status NOT IN ('cancelled', 'no_show', 'pending')
       AND start_time < ? AND end_time > ?
       ${excludeAppointmentId ? 'AND id != ?' : ''}`,
      excludeAppointmentId
        ? [employeeId, date, endTime, startTime, excludeAppointmentId]
        : [employeeId, date, endTime, startTime]
    );

    if (employeeConflict) {
      conflicts.push('The selected specialist is not available at this time.');
    }

    return { available: conflicts.length === 0, conflicts };
  }

  /**
   * Calculates total duration and price for a set of service IDs.
   */
  async calculateServiceTotals(serviceIds: number[]): Promise<{ totalDurationMinutes: number; totalAmountJmd: number; services: Service[] }> {
    if (!serviceIds.length) throw new AppError('At least one service must be selected.', 400);

    const placeholders = serviceIds.map(() => '?').join(',');
    const services = await executeQuery<Service>(
      `SELECT * FROM services WHERE id IN (${placeholders}) AND is_active = true`,
      serviceIds
    );

    if (services.length !== serviceIds.length) {
      throw new AppError('One or more selected services are invalid or no longer available.', 400);
    }

    const totalDurationMinutes = services.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalAmountJmd = services.reduce((sum, s) => sum + Number(s.price_jmd), 0);

    return { totalDurationMinutes, totalAmountJmd, services };
  }

  /**
   * Calculates end time from start time and duration.
   */
  private addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const endH = Math.floor(total / 60).toString().padStart(2, '0');
    const endM = (total % 60).toString().padStart(2, '0');
    return `${endH}:${endM}:00`;
  }

  async createAppointment(customerId: number, dto: CreateAppointmentDto): Promise<Appointment> {
    const { totalDurationMinutes, totalAmountJmd, services } = await this.calculateServiceTotals(dto.service_ids);

    const endTime = this.addMinutes(dto.start_time, totalDurationMinutes);

    // Check availability
    const { available, conflicts } = await this.checkAvailability({
      employeeId: dto.employee_id,
      locationId: dto.location_id,
      date: dto.scheduled_date,
      startTime: dto.start_time,
      endTime,
    });

    if (!available) {
      throw new AppError(`Booking conflict: ${conflicts.join(' ')}`, 409);
    }

    const groupId = dto.booking_type === 'group' ? uuidv4() : null;
    const confirmationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    return withTransaction(async (conn) => {
      const mainServiceId = dto.service_ids[0];
      const [apptResult] = await conn.execute(
        `INSERT INTO appointments 
         (booking_type, group_id, customer_user_id, booked_for_user_id, employee_id, location_id, 
          scheduled_date, start_time, end_time, status, notes, confirmation_code, total_amount_jmd, deposit_paid_jmd, service_id, booking_source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, 0, ?, ?)`,
        [
          dto.booking_type,
          groupId,
          customerId,
          dto.booked_for_user_id || customerId,
          dto.employee_id,
          dto.location_id,
          dto.scheduled_date,
          dto.start_time,
          endTime,
          dto.notes || null,
          confirmationCode,
          totalAmountJmd,
          mainServiceId,
          dto.booking_source || 'website'
        ]
      ) as any;

      const appointmentId = apptResult.insertId;

      // Insert appointment services
      for (const service of services) {
        await conn.execute(
          `INSERT INTO appointment_services (appointment_id, service_id, price_jmd, duration_minutes)
           VALUES (?, ?, ?, ?)`,
          [appointmentId, service.id, service.price_jmd, service.duration_minutes]
        );
      }

      // Log status
      await conn.execute(
        `INSERT INTO appointment_status_log (appointment_id, new_status, notes)
         VALUES (?, 'pending', 'Appointment created by customer')`,
        [appointmentId]
      );

      // Handle group bookings
      if (dto.booking_type === 'group' && dto.group_guests?.length) {
        for (const guest of dto.group_guests) {
          await conn.execute(
            `INSERT INTO appointment_guests (appointment_id, group_id, first_name, last_name, email, phone)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [appointmentId, groupId, guest.first_name, guest.last_name, guest.email || null, guest.phone || null]
          );
        }
      }

      const appointment = await executeQueryOne<Appointment>(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId]
      );

      logger.info(`[Booking] Appointment ${appointmentId} created for customer ${customerId}`);
      return appointment!;
    });
  }

  async createAdminAppointment(staffUserId: number, customerId: number, dto: CreateAppointmentDto & { payment_status?: any }): Promise<Appointment> {
    const { totalDurationMinutes, totalAmountJmd, services } = await this.calculateServiceTotals(dto.service_ids);
    const endTime = this.addMinutes(dto.start_time, totalDurationMinutes);

    // Check availability (admins bypass schedule constraints)
    const { available, conflicts } = await this.checkAvailability({
      employeeId: dto.employee_id,
      locationId: dto.location_id,
      date: dto.scheduled_date,
      startTime: dto.start_time,
      endTime,
      isAdmin: true,
    });

    if (!available) {
      throw new AppError(`Booking conflict: ${conflicts.join(' ')}`, 409);
    }

    const groupId = dto.booking_type === 'group' ? uuidv4() : null;
    const confirmationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    return withTransaction(async (conn) => {
      const mainServiceId = dto.service_ids[0];
      const initialStatus = 'pending';
      const [apptResult] = await conn.execute(
        `INSERT INTO appointments 
         (booking_type, group_id, customer_user_id, booked_for_user_id, employee_id, location_id, 
          scheduled_date, start_time, end_time, status, notes, confirmation_code, total_amount_jmd, deposit_paid_jmd, service_id, booking_source, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        [
          dto.booking_type,
          groupId,
          customerId,
          dto.booked_for_user_id || customerId,
          dto.employee_id,
          dto.location_id,
          dto.scheduled_date,
          dto.start_time,
          endTime,
          initialStatus,
          dto.notes || null,
          confirmationCode,
          totalAmountJmd,
          mainServiceId,
          dto.booking_source || 'admin',
          dto.payment_status || 'pending_payment'
        ]
      ) as any;

      const appointmentId = apptResult.insertId;

      for (const service of services) {
        await conn.execute(
          `INSERT INTO appointment_services (appointment_id, service_id, price_jmd, duration_minutes)
           VALUES (?, ?, ?, ?)`,
          [appointmentId, service.id, service.price_jmd, service.duration_minutes]
        );
      }

      await conn.execute(
        `INSERT INTO appointment_status_log (appointment_id, new_status, changed_by_user_id, notes)
         VALUES (?, ?, ?, 'Appointment created by admin/staff')`,
        [appointmentId, initialStatus, staffUserId]
      );

      if (dto.booking_type === 'group' && dto.group_guests?.length) {
        for (const guest of dto.group_guests) {
          await conn.execute(
            `INSERT INTO appointment_guests (appointment_id, group_id, first_name, last_name, email, phone)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [appointmentId, groupId, guest.first_name, guest.last_name, guest.email || null, guest.phone || null]
          );
        }
      }

      const appointment = await executeQueryOne<Appointment>(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId]
      );

      logger.info(`[Booking] Appointment ${appointmentId} created by staff ${staffUserId} for customer ${customerId}`);
      return appointment!;
    });
  }

  async getAppointmentsByCustomer(customerId: number, page: number, limit: number): Promise<{ appointments: any[]; total: number }> {
    const offset = (page - 1) * limit;
    const countRow = await executeQueryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM appointments WHERE customer_user_id = ?',
      [customerId]
    );

    const appointments = await executeQuery(
      `SELECT a.*, 
              l.name as location_name,
              CONCAT(eu.first_name, ' ', eu.last_name) as employee_name,
              STRING_AGG(s.name, ', ') as services
       FROM appointments a
       JOIN locations l ON l.id = a.location_id
       JOIN employees e ON e.id = a.employee_id
       JOIN users eu ON eu.id = e.user_id
       JOIN appointment_services aps ON aps.appointment_id = a.id
       JOIN services s ON s.id = aps.service_id
       WHERE a.customer_user_id = ?
       GROUP BY a.id
       ORDER BY a.scheduled_date DESC, a.start_time DESC
       LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    );

    return { appointments, total: countRow?.count || 0 };
  }

  async getAppointmentById(appointmentId: number): Promise<any | null> {
    return executeQueryOne(
      `SELECT a.*,
              l.name as location_name,
              CONCAT(eu.first_name, ' ', eu.last_name) as employee_name,
              CONCAT(cu.first_name, ' ', cu.last_name) as customer_name,
              cu.email as customer_email,
              cu.phone as customer_phone,
              STRING_AGG(s.name, ', ') as services
       FROM appointments a
       JOIN users cu ON cu.id = a.customer_user_id
       JOIN locations l ON l.id = a.location_id
       JOIN employees e ON e.id = a.employee_id
       JOIN users eu ON eu.id = e.user_id
       JOIN appointment_services aps ON aps.appointment_id = a.id
       JOIN services s ON s.id = aps.service_id
       WHERE a.id = ?
       GROUP BY a.id`,
      [appointmentId]
    );
  }

  async getAppointmentsByEmployee(employeeId: number, date?: string): Promise<any[]> {
    return executeQuery(
      `SELECT a.*, 
              CONCAT(cu.first_name, ' ', cu.last_name) as customer_name,
              cu.email as customer_email,
              cu.phone as customer_phone,
              l.name as location_name,
              STRING_AGG(s.name, ', ') as services
       FROM appointments a
       JOIN users cu ON cu.id = a.customer_user_id
       JOIN locations l ON l.id = a.location_id
       JOIN appointment_services aps ON aps.appointment_id = a.id
       JOIN services s ON s.id = aps.service_id
       WHERE a.employee_id = ? ${date ? 'AND a.scheduled_date = ?' : ''}
       GROUP BY a.id
       ORDER BY a.scheduled_date ASC, a.start_time ASC`,
      date ? [employeeId, date] : [employeeId]
    );
  }

  async updateAppointmentStatus(appointmentId: number, newStatus: AppointmentStatus, updatedBy: number, notes?: string): Promise<void> {
    const appointment = await executeQueryOne<Appointment>(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );
    if (!appointment) throw new AppError('Appointment not found.', 404);

    const oldStatus = appointment.status;

    await withTransaction(async (conn) => {
      await conn.execute(
        'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, appointmentId]
      );

      await conn.execute(
        `INSERT INTO appointment_status_log (appointment_id, old_status, new_status, changed_by_user_id, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [appointmentId, oldStatus, newStatus, updatedBy, notes || null]
      );
    });

    logger.info(`[Booking] Appointment ${appointmentId} status: ${oldStatus} → ${newStatus} by user ${updatedBy}`);
  }

  async getAvailableSlots(params: {
    employeeId: number;
    locationId: number;
    date: string;
    durationMinutes: number;
  }): Promise<string[]> {
    const { employeeId, locationId, date, durationMinutes } = params;

    // 1. Check if date is blocked globally
    const isBlocked = await executeQueryOne(
      'SELECT id FROM blocked_dates WHERE blocked_date = ?',
      [date]
    );
    if (isBlocked) return [];

    // 2. Check if date is a holiday for this location
    const isHoliday = await executeQueryOne(
      'SELECT id FROM location_holidays WHERE location_id = ? AND holiday_date = ?',
      [locationId, date]
    );
    if (isHoliday) return [];

    // 3. Check if business is closed on this day of week
    const [year, month, day] = date.split('-').map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const bizHours = await executeQueryOne<{ is_closed: boolean }>(
      'SELECT is_closed FROM business_hours WHERE location_id = ? AND day_of_week = ?',
      [locationId, dayOfWeek]
    );
    if (bizHours && bizHours.is_closed) return [];

    // Get employee schedule for this day
    const schedule = await executeQueryOne<{ start_time: string; end_time: string; is_available: boolean }>(
      `SELECT start_time, end_time, is_available FROM employee_schedules
       WHERE employee_id = ? AND location_id = ? AND day_of_week = ?`,
      [employeeId, locationId, dayOfWeek]
    );

    if (!schedule || !schedule.is_available) return [];

    // Get existing appointments
    const booked = await executeQuery<{ start_time: string; end_time: string }>(
      `SELECT start_time, end_time FROM appointments
       WHERE employee_id = ? AND scheduled_date = ? AND status NOT IN ('cancelled', 'no_show')`,
      [employeeId, date]
    );

    // Generate 30-min slot intervals
    const slots: string[] = [];
    let [sh, sm] = schedule.start_time.split(':').map(Number);
    const [eh, em] = schedule.end_time.split(':').map(Number);
    const endMinutes = eh * 60 + em;

    while (sh * 60 + sm + durationMinutes <= endMinutes) {
      const slotStart = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
      const slotEnd = this.addMinutes(slotStart, durationMinutes);

      const conflict = booked.some(b => {
        const bs = b.start_time.slice(0, 5);
        const be = b.end_time.slice(0, 5);
        return slotStart < be && slotEnd > bs;
      });

      if (!conflict) slots.push(slotStart);

      sm += 30;
      if (sm >= 60) { sh++; sm -= 60; }
    }

    return slots;
  }

  async getAvailableDates(params: {
    employeeId: number;
    locationId: number;
    serviceId: number;
    year: number;
    month: number;
  }): Promise<string[]> {
    const { employeeId, locationId, serviceId, year, month } = params;

    // Get service duration
    const service = await executeQueryOne<{ duration_minutes: number }>(
      'SELECT duration_minutes FROM services WHERE id = ?',
      [serviceId]
    );
    const duration = service ? service.duration_minutes : 60;

    const totalDays = new Date(year, month, 0).getDate();
    const availableDates: string[] = [];

    const promises = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const pad = (n: number) => n < 10 ? '0' + n : n;
      const dateStr = `${year}-${pad(month)}-${pad(dayNum)}`;

      // Only allow today and future dates
      const todayStr = new Date().toISOString().slice(0, 10);
      if (dateStr < todayStr) return Promise.resolve();

      return this.getAvailableSlots({
        employeeId,
        locationId,
        date: dateStr,
        durationMinutes: duration
      }).then(slots => {
        if (slots.length > 0) {
          availableDates.push(dateStr);
        }
      });
    });

    await Promise.all(promises);
    return availableDates.sort();
  }

  async rescheduleAppointment(appointmentId: number, newDate: string, newTime: string, userId: number): Promise<void> {
    const appointments = await executeQuery('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (!appointments.length) throw new AppError('Appointment not found', 404);
    
    const appointment = appointments[0];
    
    // Check if the slot is available (simplified for now, assumes frontend validation)
    await executeUpdate(
      'UPDATE appointments SET scheduled_date = ?, start_time = ?, updated_at = NOW() WHERE id = ?',
      [newDate, newTime, appointmentId]
    );
    
    // Fire notification (optional but recommended)
    try {
      await notificationService.sendAppointmentRescheduled(appointment.customer_user_id, {
        treatmentName: 'Laser Treatment',
        oldDate: appointment.scheduled_date,
        oldTime: appointment.start_time,
        newDate: newDate,
        newTime: newTime,
        location: 'Main Clinic',
        confirmationCode: appointment.confirmation_code || 'HHC-RESCHED'
      });
    } catch (e) {
      // Ignore notification failures
    }
  }

  async getBlockedDates(): Promise<any[]> {
    return executeQuery('SELECT * FROM blocked_dates ORDER BY blocked_date ASC');
  }

  async addBlockedDate(blockedDate: string, reason: string): Promise<void> {
    await executeUpdate(
      'INSERT INTO blocked_dates (blocked_date, reason) VALUES (?, ?) ON CONFLICT (blocked_date) DO UPDATE SET reason = EXCLUDED.reason',
      [blockedDate, reason]
    );
  }

  async deleteBlockedDate(blockedDate: string): Promise<void> {
    await executeUpdate('DELETE FROM blocked_dates WHERE blocked_date = ?', [blockedDate]);
  }

  async getBusinessHours(locationId: number): Promise<any[]> {
    return executeQuery('SELECT * FROM business_hours WHERE location_id = ? ORDER BY day_of_week ASC', [locationId]);
  }

  async updateBusinessHours(locationId: number, dayOfWeek: number, openTime: string, closeTime: string, isClosed: boolean): Promise<void> {
    await executeUpdate(
      `INSERT INTO business_hours (location_id, day_of_week, open_time, close_time, is_closed) 
       VALUES (?, ?, ?, ?, ?) 
       ON CONFLICT (location_id, day_of_week) DO UPDATE SET open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_closed = EXCLUDED.is_closed`,
      [locationId, dayOfWeek, openTime, closeTime, isClosed ? 1 : 0]
    );
  }
}

export const bookingService = new BookingService();
