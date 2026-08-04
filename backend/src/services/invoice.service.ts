import { executeQuery, executeQueryOne } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export interface InvoiceLineItem {
  name: string;
  quantity: number;
  unit_price_jmd: number;
  duration_minutes: number | null;
  line_total_jmd: number;
}

export interface AppointmentInvoice {
  invoice_number: string;
  issued_at: string;
  appointment: {
    id: number;
    confirmation_code: string | null;
    scheduled_date: string;
    start_time: string;
    end_time: string | null;
    status: string;
    payment_status: string;
    booking_source: string | null;
    notes: string | null;
    total_amount_jmd: number;
  };
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
  location: {
    id: number | null;
    name: string;
    address: string | null;
  };
  employee_name: string | null;
  line_items: InvoiceLineItem[];
  subtotal_jmd: number;
  total_jmd: number;
  payment: {
    status: string;
    method: string | null;
    amount_jmd: number | null;
    paid_at: string | null;
    transaction_id: number | null;
  };
  clinic: {
    name: string;
    phone: string;
    email: string;
  };
}

export class InvoiceService {
  async getAppointmentInvoice(appointmentId: number): Promise<AppointmentInvoice> {
    const appointment = await executeQueryOne<any>(
      `SELECT a.*,
              u.id as customer_id, u.first_name, u.last_name, u.email, u.phone,
              l.id as loc_id, l.name as location_name, l.address as location_address,
              eu.first_name as employee_first_name, eu.last_name as employee_last_name
       FROM appointments a
       JOIN users u ON u.id = a.customer_user_id
       LEFT JOIN locations l ON l.id = a.location_id
       LEFT JOIN employees e ON e.id = a.employee_id
       LEFT JOIN users eu ON eu.id = e.user_id
       WHERE a.id = ?`,
      [appointmentId]
    );

    if (!appointment) {
      throw new AppError('Appointment not found.', 404);
    }

    let lineItems = await executeQuery<any>(
      `SELECT s.name, aps.price_jmd, aps.duration_minutes
       FROM appointment_services aps
       JOIN services s ON s.id = aps.service_id
       WHERE aps.appointment_id = ?
       ORDER BY aps.id ASC`,
      [appointmentId]
    );

    if (!lineItems.length && appointment.service_id) {
      const fallback = await executeQueryOne<any>(
        `SELECT name, price_jmd, duration_minutes FROM services WHERE id = ?`,
        [appointment.service_id]
      );
      if (fallback) {
        lineItems = [{
          name: fallback.name,
          price_jmd: appointment.total_amount_jmd ?? fallback.price_jmd,
          duration_minutes: fallback.duration_minutes,
        }];
      }
    }

    const mappedLines: InvoiceLineItem[] = lineItems.map((row: any) => {
      const unit = Number(row.price_jmd) || 0;
      return {
        name: row.name,
        quantity: 1,
        unit_price_jmd: unit,
        duration_minutes: row.duration_minutes ?? null,
        line_total_jmd: unit,
      };
    });

    const subtotal = mappedLines.reduce((sum, item) => sum + item.line_total_jmd, 0);
    const total = Number(appointment.total_amount_jmd) || subtotal;

    const txn = await executeQueryOne<any>(
      `SELECT id, amount_jmd, payment_method, status, created_at
       FROM transactions
       WHERE appointment_id = ? AND status = 'completed'
       ORDER BY created_at DESC
       LIMIT 1`,
      [appointmentId]
    );

    const datePart = String(appointment.scheduled_date || '').slice(0, 10).replace(/-/g, '');
    const invoiceNumber = `INV-${datePart || 'NA'}-${String(appointment.id).padStart(5, '0')}`;

    const employeeName = appointment.employee_first_name
      ? `${appointment.employee_first_name} ${appointment.employee_last_name || ''}`.trim()
      : null;

    return {
      invoice_number: invoiceNumber,
      issued_at: new Date().toISOString(),
      appointment: {
        id: appointment.id,
        confirmation_code: appointment.confirmation_code || null,
        scheduled_date: appointment.scheduled_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time || null,
        status: appointment.status,
        payment_status: appointment.payment_status,
        booking_source: appointment.booking_source || null,
        notes: appointment.notes || null,
        total_amount_jmd: total,
      },
      customer: {
        id: appointment.customer_id,
        first_name: appointment.first_name,
        last_name: appointment.last_name,
        email: appointment.email || null,
        phone: appointment.phone || null,
      },
      location: {
        id: appointment.loc_id || null,
        name: appointment.location_name || 'HHC Laser Clinic',
        address: appointment.location_address || null,
      },
      employee_name: employeeName,
      line_items: mappedLines,
      subtotal_jmd: subtotal,
      total_jmd: total,
      payment: {
        status: appointment.payment_status,
        method: txn?.payment_method || null,
        amount_jmd: txn ? Number(txn.amount_jmd) : null,
        paid_at: txn?.created_at || null,
        transaction_id: txn?.id || null,
      },
      clinic: {
        name: 'HHC Laser',
        phone: '(876) 319-6241',
        email: 'info@hhclaser.com',
      },
    };
  }
}

export const invoiceService = new InvoiceService();
