/**
 * Generates HMAC SHA-256 signature for Scotiabank Fiserv payment requests.
 * The signature covers: storeId + timestamp + token + txnType + amount + currency
 */
export declare function generateFiservHmac(params: {
    storeId: string;
    timestamp: string;
    token: string;
    txnType: string;
    chargetotal: string;
    currency: string;
}): string;
/**
 * Validates the HMAC signature received on Fiserv webhook callbacks.
 * Returns true if the signature is valid, false otherwise.
 */
export declare function validateFiservCallback(params: {
    approval_code: string;
    chargetotal: string;
    currency: string;
    txndatetime: string;
    storename: string;
    response_hash: string;
}): boolean;
/**
 * Generates a unique idempotency key for payment requests.
 */
export declare function generateIdempotencyKey(): string;
/**
 * Generates the transaction datetime string in Fiserv format: YYYY:MM:DD-HH:mm:ss
 */
export declare function getFiservTimestamp(): string;
//# sourceMappingURL=hmac.d.ts.map