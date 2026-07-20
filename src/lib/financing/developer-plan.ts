/**
 * Developer payment plan = schedule fází, nikoli anuitní hypotéka.
 */

import type {
  DeveloperPhaseResult,
  DeveloperPlanPhase,
} from "@/lib/financing/types";

export function assertSchedulePercents(
  phases: DeveloperPlanPhase[]
): void {
  const sum = phases.reduce((acc, p) => acc + p.percentOfPrice, 0);
  if (Math.abs(sum - 100) > 0.01) {
    throw new Error(
      `Developer schedule must sum to 100 %, got ${sum.toFixed(2)} %`
    );
  }
}

export function calculateDeveloperPlanSchedule(
  propertyPrice: number,
  phases: DeveloperPlanPhase[]
): {
  phases: DeveloperPhaseResult[];
  totalPaid: number;
  peakMonthlyPayment: number;
} {
  assertSchedulePercents(phases);

  const price = Math.max(0, propertyPrice);
  let peak = 0;

  const results: DeveloperPhaseResult[] = phases.map((phase) => {
    const amount = Math.round((price * phase.percentOfPrice) / 100);
    const months = Math.max(1, Math.round(phase.durationMonths));
    const monthlyPayment =
      amount === 0
        ? null
        : months === 1
          ? amount
          : Math.round(amount / months);

    if (monthlyPayment != null && monthlyPayment > peak) {
      peak = monthlyPayment;
    }

    return {
      id: phase.id,
      label: phase.label,
      percentOfPrice: phase.percentOfPrice,
      amount,
      durationMonths: months,
      monthlyPayment: amount === 0 ? null : monthlyPayment,
    };
  });

  return {
    phases: results,
    totalPaid: Math.round(price),
    peakMonthlyPayment: peak,
  };
}
