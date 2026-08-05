import moment from 'moment-timezone';
import { env } from '../../config/env';
import { generateFiservSignature } from './fiserv.crypto';

export interface FiservPaymentSession {
  idempotencyKey: string;
  redirectUrl: string;
  formFields: Record<string, string>;
}

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
    const timezone = 'America/Jamaica';
    const txnDatetime = moment().tz(timezone).format('YYYY:MM:DD-HH:mm:ss');
    const chargetotal = Number(amountJmd || 0).toFixed(2);

    const storeId = env.FISERV_STORE_ID || env.FISERV_STORE_NAME || '';
    // Always charge in Jamaican dollars (ISO 4217 numeric code 388).
    // Reject accidental USD (840) from misconfigured env.
    const rawCurrency = String(env.FISERV_CURRENCY || '388').trim();
    const currency = rawCurrency === '840' || rawCurrency.toUpperCase() === 'USD' ? '388' : (rawCurrency.toUpperCase() === 'JMD' ? '388' : rawCurrency);

    const gatewayUrl =
      env.FISERV_GATEWAY_URL ||
      env.FISERV_ENDPOINT ||
      `${env.FISERV_BASE_URL}/connect/gateway/processing`;

    const apiBase = (env.API_BASE_URL || '').replace(/\/$/, '');
    const successUrl = env.FISERV_SUCCESS_URL || `${apiBase}/api/payments/success`;
    const failUrl = env.FISERV_FAILURE_URL || `${apiBase}/api/payments/error`;

    // Align with the working generate-hash Connect field set
    const baseFields: Record<string, string> = {
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
      transactionNotificationURL: env.FISERV_CALLBACK_URL,
      txndatetime: txnDatetime,
      txntype: 'sale',
    };

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
