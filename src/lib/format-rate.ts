/** Zobrazení sazby — nikdy nevymýšlí číslo při chybějících datech. */
export function formatRateOrOnRequest(
  rate: number | null | undefined,
  { suffix = " %" }: { suffix?: string } = {}
): string {
  if (rate == null || !Number.isFinite(rate)) return "Na vyžádání";
  return `${rate.toFixed(2)}${suffix}`;
}

export function formatPaymentOrIndividual(
  payment: number | null | undefined,
  formatCurrency: (value: number) => string
): string {
  if (payment == null || !Number.isFinite(payment)) return "Individuálně";
  return formatCurrency(payment);
}
