import express from 'express';
import crypto from 'crypto';
import moment from 'moment-timezone';
import { env } from '../config/env';
import { generateFiservSignature } from '../payments/fiserv/fiserv.crypto';

const router = express.Router();

/**
 * Builds a complete Fiserv Connect form + correct hashExtended.
 * Hash MUST cover every outbound field except hashExtended itself
 * (keys sorted alphabetically, values joined with `|`, HMAC-SHA256 → Base64).
 */
router.post('/generate-hash', (req, res) => {
  const chargeTotal = String(req.body.chargeTotal || '').trim();

  if (!chargeTotal || Number.isNaN(Number(chargeTotal))) {
    return res.status(400).json({ error: 'chargeTotal is required (e.g. "1.00")' });
  }

  const storeId = env.FISERV_STORE_ID || env.FISERV_STORE_NAME;
  const currency = env.FISERV_CURRENCY || '840';
  const gatewayUrl =
    env.FISERV_GATEWAY_URL ||
    `${env.FISERV_BASE_URL}/connect/gateway/processing`;

  if (!storeId || !env.FISERV_SHARED_SECRET || env.FISERV_SHARED_SECRET.startsWith('REPLACE_')) {
    return res.status(500).json({
      error: 'Fiserv is not configured. Set FISERV_STORE_ID and FISERV_SHARED_SECRET in backend/.env',
    });
  }

  // Fiserv Connect datetime in store timezone
  const timezone = 'America/Jamaica';
  const txnDateTime = moment().tz(timezone).format('YYYY:MM:DD-HH:mm:ss');
  const oid = crypto.randomUUID();

  const apiBase = env.API_BASE_URL.replace(/\/$/, '');
  const successUrl = env.FISERV_SUCCESS_URL || `${apiBase}/api/payments/success`;
  const failUrl = env.FISERV_FAILURE_URL || `${apiBase}/api/payments/error`;

  // All fields that will be posted to the gateway (except hashExtended)
  const baseFields: Record<string, string> = {
    chargetotal: chargeTotal.includes('.') ? chargeTotal : `${chargeTotal}.00`,
    checkoutoption: 'combinedpage',
    currency,
    hash_algorithm: 'HMACSHA256',
    oid,
    responseFailURL: failUrl,
    responseSuccessURL: successUrl,
    storename: storeId,
    timezone,
    txndatetime: txnDateTime,
    txntype: 'sale',
  };

  const hashExtended = generateFiservSignature(baseFields);

  res.json({
    gatewayUrl,
    formFields: {
      ...baseFields,
      hashExtended,
    },
    // Back-compat for older clients
    hashExtended,
    txnDateTime,
    storeId,
    currency,
    timezone,
  });
});

/** Fiserv browser return: accept POST (form) or GET; redirect to Angular. */
function paymentReturnParams(req: express.Request) {
  const src = { ...req.query, ...req.body } as Record<string, unknown>;
  const str = (key: string) => {
    const v = src[key];
    return typeof v === 'string' ? v : v != null ? String(v) : '';
  };
  return {
    oid: str('oid') || str('order_id') || str('OrderID'),
    approvalCode: str('approval_code') || str('approvalCode'),
    responseCode:
      str('fail_reason') ||
      str('associationResponseCode') ||
      str('response_code') ||
      str('responseCode'),
    chargetotal: str('chargetotal') || str('chargeTotal'),
    currency: str('currency'),
    status: str('status'),
  };
}

router.all('/success', (req, res) => {
  const p = paymentReturnParams(req);
  console.log('[Fiserv SUCCESS]', {
    oid: p.oid,
    approvalCode: p.approvalCode,
    chargetotal: p.chargetotal,
    status: p.status,
  });
  const frontendUrl = (env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
  const q = new URLSearchParams({
    approvalCode: p.approvalCode,
    oid: p.oid,
    chargetotal: p.chargetotal,
    currency: p.currency || '840',
    status: p.status || 'APPROVED',
  });
  // 303: convert POST → GET so the browser lands cleanly on the SPA
  res.redirect(303, `${frontendUrl}/payment/success?${q.toString()}`);
});

router.all('/error', (req, res) => {
  const p = paymentReturnParams(req);
  console.log('[Fiserv DECLINE]', {
    oid: p.oid,
    approvalCode: p.approvalCode,
    responseCode: p.responseCode,
    chargetotal: p.chargetotal,
  });
  const frontendUrl = (env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
  const q = new URLSearchParams({
    approvalCode: p.approvalCode,
    responseCode: p.responseCode,
    oid: p.oid,
    chargetotal: p.chargetotal,
    currency: p.currency || '840',
  });
  res.redirect(303, `${frontendUrl}/payment/failure?${q.toString()}`);
});

export default router;
