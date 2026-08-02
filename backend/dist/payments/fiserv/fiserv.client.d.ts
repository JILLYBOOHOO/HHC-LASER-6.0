export interface FiservPaymentSession {
    idempotencyKey: string;
    redirectUrl: string;
    formFields: Record<string, string>;
}
export declare class FiservClient {
    /**
     * Builds the form fields required to redirect the customer to the
     * Fiserv LATAM Hosted Payment Pages (WebCheckout).
     *
     * Per Scotiabank/Fiserv LATAM integration guide:
     *  - `storename`  = Store ID (e.g. 81186299021)
     *  - `currency`   = ISO 4217 numeric code (840 = USD, 388 = JMD)
     *  - `hashExtended` = HMAC-SHA256 over ALL other field values sorted
     *                     alphabetically by key, pipe-delimited, Base64-encoded.
     *
     * Gateway endpoint (sandbox): https://test.ipg-online.com/connect/gateway/processing
     */
    buildPaymentSession(idempotencyKey: string, amountJmd: number, description: string): FiservPaymentSession;
}
export declare const fiservClient: FiservClient;
//# sourceMappingURL=fiserv.client.d.ts.map