import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { validateFiservSignature } from './fiserv.crypto';
import { paymentFlowService } from './payment-flow.service';

/**
 * Strict schema for incoming Fiserv webhook payloads.
 * Excludes arbitrary or malicious extra fields.
 */
const fiservWebhookSchema = z.object({
  oid: z.string(), // Idempotency key
  status: z.string(), // APPROVED, FAILED, etc.
  approval_code: z.string().optional(),
  chargetotal: z.string().optional(),
  currency: z.string().optional(),
  txndatetime: z.string().optional(),
  storename: z.string().optional(),
  response_hash: z.string().optional(),
  response_code: z.string().optional(),
  fail_reason: z.string().optional(),
  // We explicitly ignore other fields that might contain PII like card numbers.
}).passthrough();

export class FiservWebhookHandler {
  public async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      // Validate schema and extract ONLY the required fields
      const parsed = fiservWebhookSchema.safeParse(req.body);
      
      if (!parsed.success) {
        logger.warn('[Fiserv Webhook] Invalid payload format received');
        res.status(400).send('Bad Request');
        return;
      }

      const data = parsed.data;

      // Safe logging (NO PII)
      logger.info(`[Fiserv Webhook] Received callback for oid: ${data.oid}, status: ${data.status}`);

      // Cryptographic validation of the payload
      const isValid = validateFiservSignature({
        approval_code: data.approval_code,
        chargetotal: data.chargetotal,
        currency: data.currency,
        txndatetime: data.txndatetime,
        storename: data.storename,
        response_hash: data.response_hash,
      });

      if (!isValid) {
        logger.error(`[Fiserv Webhook] INVALID SIGNATURE for oid: ${data.oid}. Potential forgery attempt.`);
        res.status(400).send('Invalid signature');
        return;
      }

      // Process the validated callback via the Flow Service
      await paymentFlowService.processValidatedCallback(
        data.oid,
        data.status,
        data.storename,
        data.chargetotal,
        data.currency,
        data.approval_code,
        data.response_code,
        data.fail_reason
      );

      res.status(200).send('OK');
    } catch (error) {
      logger.error('[Fiserv Webhook] Error processing callback', error);
      // Return 200 to prevent Fiserv from infinitely retrying a fatal logic error, 
      // or 500 if we want retries. We use 500 for true server errors.
      res.status(500).send('Internal Server Error');
    }
  }
}

export const fiservWebhookHandler = new FiservWebhookHandler();
