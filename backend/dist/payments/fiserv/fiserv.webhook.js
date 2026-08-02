"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiservWebhookHandler = exports.FiservWebhookHandler = void 0;
const zod_1 = require("zod");
const logger_1 = require("../../utils/logger");
const fiserv_crypto_1 = require("./fiserv.crypto");
const payment_flow_service_1 = require("./payment-flow.service");
/**
 * Strict schema for incoming Fiserv webhook payloads.
 * Excludes arbitrary or malicious extra fields.
 */
const fiservWebhookSchema = zod_1.z.object({
    oid: zod_1.z.string(), // Idempotency key
    status: zod_1.z.string(), // APPROVED, FAILED, etc.
    approval_code: zod_1.z.string().optional(),
    chargetotal: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    txndatetime: zod_1.z.string().optional(),
    storename: zod_1.z.string().optional(),
    response_hash: zod_1.z.string().optional(),
    response_code: zod_1.z.string().optional(),
    fail_reason: zod_1.z.string().optional(),
    // We explicitly ignore other fields that might contain PII like card numbers.
}).passthrough();
class FiservWebhookHandler {
    async handleCallback(req, res) {
        try {
            // Validate schema and extract ONLY the required fields
            const parsed = fiservWebhookSchema.safeParse(req.body);
            if (!parsed.success) {
                logger_1.logger.warn('[Fiserv Webhook] Invalid payload format received');
                res.status(400).send('Bad Request');
                return;
            }
            const data = parsed.data;
            // Safe logging (NO PII)
            logger_1.logger.info(`[Fiserv Webhook] Received callback for oid: ${data.oid}, status: ${data.status}`);
            // Cryptographic validation of the payload
            const isValid = (0, fiserv_crypto_1.validateFiservSignature)({
                approval_code: data.approval_code,
                chargetotal: data.chargetotal,
                currency: data.currency,
                txndatetime: data.txndatetime,
                storename: data.storename,
                response_hash: data.response_hash,
            });
            if (!isValid) {
                logger_1.logger.error(`[Fiserv Webhook] INVALID SIGNATURE for oid: ${data.oid}. Potential forgery attempt.`);
                res.status(400).send('Invalid signature');
                return;
            }
            // Process the validated callback via the Flow Service
            await payment_flow_service_1.paymentFlowService.processValidatedCallback(data.oid, data.status, data.storename, data.chargetotal, data.currency, data.approval_code, data.response_code, data.fail_reason);
            res.status(200).send('OK');
        }
        catch (error) {
            logger_1.logger.error('[Fiserv Webhook] Error processing callback', error);
            // Return 200 to prevent Fiserv from infinitely retrying a fatal logic error, 
            // or 500 if we want retries. We use 500 for true server errors.
            res.status(500).send('Internal Server Error');
        }
    }
}
exports.FiservWebhookHandler = FiservWebhookHandler;
exports.fiservWebhookHandler = new FiservWebhookHandler();
//# sourceMappingURL=fiserv.webhook.js.map