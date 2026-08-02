import { FiservPaymentSession } from './fiserv.client';
export interface InitiatePaymentDto {
    appointmentId?: number;
    amountJmd: number;
    customerId: number;
    description: string;
}
export declare class PaymentFlowService {
    /**
     * Initiates a payment session, stores the pending transaction, and builds Fiserv form fields.
     */
    initiatePayment(dto: InitiatePaymentDto): Promise<FiservPaymentSession>;
    /**
     * Processes the validated Fiserv callback.
     * Handles strict database FOR UPDATE locks to prevent duplicates.
     */
    processValidatedCallback(idempotencyKey: string, statusStr: string, storename?: string, chargetotal?: string, currency?: string, approvalCode?: string, responseCode?: string, responseMessage?: string): Promise<void>;
}
export declare const paymentFlowService: PaymentFlowService;
//# sourceMappingURL=payment-flow.service.d.ts.map