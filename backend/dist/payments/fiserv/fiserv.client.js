"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiservClient = exports.FiservClient = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const env_1 = require("../../config/env");
const fiserv_crypto_1 = require("./fiserv.crypto");
class FiservClient {
    /**
     * Builds the form fields required to redirect the customer to the
     * Fiserv LATAM Hosted Payment Pages (WebCheckout).
     */
    buildPaymentSession(idempotencyKey, amountJmd, description) {
        const timezone = 'America/Jamaica';
        const txnDatetime = (0, moment_timezone_1.default)().tz(timezone).format('YYYY:MM:DD-HH:mm:ss');
        const chargetotal = Number(amountJmd || 0).toFixed(2);
        const storeId = env_1.env.FISERV_STORE_ID || env_1.env.FISERV_STORE_NAME || '';
        // Always charge in Jamaican dollars (ISO 4217 numeric code 388).
        // Reject accidental USD (840) from misconfigured env.
        const rawCurrency = String(env_1.env.FISERV_CURRENCY || '388').trim();
        const currency = rawCurrency === '840' || rawCurrency.toUpperCase() === 'USD' ? '388' : (rawCurrency.toUpperCase() === 'JMD' ? '388' : rawCurrency);
        const gatewayUrl = env_1.env.FISERV_GATEWAY_URL ||
            env_1.env.FISERV_ENDPOINT ||
            `${env_1.env.FISERV_BASE_URL}/connect/gateway/processing`;
        const apiBase = (env_1.env.API_BASE_URL || '').replace(/\/$/, '');
        const successUrl = env_1.env.FISERV_SUCCESS_URL || `${apiBase}/api/payments/success`;
        const failUrl = env_1.env.FISERV_FAILURE_URL || `${apiBase}/api/payments/error`;
        // Align with the working generate-hash Connect field set
        const baseFields = {
            chargetotal,
            checkoutoption: 'combinedpage',
            comments: `HHC LASER - ${description}`,
            currency,
            hash_algorithm: 'HMACSHA256',
            language: 'en_US',
            oid: idempotencyKey,
            responseFailURL: failUrl,
            responseSuccessURL: successUrl,
            storename: storeId,
            timezone,
            transactionNotificationURL: env_1.env.FISERV_CALLBACK_URL,
            txndatetime: txnDatetime,
            txntype: 'sale',
        };
        const hashExtended = (0, fiserv_crypto_1.generateFiservSignature)(baseFields);
        return {
            idempotencyKey,
            redirectUrl: gatewayUrl,
            formFields: {
                ...baseFields,
                hashExtended,
            },
        };
    }
}
exports.FiservClient = FiservClient;
exports.fiservClient = new FiservClient();
//# sourceMappingURL=fiserv.client.js.map