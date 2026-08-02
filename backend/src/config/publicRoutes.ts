// Public route whitelist
export const PUBLIC_ROUTES: string[] = [
  // Fiserv public payment endpoints
  '/api/payments/create-direct-checkout',
  // Fiserv webhook / transaction notification
  '/api/payments/callback',
  // Booking availability endpoints
  '/api/bookings/available-slots',
  '/api/bookings/available-dates',
  // Public catalog endpoints
  '/api/services',
  '/api/services/:slug',
  '/api/locations',
  // Contact form
  '/api/contact',
  // Health check endpoints
  '/api/health',
  '/api/healthz'
];
