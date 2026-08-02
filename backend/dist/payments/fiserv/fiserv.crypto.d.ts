/**
 * Generates the Fiserv LATAM WebCheckout `hashExtended` signature.
 *
 * Algorithm (per Scotiabank Fiserv LATAM integration guide):
 *  1. Collect all outbound form parameters (EXCLUDING `sharedsecret` and `hashExtended`).
 *  2. Sort the parameter keys alphabetically.
 *  3. Join the corresponding values with a pipe `|` separator.
 *  4. Compute HMAC-SHA256 over the resulting string using the Shared Secret as the key.
 *  5. Base64-encode the raw binary HMAC digest.
 */
export declare function generateFiservSignature(params: Record<string, string>): string;
/**
 * Validates the HMAC-SHA256 `response_hash` received on Fiserv webhook callbacks.
 *
 * The gateway builds the response hash by concatenating with `|`:
 *   approval_code | chargetotal | currency | txndatetime | storename
 * then computing HMAC-SHA256 (Shared Secret) and Base64-encoding the result.
 *
 * For declined transactions `approval_code` may be empty — we default to '' so
 * the pipeline positions remain constant.
 */
export declare function validateFiservSignature(params: {
    approval_code?: string;
    chargetotal?: string;
    currency?: string;
    txndatetime?: string;
    storename?: string;
    response_hash?: string;
}): boolean;
/**
 * Generates a unique idempotency key for payment tracking.
 */
export declare function generateIdempotencyKey(): string;
/**
 * Generates the transaction datetime string in Fiserv format: YYYY:MM:DD-HH:mm:ss
 */
export declare function getFiservTimestamp(): string;
//# sourceMappingURL=fiserv.crypto.d.ts.map