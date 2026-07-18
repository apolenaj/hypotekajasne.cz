/** Zobrazení sazby — nikdy nevymýšlí číslo při chybějících datech. */

export function formatRateOrOnRequest(
  rate: number | null | undefined,
  {
    suffix = " %",
    orientational = false,
  }: { suffix?: string; orientational?: boolean } = {}
): string {
  if (rate == null || !Number.isFinite(rate)) return "Na vyžádání";
  const base = `${rate.toFixed(2)}${suffix}`;
  return orientational ? `${base} *orientačně` : base;
}

export function formatPaymentOrIndividual(
  payment: number | null | undefined,
  formatCurrency: (value: number) => string
): string {
  if (payment == null || !Number.isFinite(payment)) return "Individuálně";
  return formatCurrency(payment);
}

/** Banky s reálnou (neorientační) sazbou bez pojištění u klasické hypotéky. */
const REAL_CLASSIC_WITHOUT_BANK_IDS = new Set([
  "komercni-banka",
  "unicredit-bank",
]);

export function isClassicWithoutOrientational(bankId: string): boolean {
  return !REAL_CLASSIC_WITHOUT_BANK_IDS.has(bankId);
}

/** Americká sazba bez pojištění je po +0.3 fallbacku vždy orientační. */
export function isAmericanWithoutOrientational(_bankId?: string): boolean {
  return true;
}
