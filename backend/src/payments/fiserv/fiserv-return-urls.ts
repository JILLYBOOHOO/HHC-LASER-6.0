import { env } from '../../config/env';

/**
 * Fiserv browser returns are HTTP POSTs. Angular/SPA hosts cannot accept POST
 * (browsers show "Cannot POST /payment/failure"). Always send customers back to
 * the API first; the API then 303-redirects to the frontend with a GET.
 */
export function resolveFiservBrowserReturnUrl(
  configured: string | undefined,
  apiPath: '/api/payments/success' | '/api/payments/error',
): string {
  const apiBase = (env.API_BASE_URL || '').replace(/\/$/, '');
  const apiUrl = `${apiBase}${apiPath}`;

  if (!configured) return apiUrl;

  try {
    const u = new URL(configured);
    const path = u.pathname.toLowerCase();
    const looksLikeSpa =
      path.includes('/payment/success') ||
      path.includes('/payment/failure') ||
      path.includes('/booking/success') ||
      path.includes('/booking/failure');
    const alreadyApi =
      path.includes('/api/payments/success') ||
      path.includes('/api/payments/error') ||
      path.includes('/api/payments/failure');

    if (looksLikeSpa && !alreadyApi) {
      return apiUrl;
    }
  } catch {
    return apiUrl;
  }

  return configured;
}
