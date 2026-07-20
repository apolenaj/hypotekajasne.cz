import { calculateAnnuityPayment } from "@/lib/calculators";

/** Zůstatek jistiny po `yearsElapsed` letech anuity. */
export function remainingLoanBalance(
  principal: number,
  annualRatePercent: number,
  termYears: number,
  yearsElapsed: number
): number {
  if (principal <= 0) return 0;
  if (yearsElapsed <= 0) return principal;
  if (yearsElapsed >= termYears) return 0;

  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  const k = Math.round(yearsElapsed * 12);
  if (r === 0) {
    return Math.max(0, principal * (1 - k / n));
  }
  const payment = calculateAnnuityPayment(principal, annualRatePercent, termYears);
  const factor = Math.pow(1 + r, k);
  const balance =
    principal * factor - (payment * (factor - 1)) / r;
  return Math.max(0, balance);
}

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

/**
 * Newton-Raphson IRR na periodických CF.
 * cf[0] obvykle záporný (investice).
 */
export function calculateIrr(
  cashFlows: number[],
  guess = 0.08,
  maxIter = 100,
  tol = 1e-7
): number | null {
  if (cashFlows.length < 2) return null;
  const hasPos = cashFlows.some((c) => c > 0);
  const hasNeg = cashFlows.some((c) => c < 0);
  if (!hasPos || !hasNeg) return null;

  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpvdR = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      if (t > 0) {
        dNpvdR -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }
    if (Math.abs(dNpvdR) < 1e-12) return null;
    const next = rate - npv / dNpvdR;
    if (!Number.isFinite(next)) return null;
    if (Math.abs(next - rate) < tol) {
      return next;
    }
    rate = next;
    if (rate <= -0.999) rate = -0.999;
  }
  return null;
}

/**
 * XIRR — cashFlows[i] k dates[i] (Date).
 * Vrací roční míru.
 */
export function calculateXirr(
  cashFlows: number[],
  dates: Date[],
  guess = 0.08,
  maxIter = 100,
  tol = 1e-7
): number | null {
  if (cashFlows.length !== dates.length || cashFlows.length < 2) return null;
  const t0 = dates[0].getTime();
  const years = dates.map((d) => (d.getTime() - t0) / (365.25 * 24 * 3600 * 1000));

  const hasPos = cashFlows.some((c) => c > 0);
  const hasNeg = cashFlows.some((c) => c < 0);
  if (!hasPos || !hasNeg) return null;

  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpvdR = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      const y = years[j];
      const denom = Math.pow(1 + rate, y);
      npv += cashFlows[j] / denom;
      if (y !== 0) {
        dNpvdR -= (y * cashFlows[j]) / Math.pow(1 + rate, y + 1);
      }
    }
    if (Math.abs(dNpvdR) < 1e-12) return null;
    const next = rate - npv / dNpvdR;
    if (!Number.isFinite(next)) return null;
    if (Math.abs(next - rate) < tol) return next;
    rate = next;
    if (rate <= -0.999) rate = -0.999;
  }
  return null;
}
