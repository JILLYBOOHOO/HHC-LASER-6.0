"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentFlowService = exports.PaymentFlowService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../../config/database");
const fiserv_crypto_1 = require("./fiserv.crypto");
const fiserv_client_1 = require("./fiserv.client");
const logger_1 = require("../../utils/logger");
const notification_service_1 = require("../../services/notification.service");
const env_1 = require("../../config/env");
class PaymentFlowService {
    /**
     * Initiates a payment session, stores the pending transaction, and builds Fiserv form fields.
     */
    async initiatePayment(dto) {
        const idempotencyKey = (0, fiserv_crypto_1.generateIdempotencyKey)();
        // Build the Fiserv session
        const session = fiserv_client_1.fiservClient.buildPaymentSession(idempotencyKey, dto.amountJmd, dto.description);
        // Store pending transaction record securely
        const result = await (0, database_1.executeUpdate)(`INSERT INTO transactions (appointment_id, customer_user_id, idempotency_key, amount_jmd, currency, status, notes)
       VALUES (?, ?, ?, ?, 'JMD', 'pending', ?)`, [dto.appointmentId || null, dto.customerId, idempotencyKey, dto.amountJmd, dto.description]);
        logger_1.logger.info(`[Fiserv] Initiated transaction ${idempotencyKey} for customer ${dto.customerId}`);
        return session;
    }
    /**
     * Processes the validated Fiserv callback.
     * Handles strict database FOR UPDATE locks to prevent duplicates.
     */
    async processValidatedCallback(idempotencyKey, statusStr, storename, chargetotal, currency, approvalCode, responseCode, responseMessage) {
        let transaction;
        const paymentStatus = statusStr === 'APPROVED' ? 'completed' : 'failed';
        await (0, database_1.withTransaction)(async (conn) => {
            // FOR UPDATE lock to prevent race conditions during duplicate webhooks
            const [rows] = await conn.execute('SELECT * FROM transactions WHERE idempotency_key = ? FOR UPDATE', [idempotencyKey]);
            transaction = rows[0];
            if (!transaction) {
                logger_1.logger.warn(`[Fiserv] Callback received for unknown transaction: ${idempotencyKey}`);
                return;
            }
            if (transaction.status !== 'pending') {
                logger_1.logger.info(`[Fiserv] Duplicate callback ignored for ${idempotencyKey}`);
                transaction = undefined;
                return;
            }
            // Security validations
            if (storename && storename !== env_1.env.FISERV_STORE_ID) {
                logger_1.logger.error(`[Fiserv] Store ID mismatch for ${idempotencyKey}. Expected ${env_1.env.FISERV_STORE_ID}, got ${storename}`);
                transaction = undefined;
                return;
            }
            if (chargetotal && parseFloat(chargetotal) !== parseFloat(transaction.amount_jmd.toString())) {
                logger_1.logger.error(`[Fiserv] Amount mismatch for ${idempotencyKey}. Expected ${transaction.amount_jmd}, got ${chargetotal}`);
                transaction = undefined;
                return;
            }
            if (currency && currency !== transaction.currency && currency !== '840') {
                logger_1.logger.error(`[Fiserv] Currency mismatch for ${idempotencyKey}. Expected ${transaction.currency} or 840, got ${currency}`);
                transaction = undefined;
                return;
            }
            // Update transaction status
            await conn.execute(`UPDATE transactions 
         SET status = ?, fiserv_txn_id = ?, fiserv_approval_code = ?, fiserv_response_code = ?, fiserv_response_message = ?, updated_at = NOW()
         WHERE idempotency_key = ?`, [paymentStatus, idempotencyKey, approvalCode || null, responseCode || null, responseMessage || null, idempotencyKey]);
            // If successful, confirm the associated appointment and record payment details
            if (paymentStatus === 'completed' && transaction.appointment_id) {
                const confirmationCode = 'HHC-' + (0, uuid_1.v4)().split('-')[0].toUpperCase();
                await conn.execute(`UPDATE appointments 
           SET status = 'confirmed', 
               payment_status = 'paid', 
               transaction_id = ?, 
               payment_reference = ?, 
               amount_paid = ?, 
               payment_date = NOW(), 
               confirmation_code = ?, 
               updated_at = NOW() 
           WHERE id = ?`, [
                    approvalCode || idempotencyKey,
                    idempotencyKey,
                    transaction.amount_jmd,
                    confirmationCode,
                    transaction.appointment_id
                ]);
                await conn.execute(`INSERT INTO appointment_status_log (appointment_id, old_status, new_status, changed_by_system, notes)
           VALUES (?, 'pending', 'confirmed', 1, 'Payment confirmed via Fiserv WebCheckout')`, [transaction.appointment_id]);
            }
            else if (paymentStatus === 'failed' && transaction.appointment_id) {
                await conn.execute(`UPDATE appointments 
           SET payment_status = 'failed', updated_at = NOW() 
           WHERE id = ?`, [transaction.appointment_id]);
            }
        });
        if (!transaction)
            return;
        // Send confirmation notification on success
        if (paymentStatus === 'completed' && transaction.appointment_id) {
            try {
                const appointment = await (0, database_1.executeQueryOne)(`SELECT a.*, l.name as location_name, e.user_id as employee_user_id, u.first_name, u.last_name
           FROM appointments a
           LEFT JOIN locations l ON a.location_id = l.id
           LEFT JOIN employees e ON a.employee_id = e.id
           LEFT JOIN users u ON e.user_id = u.id
           WHERE a.id = ?`, [transaction.appointment_id]);
                const services = await (0, database_1.executeQuery)(`SELECT s.name FROM appointment_services as_s 
           JOIN services s ON as_s.service_id = s.id 
           WHERE as_s.appointment_id = ?`, [transaction.appointment_id]);
                if (appointment) {
                    await notification_service_1.notificationService.sendAppointmentConfirmation(transaction.customer_user_id, {
                        date: appointment.scheduled_date,
                        time: appointment.start_time,
                        services: services.map(s => s.name).join(', '),
                        location: appointment.location_name || 'HHC Laser Clinic',
                        employeeName: `${appointment.first_name || ''} ${appointment.last_name || ''}`.trim(),
                        totalAmount: parseFloat(transaction.amount_jmd.toString()),
                        appointmentId: transaction.appointment_id,
                        confirmationCode: appointment.confirmation_code || 'N/A',
                    });
                    await notification_service_1.notificationService.sendPaymentConfirmation(transaction.customer_user_id, {
                        amount: parseFloat(transaction.amount_jmd.toString()),
                        approvalCode: approvalCode || 'APPROVED',
                        idempotencyKey: idempotencyKey,
                        appointmentId: transaction.appointment_id
                    });
                }
            }
            catch (err) {
                logger_1.logger.error(`[Fiserv] Failed to send email for transaction ${idempotencyKey}`, err);
            }
        }
    }
}
exports.PaymentFlowService = PaymentFlowService;
exports.paymentFlowService = new PaymentFlowService();
//# sourceMappingURL=payment-flow.service.js.map