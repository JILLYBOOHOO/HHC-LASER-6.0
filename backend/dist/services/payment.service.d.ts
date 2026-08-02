import { Transaction } from '../models/types';
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
export declare class PaymentService {
    /**
     * Initiates a Fiserv hosted payment session.
     * Returns the form fields needed to redirect the customer to the Fiserv payment page.
     */
    initiatePayment(dto: InitiatePaymentDto): Promise<FiservPaymentSession>;
    /**
     * Processes the Fiserv callback webhook.
     * Validates HMAC, updates transaction status, triggers notifications.
     */
    processCallback(callbackData: Record<string, string>): Promise<void>;
    getPaymentStatus(idempotencyKey: string, customerId: number): Promise<Transaction | null>;
    getCustomerTransactions(customerId: number, page: number, limit: number): Promise<{
        transactions: Transaction[];
        total: number;
    }>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=payment.service.d.ts.map