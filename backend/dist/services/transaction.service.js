"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const database_1 = require("../config/database");
class TransactionService {
    async getPaymentStatus(idempotencyKey, customerId) {
        return (0, database_1.executeQueryOne)('SELECT * FROM transactions WHERE idempotency_key = ? AND customer_user_id = ?', [idempotencyKey, customerId]);
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
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
//# sourceMappingURL=transaction.service.js.map