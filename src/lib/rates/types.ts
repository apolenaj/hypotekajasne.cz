/**
 * MortgageRateRecord — kanonický model živých/modelových sazeb (PROMPT 6).
 * Nikdy nevydávat MODEL za bankovní nabídku.
 */

export type MortgageRateStatus =
  | "LIVE"
  | "VERIFIED"
  | "STALE"
  | "MODEL"
  | "UNAVAILABLE";

export type MortgageRateRecord = {
  id: string;
  provider: string;
  product: string;
  rate: number | null;
  apr: number | null;
  ltv: number | null;
  fixation: string | null;
  conditions: string[];
  sourceUrl: string | null;
  fetchedAt: string | null;
  validatedAt: string | null;
  validFrom: string | null;
  status: MortgageRateStatus;
  /** Interní poznámka (nesmí se tvářit jako nabídka banky) */
  notes: string | null;
};

export const LIVE_RATES_UNAVAILABLE_MESSAGE =
  "Aktuální živé sazby momentálně nejsou dostupné.";

export function modelRateDisclaimer(ratePercent: number): string {
  const formatted = ratePercent.toFixed(2).replace(".", ",");
  return `Výpočet používá modelovou sazbu ${formatted} % p.a. Nejde o aktuální nabídku banky.`;
}
