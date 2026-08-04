"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
class TransactionService {
    async updatePaymentStatus(idempotencyKey, status, fiservTxnId) {
        await (0, database_1.executeQuery)('UPDATE transactions SET status = ?, fiserv_txn_id = ? WHERE idempotency_key = ?', [status, fiservTxnId, idempotencyKey]);
    }
    async getPaymentStatus(key, userId) {
        if (userId) {
            return (0, database_1.executeQueryOne)('SELECT * FROM transactions WHERE idempotency_key = ? AND customer_user_id = ?', [key, userId]);
        }
        return (0, database_1.executeQueryOne)('SELECT * FROM transactions WHERE idempotency_key = ?', [key]);
    }
    async recordManualPayment(dto) {
        const idempotencyKey = (0, uuid_1.v4)();
        return (0, database_1.withTransaction)(async (conn) => {
            const [result] = await conn.execute(`INSERT INTO transactions 
         (appointment_id, customer_user_id, recorded_by_user_id, idempotency_key, amount_jmd, currency, status, payment_method, notes)
         VALUES (?, ?, ?, ?, ?, 'JMD', 'completed', ?, ?)`, [dto.appointmentId, dto.customerId, dto.staffUserId, idempotencyKey, dto.amountJmd, dto.paymentMethod, dto.notes || null]);
            const transactionId = result.insertId;
            await conn.execute(`UPDATE appointments SET payment_status = 'paid_in_store', status = 'confirmed', updated_at = NOW() WHERE id = ?`, [dto.appointmentId]);
            await conn.execute(`INSERT INTO appointment_status_log (appointment_id, new_status, changed_by_user_id, notes)
         VALUES (?, 'confirmed', ?, 'Manual payment recorded in store')`, [dto.appointmentId, dto.staffUserId]);
            const [rows] = await conn.execute('SELECT * FROM transactions WHERE id = ?', [transactionId]);
            return rows[0];
        });
    }
    async getCustomerTransactions(customerId, page, limit) {
        const offset = (page - 1) * limit;
        // Fix: executeQueryOne expects a single row but COUNT(*) returns one row, so that's fine.
        const resultCount = await (0, database_1.executeQueryOne)('SELECT COUNT(*) as count FROM transactions WHERE customer_user_id = ?', [customerId]);
        // Fix: use executeQuery (which returns array) instead of executeQueryOne for the rows.
        const rows = await (0, database_1.executeQuery)(`SELECT t.*, a.scheduled_date, a.start_time 
       FROM transactions t
       LEFT JOIN appointments a ON a.id = t.appointment_id
       WHERE t.customer_user_id = ?
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`, [customerId, limit, offset]);
        return {
            transactions: rows || [],
            total: resultCount?.count || 0,
        };
    }
    async getAllTransactions(page, limit) {
        const offset = (page - 1) * limit;
        const resultCount = await (0, database_1.executeQueryOne)('SELECT COUNT(*) as count FROM transactions');
        const rows = await (0, database_1.executeQuery)(`SELECT t.*, 
              u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email,
              a.scheduled_date, a.start_time
       FROM transactions t
       LEFT JOIN users u ON u.id = t.customer_user_id
       LEFT JOIN appointments a ON a.id = t.appointment_id
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`, [limit, offset]);
        return {
            transactions: rows || [],
            total: resultCount?.count || 0,
        };
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
//# sourceMappingURL=transaction.service.js.map