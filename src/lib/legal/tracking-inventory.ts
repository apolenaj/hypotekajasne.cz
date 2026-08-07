/**
 * INTERNAL tracking / storage inventory (implementation audit).
 * Source of truth for runtime gating is ConsentGatedScripts + CookieConsentProvider.
 * Public table: getPublicCookieTableRows() in cookie-inventory.ts.
 *
 * Trackers searched: gtag, GA/GTM/GA4, Meta fbq, Clarity, PostHog, Plausible,
 * Vercel Analytics, Sentry, Hotjar, LinkedIn Insight, TikTok Pixel,
 * localStorage, sessionStorage, document.cookie, cookies(), Set-Cookie.
 *
 * Found active / supported:
 * - Google Analytics gtag — only if NEXT_PUBLIC_GA_MEASUREMENT_ID; after analytics consent
 * - First-party analytics storage (attribution/visitor/session) — after analytics consent
 * - sessionStorage hj-analytics-utm-pending — may stage before consent (no third-party send)
 * - A/B hj_exp_* — after analytics consent only
 * - Cookie preference hj_cookie_consent_v1 — necessary, after choice
 *
 * Not present in codebase: GTM container, Clarity, PostHog, Plausible, Sentry,
 * Vercel Analytics, Hotjar, LinkedIn Insight, TikTok Pixel, document.cookie / Set-Cookie
 * for tracking, Meta fbq (env stub only — no Pixel script).
 */

export { getCookieInventory } from "@/lib/legal/cookie-inventory";
