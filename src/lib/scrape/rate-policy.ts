/**
 * Politika sazeb (bez cheerio) — bezpečné pro client i server.
 */

/** Insider sazby KB (reálná tržní data od provozovatele). */
export const KB_INSIDER_RATES = {
  rateWithInsurance: 4.74,
  rateWithoutInsurance: 4.94,
} as const;

/** Orientační tržní přirážka, pokud chybí sazba bez pojištění. */
export const ORIENTATIONAL_WITHOUT_SURCHARGE = 0.3;
