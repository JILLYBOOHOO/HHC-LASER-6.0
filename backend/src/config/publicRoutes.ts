// Public route whitelist (matched against req.path / req.originalUrl)
// Optional methods: if omitted, all methods are public for that path prefix.

export type PublicRoute = string | { path: string; methods?: string[] };

export const PUBLIC_ROUTES: PublicRoute[] = [
  // Fiserv browser returns (POST) + server notification
  "/api/payments/callback",
  "/api/payments/success",
  "/api/payments/error",
  "/api/payments/failure",
  // Booking availability endpoints
  "/api/bookings/available-slots",
  "/api/bookings/available-dates",
  // Public catalog endpoints
  "/api/services",
  "/api/locations",
  // Public site settings (login/register needs this; admin PUT stays protected)
  { path: "/api/settings/business", methods: ["GET"] },
  { path: "/api/homepage", methods: ["GET"] }, // not /all — that path continues past this exact check
  // Contact form
  "/api/contact",
  // Health check endpoints
  "/api/health",
  "/api/healthz",
];

export function isPublicRoute(path: string, method: string): boolean {
  const upper = method.toUpperCase();

  return PUBLIC_ROUTES.some((route) => {
    if (typeof route === "string") {
      return path === route || path.startsWith(route + "/");
    }

    const methods = route.methods?.map((m) => m.toUpperCase());
    if (methods && !methods.includes(upper)) {
      return false;
    }

    // Exact match for method-scoped routes so /api/homepage/all is not opened by /api/homepage
    if (methods) {
      return path === route.path;
    }

    return path === route.path || path.startsWith(route.path + "/");
  });
}
