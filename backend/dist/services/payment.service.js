"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const database_1 = require("../config/database");
const hmac_1 = require("../utils/hmac");
const error_middleware_1 = require("../middleware/error.middleware");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const notification_service_1 = require("./notification.service");
class PaymentService {
    /**
     * Initiates a Fiserv hosted payment session.
     * Returns the form fields needed to redirect the customer to the Fiserv payment page.
     */
    async initiatePayment(dto) {
        const idempotencyKey = (0, hmac_1.generateIdempotencyKey)();
        const txnDatetime = (0, hmac_1.getFiservTimestamp)();
        const chargetotal = dto.amountJmd.toFixed(2);
        const currency = '388'; // JMD ISO 4217 code
        const storeName = env_1.env.FISERV_STORE_NAME || env_1.env.FISERV_STORE_ID || '';
        if (!storeName) {
            throw new error_middleware_1.AppError('Fiserv store name is not configured.', 500);
        }
        // Generate HMAC signature
        const hash = (0, hmac_1.generateFiservHmac)({
            storeId: storeName,
            timestamp: txnDatetime,
            token: idempotencyKey,
            txnType: 'sale',
            chargetotal,
            currency,
        });
        // Store pending transaction record
        const result = await (0, database_1.executeUpdate)(`INSERT INTO transactions (appointment_id, customer_user_id, idempotency_key, amount_jmd, currency, status, notes)
       VALUES (?, ?, ?, ?, 'JMD', 'pending', ?)`, [dto.appointmentId || null, dto.customerId, idempotencyKey, dto.amountJmd, dto.description]);
        if (result.insertId == null) {
            throw new error_middleware_1.AppError('Failed to create payment transaction.', 500);
        }
        const transactionId = result.insertId;
        // Build Fiserv form fields
        const formFields = {
            storename: storeName,
            txndatetime: txnDatetime,
            chargetotal,
            currency,
            hash_algorithm: 'HMACSHA256',
            hash,
            responseSuccessURL: env_1.env.FISERV_SUCCESS_URL,
            responseFailURL: env_1.env.FISERV_FAILURE_URL,
            transactionNotificationURL: env_1.env.FISERV_CALLBACK_URL,
            oid: idempotencyKey,
            mode: 'payonly',
            paymentMethod: 'M', // Card
            comments: `HHC LASER - ${dto.description}`,
        };
        logger_1.logger.info(`[Payment] Initiated transaction ${idempotencyKey} for customer ${dto.customerId}, amount: JMD ${chargetotal}`);
        return {
            transactionId,
            idempotencyKey,
            redirectUrl: `${env_1.env.FISERV_BASE_URL}/connect/gateway/processing`,
            formFields,
        };
    }
    /**
     * Processes the Fiserv callback webhook.
     * Validates HMAC, updates transaction status, triggers notifications.
     */
    async processCallback(callbackData) {
        const { approval_code, chargetotal, currency, txndatetime, storename, response_hash, oid: idempotencyKey, status, response_code, } = callbackData;
        // Validate HMAC signature to prevent webhook forgery
        const isValid = (0, hmac_1.validateFiservCallback)({
            approval_code,
            chargetotal,
            currency,
            txndatetime,
            storename,
            response_hash,
        });
        if (!isValid) {
            logger_1.logger.error(`[Payment] INVALID HMAC on callback for oid: ${idempotencyKey}`);
            throw new error_middleware_1.AppError('Invalid payment callback signature.', 400);
        }
        const transaction = await (0, database_1.executeQueryOne)('SELECT * FROM transactions WHERE idempotency_key = ?', [idempotencyKey]);
        if (!transaction) {
            logger_1.logger.warn(`[Payment] Callback received for unknown transaction: ${idempotencyKey}`);
            return;
        }
        // Idempotency — ignore if already processed
        if (transaction.status !== 'pending') {
            logger_1.logger.info(`[Payment] Duplicate callback ignored for ${idempotencyKey}`);
            return;
        }
        const paymentStatus = status === 'APPROVED' ? 'completed' : 'failed';
        await (0, database_1.withTransaction)(async (conn) => {
            // Update transaction
            await conn.execute(`UPDATE transactions 
         SET status = ?, fiserv_txn_id = ?, fiserv_approval_code = ?, fiserv_response_code = ?, updated_at = NOW()
         WHERE idempotency_key = ?`, [paymentStatus, idempotencyKey, approval_code || null, response_code || null, idempotencyKey]);
            // If payment succeeded and linked to appointment, confirm it
            if (paymentStatus === 'completed' && transaction.appointment_id) {
                await conn.execute(`UPDATE appointments SET status = 'confirmed', updated_at = NOW() WHERE id = ?`, [transaction.appointment_id]);
                // Log status change
                await conn.execute(`INSERT INTO appointment_status_log (appointment_id, old_status, new_status, changed_by_system, notes)
           VALUES (?, 'pending', 'confirmed', 1, 'Payment confirmed via Fiserv')`, [transaction.appointment_id]);
            }
        });
        // Send confirmation notification
        if (paymentStatus === 'completed' && transaction.appointment_id) {
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
                    totalAmount: parseFloat(chargetotal),
                    appointmentId: transaction.appointment_id,
                    confirmationCode: appointment.confirmation_code || 'N/A',
                });
            }
        }
        logger_1.logger.info(`[Payment] Processed callback for ${idempotencyKey}: ${paymentStatus}`);
    }
    async getPaymentStatus(idempotencyKey, customerId) {
        return (0, database_1.executeQueryOne)('SELECT * FROM transactions WHERE idempotency_key = ? AND customer_user_id = ?', [idempotencyKey, customerId]);
    }
    async getCustomerTransactions(customerId, page, limit) {
        const offset = (page - 1) * limit;
        const transactions = await (0, database_1.executeQueryOne)('SELECT COUNT(*) as count FROM transactions WHERE customer_user_id = ?', [customerId]);
        const rows = await (0, database_1.executeQueryOne)(`SELECT t.*, a.scheduled_date, a.start_time 
       FROM transactions t
       LEFT JOIN appointments a ON a.id = t.appointment_id
       WHERE t.customer_user_id = ?
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`, [customerId, limit, offset]);
        return {
            transactions: rows || [],
            total: transactions?.count || 0,
        };
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=payment.service.js.map