/**
 * Politika sazeb (bez cheerio) — bezpečné pro client i server.
 *
 * KB (ověřeno 2026-08 na https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka):
 * - Inzerovaná „od“ sazba 5,14 % p.a. je podmíněná mj. životním + majetkovým
 *   pojištěním u Komerční pojišťovny, příjmy na účet KB a PENB A/B.
 * - Fallback níže slouží jen když scrape selže / DOM se změní.
 */

/**
 * Fallback KB — primární inzerovaná sazba „s pojištěním“ (balíček podmínek).
 * Web KB neuvádí samostatnou sazbu bez pojištění; historicky 2× 0,1 p.b.
 * (životní + nemovitost u KP) → odhad bez pojištění = +0,20 p.b.
 */
export const KB_INSIDER_RATES = {
  rateWithInsurance: 5.14,
  rateWithoutInsurance: 5.34,
} as const;

/**
 * Odhad přirážky bez pojišťovacího balíčku KB (životní + nemovitost u KP),
 * pokud scrape nenajde absolutní sazbu „bez pojištění“.
 */
export const KB_INSURANCE_PACKAGE_SURCHARGE_PP = 0.2;

/** Orientační tržní přirážka, pokud chybí sazba bez pojištění (ostatní banky). */
export const ORIENTATIONAL_WITHOUT_SURCHARGE = 0.3;
