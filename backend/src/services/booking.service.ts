import { executeQuery, executeQueryOne, executeUpdate, withTransaction } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Appointment, CreateAppointmentDto, AppointmentStatus, Service } from '../models/types';
import { logger } from '../utils/logger';
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
  }): Promise<{ available: boolean; conflicts: string[] }> {
    const { employeeId, locationId, date, startTime, endTime, excludeAppointmentId } = params;
    const conflicts: string[] = [];

    // Check employee conflicts
    const employeeConflict = await executeQueryOne<Appointment>(
      `SELECT id FROM appointments 
       WHERE employee_id = ? AND scheduled_date = ? 
       AND status NOT IN ('cancelled', 'no_show')
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
      `SELECT * FROM services WHERE id IN (${placeholders}) AND is_active = 1`,
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
      const [apptResult] = await conn.execute(
        `INSERT INTO appointments 
         (booking_type, group_id, customer_user_id, booked_for_user_id, employee_id, location_id, 
          scheduled_date, start_time, end_time, status, notes, confirmation_code, total_amount_jmd, deposit_paid_jmd)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, 0)`,
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
              GROUP_CONCAT(s.name SEPARATOR ', ') as services
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

  async getAppointmentsByEmployee(employeeId: number, date?: string): Promise<any[]> {
    return executeQuery(
      `SELECT a.*, 
              CONCAT(cu.first_name, ' ', cu.last_name) as customer_name,
              cu.email as customer_email,
              cu.phone as customer_phone,
              l.name as location_name,
              GROUP_CONCAT(s.name SEPARATOR ', ') as services
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

    // Get employee schedule for this day
    const dayOfWeek = new Date(date).getDay();
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
}

export const bookingService = new BookingService();
