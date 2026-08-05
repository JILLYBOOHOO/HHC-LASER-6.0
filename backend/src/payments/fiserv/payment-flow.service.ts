import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeQueryOne, executeUpdate, withTransaction } from '../../config/database';
import { generateIdempotencyKey } from './fiserv.crypto';
import { FiservPaymentSession, fiservClient } from './fiserv.client';
import { Transaction, TransactionPaymentStatus } from '../../models/types';
import { logger } from '../../utils/logger';
import { notificationService } from '../../services/notification.service';
import { env } from '../../config/env';

export interface InitiatePaymentDto {
  appointmentId?: number;
  amountJmd: number;
  customerId: number;
  description: string;
}

export class PaymentFlowService {
  /**
   * Initiates a payment session, stores the pending transaction, and builds Fiserv form fields.
   */
  public async initiatePayment(dto: InitiatePaymentDto): Promise<FiservPaymentSession> {
    const idempotencyKey = generateIdempotencyKey();
    
    // Build the Fiserv session
    const session = fiservClient.buildPaymentSession(idempotencyKey, dto.amountJmd, dto.description);

    // Store pending transaction record securely
    const result = await executeUpdate(
      `INSERT INTO transactions (appointment_id, customer_user_id, idempotency_key, amount_jmd, currency, status, notes)
       VALUES (?, ?, ?, ?, 'JMD', 'pending', ?)`,
      [dto.appointmentId || null, dto.customerId, idempotencyKey, dto.amountJmd, dto.description]
    );

    logger.info(`[Fiserv] Initiated transaction ${idempotencyKey} for customer ${dto.customerId}`);

    return session;
  }

  /**
   * Processes the validated Fiserv callback.
   * Handles strict database FOR UPDATE locks to prevent duplicates.
   */
  public async processValidatedCallback(
    idempotencyKey: string, 
    statusStr: string, 
    storename?: string,
    chargetotal?: string,
    currency?: string,
    approvalCode?: string, 
    responseCode?: string,
    responseMessage?: string
  ): Promise<void> {
    let transaction: Transaction | undefined;
    const paymentStatus: TransactionPaymentStatus = statusStr === 'APPROVED' ? 'completed' : 'failed';

    await withTransaction(async (conn) => {
      // FOR UPDATE lock to prevent race conditions during duplicate webhooks
      const [rows] = await conn.execute(
        'SELECT * FROM transactions WHERE idempotency_key = ? FOR UPDATE',
        [idempotencyKey]
      );
      
      transaction = (rows as any[])[0] as Transaction;
      
      if (!transaction) {
        logger.warn(`[Fiserv] Callback received for unknown transaction: ${idempotencyKey}`);
        return;
      }

      if (transaction.status !== 'pending') {
        logger.info(`[Fiserv] Duplicate callback ignored for ${idempotencyKey}`);
        transaction = undefined;
        return;
      }

      // Security validations
      if (storename && storename !== env.FISERV_STORE_ID) {
         logger.error(`[Fiserv] Store ID mismatch for ${idempotencyKey}. Expected ${env.FISERV_STORE_ID}, got ${storename}`);
         transaction = undefined;
         return;
      }

      if (chargetotal && parseFloat(chargetotal) !== parseFloat(transaction.amount_jmd.toString())) {
         logger.error(`[Fiserv] Amount mismatch for ${idempotencyKey}. Expected ${transaction.amount_jmd}, got ${chargetotal}`);
         transaction = undefined;
         return;
      }

      // Gateway sends ISO numeric 388; DB stores 'JMD'. Reject USD (840).
      if (currency) {
        const normalized = String(currency).trim().toUpperCase();
        if (normalized !== '388' && normalized !== 'JMD') {
          logger.error(`[Fiserv] Currency mismatch for ${idempotencyKey}. Expected JMD/388, got ${currency}`);
          transaction = undefined;
          return;
        }
      }

      // Update transaction status
      await conn.execute(
        `UPDATE transactions 
         SET status = ?, fiserv_txn_id = ?, fiserv_approval_code = ?, fiserv_response_code = ?, fiserv_response_message = ?, updated_at = NOW()
         WHERE idempotency_key = ?`,
        [paymentStatus, idempotencyKey, approvalCode || null, responseCode || null, responseMessage || null, idempotencyKey]
      );

      // If successful, confirm the associated appointment and record payment details
      if (paymentStatus === 'completed' && transaction.appointment_id) {
        const confirmationCode = 'HHC-' + uuidv4().split('-')[0].toUpperCase();
        
        await conn.execute(
          `UPDATE appointments 
           SET status = 'confirmed', 
               payment_status = 'paid_online', 
               transaction_id = ?, 
               payment_reference = ?, 
               amount_paid = ?, 
               payment_date = NOW(), 
               confirmation_code = ?, 
               updated_at = NOW() 
           WHERE id = ?`,
          [
            approvalCode || idempotencyKey,
            idempotencyKey,
            transaction.amount_jmd,
            confirmationCode,
            transaction.appointment_id
          ]
        );

        await conn.execute(
          `INSERT INTO appointment_status_log (appointment_id, old_status, new_status, changed_by_system, notes)
           VALUES (?, 'pending', 'confirmed', 1, 'Payment confirmed via Fiserv WebCheckout')`,
          [transaction.appointment_id]
        );
      } else if (paymentStatus === 'failed' && transaction.appointment_id) {
        await conn.execute(
          `UPDATE appointments 
           SET payment_status = 'failed', updated_at = NOW() 
           WHERE id = ?`,
          [transaction.appointment_id]
        );
      }
    });

    if (!transaction) return;

    // Send confirmation notification on success
    if (paymentStatus === 'completed' && transaction.appointment_id) {
      try {
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
            totalAmount: parseFloat(transaction.amount_jmd.toString()),
            appointmentId: transaction.appointment_id,
            confirmationCode: appointment.confirmation_code || 'N/A',
          });

          await notificationService.sendPaymentConfirmation(transaction.customer_user_id, {
            amount: parseFloat(transaction.amount_jmd.toString()),
            approvalCode: approvalCode || 'APPROVED',
            idempotencyKey: idempotencyKey,
            appointmentId: transaction.appointment_id
          });
        }
      } catch (err) {
        logger.error(`[Fiserv] Failed to send email for transaction ${idempotencyKey}`, err);
      }
    }
  }
}

export const paymentFlowService = new PaymentFlowService();
