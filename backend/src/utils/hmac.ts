import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Generates HMAC SHA-256 signature for Scotiabank Fiserv payment requests.
 * The signature covers: storeId + timestamp + token + txnType + amount + currency
 */
export function generateFiservHmac(params: {
  storeId: string;
  timestamp: string;
  token: string;
  txnType: string;
  chargetotal: string;
  currency: string;
}): string {
  const { storeId, timestamp, token, txnType, chargetotal, currency } = params;

  // Fiserv hash string: storename + txndatetime + chargetotal + currency
  const hashStr = `${storeId}${timestamp}${chargetotal}${currency}${env.FISERV_SHARED_SECRET}`;

  const hash = crypto
    .createHmac('sha256', env.FISERV_SHARED_SECRET)
    .update(hashStr)
    .digest('hex');

  return hash;
}

/**
 * Validates the HMAC signature received on Fiserv webhook callbacks.
 * Returns true if the signature is valid, false otherwise.
 */
export function validateFiservCallback(params: {
  approval_code: string;
  chargetotal: string;
  currency: string;
  txndatetime: string;
  storename: string;
  response_hash: string;
}): boolean {
  const { approval_code, chargetotal, currency, txndatetime, storename, response_hash } = params;

  // Fiserv callback hash: approval_code + chargetotal + currency + txndatetime + storename + shared_secret
  const rawStr = `${approval_code}${chargetotal}${currency}${txndatetime}${storename}${env.FISERV_SHARED_SECRET}`;

  const computedHash = crypto
    .createHash('sha256')
    .update(rawStr)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, 'hex'),
    Buffer.from(response_hash, 'hex')
  );
}

/**
 * Generates a unique idempotency key for payment requests.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates the transaction datetime string in Fiserv format: YYYY:MM:DD-HH:mm:ss
 */
export function getFiservTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const mins = String(now.getUTCMinutes()).padStart(2, '0');
  const secs = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}:${month}:${day}-${hours}:${mins}:${secs}`;
}
