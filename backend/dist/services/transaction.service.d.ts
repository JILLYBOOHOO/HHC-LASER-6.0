import { Transaction } from '../models/types';
export declare class TransactionService {
    getPaymentStatus(idempotencyKey: string, customerId: number): Promise<Transaction | null>;
    getCustomerTransactions(customerId: number, page: number, limit: number): Promise<{
        transactions: Transaction[];
        total: number;
    }>;
}
export declare const transactionService: TransactionService;
//# sourceMappingURL=transaction.service.d.ts.map