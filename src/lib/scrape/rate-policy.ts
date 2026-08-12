/**
 * Politika sazeb (bez cheerio) — bezpečné pro client i server.
 *
 * Scraper fallback ONLY — not the mortgage-market SoT used on /sazby.
 * Mortgage-market baseline (Phase 6):
 * - KB 36m LTV75 personalized matrix 5.24; LTV85 5.64
 * - KB product-page conditional advertised-from 5.19 (not matrix)
 *
 * Legacy scraper “insider” fallback below tracks the conditional product-page
 * advertised-from package when DOM scrape fails. Do not confuse with matrix.
 */

/**
 * Scraper-only KB fallback when live scrape fails.
 * Aligns with current product-page conditional advertised-from package (~5.19),
 * not the LTV matrix (5.24 / 5.64).
 */
export const KB_INSIDER_RATES = {
  rateWithInsurance: 5.19,
  rateWithoutInsurance: 5.39,
} as const;

/**
 * Odhad přirážky bez pojišťovacího balíčku KB (životní + nemovitost u KP),
 * pokud scrape nenajde absolutní sazbu „bez pojištění“.
 */
export const KB_INSURANCE_PACKAGE_SURCHARGE_PP = 0.2;

/** Orientační tržní přirážka, pokud chybí sazba bez pojištění (ostatní banky). */
export const ORIENTATIONAL_WITHOUT_SURCHARGE = 0.3;
