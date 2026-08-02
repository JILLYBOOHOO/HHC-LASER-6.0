import { env } from '../../config/env';
import { generateFiservSignature, getFiservTimestamp } from './fiserv.crypto';

export interface FiservPaymentSession {
  idempotencyKey: string;
  redirectUrl: string;
  formFields: Record<string, string>;
}

export class FiservClient {
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
  public buildPaymentSession(
    idempotencyKey: string,
    amountJmd: number,
    description: string
  ): FiservPaymentSession {
    const txnDatetime = getFiservTimestamp();
    const chargetotal = amountJmd.toFixed(2);

    // Use FISERV_STORE_ID preferentially, fallback to FISERV_STORE_NAME
    const storeId = env.FISERV_STORE_ID || env.FISERV_STORE_NAME || '';
    const currency = env.FISERV_CURRENCY || '840';

    // Fiserv gateway URL
    const gatewayUrl =
      env.FISERV_ENDPOINT ||
      `${env.FISERV_BASE_URL}/connect/gateway/processing`;

    // --- Build ALL form fields (EXCLUDING hashExtended itself) ---
    // Keys must be sorted alphabetically when computing the hash.
    const baseFields: Record<string, string> = {
      chargetotal,
      comments:                   `HHC LASER - ${description}`,
      currency,
      hash_algorithm:             'HMACSHA256',
      mode:                       'payonly',
      oid:                        idempotencyKey,
      paymentMethod:              'M', // Credit/Debit (Visa + Mastercard)
      responseFailURL:            env.FISERV_FAILURE_URL,
      responseSuccessURL:         env.FISERV_SUCCESS_URL,
      storename:                  storeId,
      transactionNotificationURL: env.FISERV_CALLBACK_URL,
      txndatetime:                txnDatetime,
    };

    // --- Compute hashExtended (HMAC-SHA256, Base64) over ALL baseFields ---
    const hashExtended = generateFiservSignature(baseFields);

    const formFields: Record<string, string> = {
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

export const fiservClient = new FiservClient();
