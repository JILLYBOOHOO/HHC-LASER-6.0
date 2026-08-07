/**
 * Fiserv browser returns are HTTP POSTs. Angular/SPA hosts cannot accept POST
 * (browsers show "Cannot POST /payment/failure"). Always send customers back to
 * the API first; the API then 303-redirects to the frontend with a GET.
 */
export declare function resolveFiservBrowserReturnUrl(configured: string | undefined, apiPath: '/api/payments/success' | '/api/payments/error'): string;
//# sourceMappingURL=fiserv-return-urls.d.ts.map