"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiservClient = exports.FiservClient = void 0;
const env_1 = require("../../config/env");
const fiserv_crypto_1 = require("./fiserv.crypto");
class FiservClient {
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
    buildPaymentSession(idempotencyKey, amountJmd, description) {
        const txnDatetime = (0, fiserv_crypto_1.getFiservTimestamp)();
        const chargetotal = amountJmd.toFixed(2);
        // Use FISERV_STORE_ID preferentially, fallback to FISERV_STORE_NAME
        const storeId = env_1.env.FISERV_STORE_ID || env_1.env.FISERV_STORE_NAME || '';
        const currency = env_1.env.FISERV_CURRENCY || '840';
        // Fiserv gateway URL
        const gatewayUrl = env_1.env.FISERV_ENDPOINT ||
            `${env_1.env.FISERV_BASE_URL}/connect/gateway/processing`;
        // --- Build ALL form fields (EXCLUDING hashExtended itself) ---
        // Keys must be sorted alphabetically when computing the hash.
        const baseFields = {
            chargetotal,
            comments: `HHC LASER - ${description}`,
            currency,
            hash_algorithm: 'HMACSHA256',
            mode: 'payonly',
            oid: idempotencyKey,
            paymentMethod: 'M', // Credit/Debit (Visa + Mastercard)
            responseFailURL: env_1.env.FISERV_FAILURE_URL,
            responseSuccessURL: env_1.env.FISERV_SUCCESS_URL,
            storename: storeId,
            transactionNotificationURL: env_1.env.FISERV_CALLBACK_URL,
            txndatetime: txnDatetime,
        };
        // --- Compute hashExtended (HMAC-SHA256, Base64) over ALL baseFields ---
        const hashExtended = (0, fiserv_crypto_1.generateFiservSignature)(baseFields);
        const formFields = {
            ...baseFields,
            hashExtended,
        };
        return {
            idempotencyKey,
            redirectUrl: gatewayUrl,
            formFields,
        };
    }
}
exports.FiservClient = FiservClient;
exports.fiservClient = new FiservClient();
//# sourceMappingURL=fiserv.client.js.map