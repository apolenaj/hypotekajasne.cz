import { calculateAnnuityPayment } from "@/lib/calculators";
import {
  FIXATION_ALERT_MONTHS,
  type RefinanceLoanProfile,
  type RefinanceRadarAlert,
  type RefinanceTimelineMilestone,
} from "@/lib/refinance-radar/types";
import { monthsUntilFixation } from "@/lib/refinance-radar/calculate";

function fmtCzk(n: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

export function buildTimelineMilestones(
  fixationEnd: string,
  now: Date = new Date()
): RefinanceTimelineMilestone[] {
  const monthsLeft = monthsUntilFixation(fixationEnd, now);
  if (monthsLeft == null) return [];

  const fixDate = Date.parse(fixationEnd);
  return FIXATION_ALERT_MONTHS.map((monthsBefore) => {
    const due = new Date(fixDate);
    due.setMonth(due.getMonth() - monthsBefore);
    let status: RefinanceTimelineMilestone["status"] = "upcoming";
    if (monthsLeft <= monthsBefore) status = "active";
    if (monthsLeft < monthsBefore - 1) status = "passed";
    return {
      monthsBefore,
      dueAt: due.toISOString(),
      status,
    };
  });
}

/**
 * Personalized alerts — never generic „sazby klesly“.
 */
export function generateRefinanceAlerts(input: {
  profile: RefinanceLoanProfile;
  marketRatePercent: number | null;
  emittedMilestones: Record<string, string>;
  now?: Date;
}): {
  alerts: RefinanceRadarAlert[];
  emittedMilestones: Record<string, string>;
} {
  const now = input.now ?? new Date();
  const monthsLeft = monthsUntilFixation(input.profile.fixationEnd, now);
  if (monthsLeft == null || input.marketRatePercent == null) {
    return { alerts: [], emittedMilestones: input.emittedMilestones };
  }

  const newPayment = Math.round(
    calculateAnnuityPayment(
      input.profile.loanBalanceCzk,
      input.marketRatePercent,
      input.profile.newTermYears
    )
  );
  const saving = input.profile.monthlyPaymentCzk - newPayment;
  const rateStr = input.marketRatePercent.toFixed(2).replace(".", ",");

  const alerts: RefinanceRadarAlert[] = [];
  const emitted = { ...input.emittedMilestones };

  for (const milestone of FIXATION_ALERT_MONTHS) {
    const key = `m${milestone}`;
    if (monthsLeft > milestone || monthsLeft < milestone - 1) continue;
    if (emitted[key]) continue;

    const title = `${milestone} ${milestone === 1 ? "měsíc" : milestone < 5 ? "měsíce" : "měsíců"} do konce fixace`;
    let body =
      `Při orientační sazbě ${rateStr} % by vaše měsíční splátka mohla být přibližně ${fmtCzk(newPayment)} (MODEL). `;
    body += `Současná splátka: ${fmtCzk(input.profile.monthlyPaymentCzk)} u ${input.profile.currentLender || "vaší banky"}.`;
    if (saving > 500) {
      body += ` Orientační rozdíl: −${fmtCzk(saving)}/měs. před poplatky.`;
    } else if (saving < -500) {
      body += ` Při této referenci by splátka mohla být vyšší — ověřte u specialisty.`;
    }

    alerts.push({
      id: `rr_${key}_${now.toISOString().slice(0, 10)}`,
      milestoneMonths: milestone,
      title,
      body,
      createdAt: now.toISOString(),
      claimKind: "MODEL",
      personalized: true,
    });
    emitted[key] = now.toISOString();
  }

  return { alerts, emittedMilestones: emitted };
}

export function runRefinanceRadarEvaluation(input: {
  profile: RefinanceLoanProfile;
  marketRatePercent: number | null;
  storeEmitted: Record<string, string>;
  existingAlerts: RefinanceRadarAlert[];
  now?: Date;
}): RefinanceRadarAlert[] {
  const { alerts, emittedMilestones } = generateRefinanceAlerts({
    profile: input.profile,
    marketRatePercent: input.marketRatePercent,
    emittedMilestones: input.storeEmitted,
    now: input.now,
  });
  input.storeEmitted = emittedMilestones;
  return [...alerts, ...input.existingAlerts].slice(0, 20);
}
