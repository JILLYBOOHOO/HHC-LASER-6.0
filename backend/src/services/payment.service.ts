import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeQueryOne, executeUpdate, withTransaction } from '../config/database';
import { generateFiservHmac, validateFiservCallback, getFiservTimestamp, generateIdempotencyKey } from '../utils/hmac';
import { AppError } from '../middleware/error.middleware';
import { Transaction, PaymentStatus } from '../models/types';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { notificationService } from './notification.service';

export interface InitiatePaymentDto {
  appointmentId?: number;
  membershipId?: number;
  packageId?: number;
  amountJmd: number;
  customerId: number;
  description: string;
}

export interface FiservPaymentSession {
  transactionId: number;
  idempotencyKey: string;
  redirectUrl: string;
  formFields: Record<string, string>;
}

export class PaymentService {
  /**
   * Initiates a Fiserv hosted payment session.
   * Returns the form fields needed to redirect the customer to the Fiserv payment page.
   */
  async initiatePayment(dto: InitiatePaymentDto): Promise<FiservPaymentSession> {
    const idempotencyKey = generateIdempotencyKey();
    const txnDatetime = getFiservTimestamp();
    const chargetotal = dto.amountJmd.toFixed(2);
    const currency = '388'; // JMD ISO 4217 code

    // Generate HMAC signature
    const hash = generateFiservHmac({
      storeId: env.FISERV_STORE_NAME,
      timestamp: txnDatetime,
      token: idempotencyKey,
      txnType: 'sale',
      chargetotal,
      currency,
    });

    // Store pending transaction record
    const result = await executeUpdate(
      `INSERT INTO transactions (appointment_id, customer_user_id, idempotency_key, amount_jmd, currency, status, notes)
       VALUES (?, ?, ?, ?, 'JMD', 'pending', ?)`,
      [dto.appointmentId || null, dto.customerId, idempotencyKey, dto.amountJmd, dto.description]
    );

    const transactionId = result.insertId;

    // Build Fiserv form fields
    const formFields: Record<string, string> = {
      storename: env.FISERV_STORE_NAME,
      txndatetime: txnDatetime,
      chargetotal,
      currency,
      hash_algorithm: 'HMACSHA256',
      hash,
      responseSuccessURL: env.FISERV_SUCCESS_URL,
      responseFailURL: env.FISERV_FAILURE_URL,
      transactionNotificationURL: env.FISERV_CALLBACK_URL,
      oid: idempotencyKey,
      mode: 'payonly',
      paymentMethod: 'M', // Card
      comments: `HHC LASER - ${dto.description}`,
    };

    logger.info(`[Payment] Initiated transaction ${idempotencyKey} for customer ${dto.customerId}, amount: JMD ${chargetotal}`);

    return {
      transactionId,
      idempotencyKey,
      redirectUrl: `${env.FISERV_BASE_URL}/connect/gateway/processing`,
      formFields,
    };
  }

  /**
   * Processes the Fiserv callback webhook.
   * Validates HMAC, updates transaction status, triggers notifications.
   */
  async processCallback(callbackData: Record<string, string>): Promise<void> {
    const {
      approval_code,
      chargetotal,
      currency,
      txndatetime,
      storename,
      response_hash,
      oid: idempotencyKey,
      status,
      response_code,
    } = callbackData;

    // Validate HMAC signature to prevent webhook forgery
    const isValid = validateFiservCallback({
      approval_code,
      chargetotal,
      currency,
      txndatetime,
      storename,
      response_hash,
    });

    if (!isValid) {
      logger.error(`[Payment] INVALID HMAC on callback for oid: ${idempotencyKey}`);
      throw new AppError('Invalid payment callback signature.', 400);
    }

    const transaction = await executeQueryOne<Transaction>(
      'SELECT * FROM transactions WHERE idempotency_key = ?',
      [idempotencyKey]
    );

    if (!transaction) {
      logger.warn(`[Payment] Callback received for unknown transaction: ${idempotencyKey}`);
      return;
    }

    // Idempotency — ignore if already processed
    if (transaction.status !== 'pending') {
      logger.info(`[Payment] Duplicate callback ignored for ${idempotencyKey}`);
      return;
    }

    const paymentStatus: PaymentStatus = status === 'APPROVED' ? 'completed' : 'failed';

    await withTransaction(async (conn) => {
      // Update transaction
      await conn.execute(
        `UPDATE transactions 
         SET status = ?, fiserv_txn_id = ?, fiserv_approval_code = ?, fiserv_response_code = ?, updated_at = NOW()
         WHERE idempotency_key = ?`,
        [paymentStatus, idempotencyKey, approval_code || null, response_code || null, idempotencyKey]
      );

      // If payment succeeded and linked to appointment, confirm it
      if (paymentStatus === 'completed' && transaction.appointment_id) {
        await conn.execute(
          `UPDATE appointments SET status = 'confirmed', updated_at = NOW() WHERE id = ?`,
          [transaction.appointment_id]
        );

        // Log status change
        await conn.execute(
          `INSERT INTO appointment_status_log (appointment_id, old_status, new_status, changed_by_system, notes)
           VALUES (?, 'pending', 'confirmed', 1, 'Payment confirmed via Fiserv')`,
          [transaction.appointment_id]
        );
      }
    });

    // Send confirmation notification
    if (paymentStatus === 'completed' && transaction.appointment_id) {
      const appointment = await executeQueryOne<any>(
        `SELECT a.*, l.name as location_name, e.user_id as employee_user_id, u.first_name, u.last_name
         FROM appointments a
         LEFT JOIN locations l ON a.location_id = l.id
         LEFT JOIN employees e ON a.employee_id = e.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE a.id = ?`,
        [transaction.appointment_id]
      );

      const services = await executeQuery<any>(
        `SELECT s.name FROM appointment_services as_s 
         JOIN services s ON as_s.service_id = s.id 
         WHERE as_s.appointment_id = ?`,
        [transaction.appointment_id]
      );

      if (appointment) {
        await notificationService.sendAppointmentConfirmation(transaction.customer_user_id, {
          date: appointment.scheduled_date,
          time: appointment.start_time,
          services: services.map(s => s.name).join(', '),
          location: appointment.location_name || 'HHC Laser Clinic',
          employeeName: `${appointment.first_name || ''} ${appointment.last_name || ''}`.trim(),
          totalAmount: parseFloat(chargetotal),
          appointmentId: transaction.appointment_id,
          confirmationCode: appointment.confirmation_code || 'N/A',
        });
      }
    }

    logger.info(`[Payment] Processed callback for ${idempotencyKey}: ${paymentStatus}`);
  }

  async getPaymentStatus(idempotencyKey: string, customerId: number): Promise<Transaction | null> {
    return executeQueryOne<Transaction>(
      'SELECT * FROM transactions WHERE idempotency_key = ? AND customer_user_id = ?',
      [idempotencyKey, customerId]
    );
  }

  async getCustomerTransactions(customerId: number, page: number, limit: number): Promise<{ transactions: Transaction[]; total: number }> {
    const offset = (page - 1) * limit;
    const transactions = await executeQueryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE customer_user_id = ?',
      [customerId]
    );
    const rows = await executeQueryOne<Transaction[]>(
      `SELECT t.*, a.scheduled_date, a.start_time 
       FROM transactions t
       LEFT JOIN appointments a ON a.id = t.appointment_id
       WHERE t.customer_user_id = ?
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    ) as any;

    return {
      transactions: rows || [],
      total: transactions?.count || 0,
    };
  }
}

export const paymentService = new PaymentService();
