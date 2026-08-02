import crypto from 'crypto';
import { env } from '../../config/env';

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
export function generateFiservSignature(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  const rawStr = sortedKeys.map(k => String(params[k] ?? '')).join('|');

  const hmac = crypto.createHmac('sha256', env.FISERV_SHARED_SECRET);
  const digest = hmac.update(rawStr, 'utf8').digest(); // raw binary Buffer
  return digest.toString('base64');
}

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
export function validateFiservSignature(params: {
  approval_code?: string;
  chargetotal?: string;
  currency?: string;
  txndatetime?: string;
  storename?: string;
  response_hash?: string;
}): boolean {
  if (!params.response_hash) return false;

  const rawStr = [
    params.approval_code ?? '',
    params.chargetotal   ?? '',
    params.currency      ?? '',
    params.txndatetime   ?? '',
    params.storename     ?? '',
  ].join('|');

  const hmac = crypto.createHmac('sha256', env.FISERV_SHARED_SECRET);
  const computedDigest = hmac.update(rawStr, 'utf8').digest(); // raw binary Buffer
  const computedB64 = computedDigest.toString('base64');

  try {
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(computedB64, 'base64'),
      Buffer.from(params.response_hash, 'base64')
    );
  } catch {
    // Buffer lengths mismatch (different Base64 lengths) — signature is invalid
    return false;
  }
}

/**
 * Generates a unique idempotency key for payment tracking.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates the transaction datetime string in Fiserv format: YYYY:MM:DD-HH:mm:ss
 */
export function getFiservTimestamp(): string {
  const now = new Date();
  const year  = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day   = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const mins  = String(now.getUTCMinutes()).padStart(2, '0');
  const secs  = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}:${month}:${day}-${hours}:${mins}:${secs}`;
}
