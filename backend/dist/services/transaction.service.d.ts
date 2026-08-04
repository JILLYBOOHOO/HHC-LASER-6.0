import { Transaction, TransactionPaymentStatus } from '../models/types';
export declare class TransactionService {
    updatePaymentStatus(idempotencyKey: string, status: TransactionPaymentStatus, fiservTxnId?: string): Promise<void>;
    getPaymentStatus(key: string, userId?: number): Promise<Transaction | null>;
    recordManualPayment(dto: {
        appointmentId: number;
        amountJmd: number;
        paymentMethod: string;
        notes?: string;
        staffUserId: number;
        customerId: number;
    }): Promise<Transaction>;
    getCustomerTransactions(customerId: number, page: number, limit: number): Promise<{
        transactions: Transaction[];
        total: number;
    }>;
    getAllTransactions(page: number, limit: number): Promise<{
        transactions: any[];
        total: number;
    }>;
}
export declare const transactionService: TransactionService;
//# sourceMappingURL=transaction.service.d.ts.map