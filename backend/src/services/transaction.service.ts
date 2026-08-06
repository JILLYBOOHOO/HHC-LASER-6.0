import { executeQuery, executeQueryOne, withTransaction } from '../config/database';
import { Transaction, TransactionPaymentStatus } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  async updatePaymentStatus(idempotencyKey: string, status: TransactionPaymentStatus, fiservTxnId?: string): Promise<void> {
    await executeQuery(
      'UPDATE transactions SET status = ?, fiserv_txn_id = ? WHERE idempotency_key = ?',
      [status, fiservTxnId, idempotencyKey]
    );
  }

  async getPaymentStatus(key: string, userId?: number): Promise<Transaction | null> {
    if (userId) {
      return executeQueryOne<Transaction>(
        'SELECT * FROM transactions WHERE idempotency_key = ? AND customer_user_id = ?',
        [key, userId]
      );
    }
    return executeQueryOne<Transaction>(
      'SELECT * FROM transactions WHERE idempotency_key = ?',
      [key]
    );
  }

  async recordManualPayment(dto: { appointmentId: number, payments: { amountJmd: number, paymentMethod: string, notes?: string }[], staffUserId: number, customerId: number }): Promise<Transaction[]> {
    return withTransaction(async (conn) => {
      const transactions: Transaction[] = [];
      
      for (const p of dto.payments) {
        const idempotencyKey = uuidv4();
        const [result] = await conn.execute(
          `INSERT INTO transactions 
           (appointment_id, customer_user_id, recorded_by_user_id, idempotency_key, amount_jmd, currency, status, payment_method, notes)
           VALUES (?, ?, ?, ?, ?, 'JMD', 'completed', ?, ?) RETURNING *`,
          [dto.appointmentId, dto.customerId, dto.staffUserId, idempotencyKey, p.amountJmd, p.paymentMethod, p.notes || null]
        ) as any;
        
        const transactionId = result.insertId || result.rows?.[0]?.id;
        if (transactionId) {
          const [rows] = await conn.execute('SELECT * FROM transactions WHERE id = ?', [transactionId]) as any;
          if (rows && rows.length > 0) {
            transactions.push(rows[0]);
          }
        }
      }

      // Check total paid against total amount
      const [apptRows] = await conn.execute('SELECT total_amount_jmd FROM appointments WHERE id = ?', [dto.appointmentId]) as any;
      const apptTotal = parseFloat(apptRows[0]?.total_amount_jmd || '0');
      
      const [sumRows] = await conn.execute("SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE appointment_id = ? AND status = 'completed'", [dto.appointmentId]) as any;
      const totalPaid = parseFloat(sumRows[0]?.total || '0');
      
      let newPaymentStatus = 'pending_payment';
      if (totalPaid >= apptTotal && apptTotal > 0) {
        newPaymentStatus = 'paid_in_store';
      }

      await conn.execute(
        `UPDATE appointments SET payment_status = ?, status = 'confirmed', updated_at = NOW() WHERE id = ?`,
        [newPaymentStatus, dto.appointmentId]
      );

      await conn.execute(
        `INSERT INTO appointment_status_log (appointment_id, new_status, changed_by_user_id, notes)
         VALUES (?, 'confirmed', ?, ?)`,
        [dto.appointmentId, dto.staffUserId, `Payment(s) recorded. Total paid: JMD ${totalPaid}. Status: ${newPaymentStatus}`]
      );

      return transactions;
    });
  }

  async getCustomerTransactions(customerId: number, page: number, limit: number): Promise<{ transactions: Transaction[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Fix: executeQueryOne expects a single row but COUNT(*) returns one row, so that's fine.
    const resultCount = await executeQueryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE customer_user_id = ?',
      [customerId]
    );
    
    // Fix: use executeQuery (which returns array) instead of executeQueryOne for the rows.
    const rows = await executeQuery<Transaction & { scheduled_date?: string, start_time?: string }>(
      `SELECT t.*, a.scheduled_date, a.start_time 
       FROM transactions t
       LEFT JOIN appointments a ON a.id = t.appointment_id
       WHERE t.customer_user_id = ?
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    );

    return {
      transactions: rows || [],
      total: resultCount?.count || 0,
    };
  }

  async getAllTransactions(page: number, limit: number): Promise<{ transactions: any[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const resultCount = await executeQueryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions'
    );
    
    const rows = await executeQuery<any>(
      `SELECT t.*, 
              u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email,
              a.scheduled_date, a.start_time
       FROM transactions t
       LEFT JOIN users u ON u.id = t.customer_user_id
       LEFT JOIN appointments a ON a.id = t.appointment_id
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return {
      transactions: rows || [],
      total: resultCount?.count || 0,
    };
  }
}

export const transactionService = new TransactionService();
