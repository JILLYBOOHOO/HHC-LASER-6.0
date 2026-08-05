import moment from 'moment-timezone';
import { env } from '../../config/env';
import { generateFiservSignature } from './fiserv.crypto';
import { resolveFiservBrowserReturnUrl } from './fiserv-return-urls';

export interface FiservPaymentSession {
  idempotencyKey: string;
  redirectUrl: string;
  formFields: Record<string, string>;
}

/**
 * Fiserv Connect only accepts a fixed timezone list.
 * America/Jamaica is NOT valid and causes an immediate bounce to responseFailURL
 * before the card entry page (often seen in the browser as Cannot POST /payment/failure).
 */
const FISERV_TIMEZONE = 'America/New_York';

export class FiservClient {
  /**
   * Builds the form fields required to redirect the customer to the
   * Fiserv LATAM Hosted Payment Pages (WebCheckout).
   */
  public buildPaymentSession(
    idempotencyKey: string,
    amountJmd: number,
    description: string
  ): FiservPaymentSession {
    const timezone = FISERV_TIMEZONE;
    const txnDatetime = moment().tz(timezone).format('YYYY:MM:DD-HH:mm:ss');
    const chargetotal = Number(amountJmd || 0).toFixed(2);

    const storeId = env.FISERV_STORE_ID || env.FISERV_STORE_NAME || '';
    // Use the currency configured in .env (e.g. 388 for JMD or 840 for USD)
    const rawCurrency = String(env.FISERV_CURRENCY || '388').trim();
    const currency = rawCurrency.toUpperCase() === 'JMD' ? '388' : rawCurrency.toUpperCase() === 'USD' ? '840' : rawCurrency;

    const gatewayUrl =
      env.FISERV_GATEWAY_URL ||
      env.FISERV_ENDPOINT ||
      `${env.FISERV_BASE_URL}/connect/gateway/processing`;

    // Must be API endpoints (accept POST). Never point at the Angular SPA.
    const successUrl = resolveFiservBrowserReturnUrl(
      env.FISERV_SUCCESS_URL,
      '/api/payments/success',
    );
    const failUrl = resolveFiservBrowserReturnUrl(
      env.FISERV_FAILURE_URL,
      '/api/payments/error',
    );

    // Minimal Connect field set — only gateway-recognized params (all hashed).
    const baseFields: Record<string, string> = {
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
    if (
      env.FISERV_CALLBACK_URL &&
      !/localhost|127\.0\.0\.1/i.test(env.FISERV_CALLBACK_URL)
    ) {
      baseFields.transactionNotificationURL = env.FISERV_CALLBACK_URL;
    }

    const hashExtended = generateFiservSignature(baseFields);

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

export const fiservClient = new FiservClient();
