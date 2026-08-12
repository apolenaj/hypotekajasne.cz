/**
 * Browser hardening headers + CSP Report-Only.
 * Enforcement CSP is deferred until Report-Only is clean in production.
 *
 * Observed first-party / consented origins (Phase 6.1 map):
 * - self (Next.js HTML, RSC, _next/static, API routes)
 * - fonts via next/font (self-hosted)
 * - images: images.unsplash.com, images.pexels.com (next.config remotePatterns)
 * - analytics after consent: www.googletagmanager.com, www.google-analytics.com
 * - Supabase (browser anon if used): *.supabase.co
 * - Vercel preview tooling may inject scripts — keep report-only first
 *
 * Next step after RO validation: flip to Content-Security-Policy with
 * frame-ancestors 'none' and drop redundant X-Frame-Options if desired.
 */

export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/** Report-Only — does not block; use to validate before enforcement. */
export const CSP_REPORT_ONLY_VALUE = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://images.unsplash.com https://images.pexels.com https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com",
  "frame-src 'self' https://www.googletagmanager.com",
  "worker-src 'self' blob:",
].join("; ");

export const REQUIRED_SECURITY_HEADER_NAMES = [
  "x-content-type-options",
  "referrer-policy",
  "x-frame-options",
  "permissions-policy",
  "content-security-policy-report-only",
] as const;
