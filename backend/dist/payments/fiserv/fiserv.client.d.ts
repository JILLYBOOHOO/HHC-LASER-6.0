export interface FiservPaymentSession {
    idempotencyKey: string;
    redirectUrl: string;
    formFields: Record<string, string>;
}
export declare class FiservClient {
    /**
     * Builds the form fields required to redirect the customer to the
     * Fiserv LATAM Hosted Payment Pages (WebCheckout).
     */
    buildPaymentSession(idempotencyKey: string, amountJmd: number, description: string): FiservPaymentSession;
}
export declare const fiservClient: FiservClient;
//# sourceMappingURL=fiserv.client.d.ts.map