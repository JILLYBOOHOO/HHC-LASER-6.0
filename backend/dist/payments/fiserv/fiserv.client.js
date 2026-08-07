"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiservClient = exports.FiservClient = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const env_1 = require("../../config/env");
const fiserv_crypto_1 = require("./fiserv.crypto");
const fiserv_return_urls_1 = require("./fiserv-return-urls");
/**
 * Fiserv Connect only accepts a fixed timezone list.
 * America/Jamaica is NOT valid and causes an immediate bounce to responseFailURL
 * before the card entry page (often seen in the browser as Cannot POST /payment/failure).
 */
const FISERV_TIMEZONE = 'America/New_York';
class FiservClient {
    /**
     * Builds the form fields required to redirect the customer to the
     * Fiserv LATAM Hosted Payment Pages (WebCheckout).
     */
    buildPaymentSession(idempotencyKey, amountJmd, description) {
        const timezone = FISERV_TIMEZONE;
        const txnDatetime = (0, moment_timezone_1.default)().tz(timezone).format('YYYY:MM:DD-HH:mm:ss');
        const chargetotal = Number(amountJmd || 0).toFixed(2);
        const storeId = env_1.env.FISERV_STORE_ID || env_1.env.FISERV_STORE_NAME || '';
        // Use the currency configured in .env (e.g. 388 for JMD or 840 for USD)
        const rawCurrency = String(env_1.env.FISERV_CURRENCY || '388').trim();
        const currency = rawCurrency.toUpperCase() === 'JMD' ? '388' : rawCurrency.toUpperCase() === 'USD' ? '840' : rawCurrency;
        const gatewayUrl = env_1.env.FISERV_GATEWAY_URL ||
            env_1.env.FISERV_ENDPOINT ||
            `${env_1.env.FISERV_BASE_URL}/connect/gateway/processing`;
        // Must be API endpoints (accept POST). Never point at the Angular SPA.
        const successUrl = (0, fiserv_return_urls_1.resolveFiservBrowserReturnUrl)(env_1.env.FISERV_SUCCESS_URL, '/api/payments/success');
        const failUrl = (0, fiserv_return_urls_1.resolveFiservBrowserReturnUrl)(env_1.env.FISERV_FAILURE_URL, '/api/payments/error');
        // Minimal Connect field set — only gateway-recognized params (all hashed).
        const baseFields = {
            chargetotal,
            checkoutoption: 'combinedpage',
            currency,
            hash_algorithm: 'HMACSHA256',
            language: 'en_US',
            oid: idempotencyKey,
            responseFailURL: failUrl,
            responseSuccessURL: successUrl,
            storename: storeId,
            timezone,
            txndatetime: txnDatetime,
            txntype: 'sale',
        };
        // Optional but supported — only include when publicly reachable (not localhost)
        if (env_1.env.FISERV_CALLBACK_URL &&
            !/localhost|127\.0\.0\.1/i.test(env_1.env.FISERV_CALLBACK_URL)) {
            baseFields.transactionNotificationURL = env_1.env.FISERV_CALLBACK_URL;
        }
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