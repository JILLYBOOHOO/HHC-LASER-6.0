"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFiservHmac = generateFiservHmac;
exports.validateFiservCallback = validateFiservCallback;
exports.generateIdempotencyKey = generateIdempotencyKey;
exports.getFiservTimestamp = getFiservTimestamp;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
/**
 * Generates HMAC SHA-256 signature for Scotiabank Fiserv payment requests.
 * The signature covers: storeId + timestamp + token + txnType + amount + currency
 */
function generateFiservHmac(params) {
    const { storeId, timestamp, token, txnType, chargetotal, currency } = params;
    // Fiserv hash string: storename + txndatetime + chargetotal + currency
    const hashStr = `${storeId}${timestamp}${chargetotal}${currency}${env_1.env.FISERV_SHARED_SECRET}`;
    const hash = crypto_1.default
        .createHmac('sha256', env_1.env.FISERV_SHARED_SECRET)
        .update(hashStr)
        .digest('hex');
    return hash;
}
/**
 * Validates the HMAC signature received on Fiserv webhook callbacks.
 * Returns true if the signature is valid, false otherwise.
 */
function validateFiservCallback(params) {
    const { approval_code, chargetotal, currency, txndatetime, storename, response_hash } = params;
    // Fiserv callback hash: approval_code + chargetotal + currency + txndatetime + storename + shared_secret
    const rawStr = `${approval_code}${chargetotal}${currency}${txndatetime}${storename}${env_1.env.FISERV_SHARED_SECRET}`;
    const computedHash = crypto_1.default
        .createHash('sha256')
        .update(rawStr)
        .digest('hex');
    // Constant-time comparison to prevent timing attacks
    return crypto_1.default.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(response_hash, 'hex'));
}
/**
 * Generates a unique idempotency key for payment requests.
 */
function generateIdempotencyKey() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
/**
 * Generates the transaction datetime string in Fiserv format: YYYY:MM:DD-HH:mm:ss
 */
function getFiservTimestamp() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const mins = String(now.getUTCMinutes()).padStart(2, '0');
    const secs = String(now.getUTCSeconds()).padStart(2, '0');
    return `${year}:${month}:${day}-${hours}:${mins}:${secs}`;
}
//# sourceMappingURL=hmac.js.map