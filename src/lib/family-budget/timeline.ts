/**
 * Měsíční časový model rodinného rozpočtu.
 * Konstantní částky, pokud uživatel nezadá změnu. Bez skryté inflace / výnosu rezervy.
 */

import {
  amortizeKnownMonthlyPayment,
  calculateAnnuityPayment,
  roundMoney,
} from "@/lib/finance-math/core";
import type {
  ContributingAdult,
  FamilyBudgetInput,
  FamilyBudgetResult,
  HouseholdExpense,
  MonthBreakdown,
  MonthMarker,
  ParentalAllowancePlan,
} from "@/lib/family-budget/types";

function clampHorizon(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 60;
  return Math.min(240, Math.trunc(n));
}

function inWindow(
  month: number,
  start?: number,
  end?: number | null
): boolean {
  const s = start ?? 1;
  if (month < s) return false;
  if (end == null) return true;
  return month <= end;
}

/** Build maternity / allowance / gap / return phases for one adult. */
export function buildParenthoodPhases(
  plan: ParentalAllowancePlan
): {
  phases: ContributingAdult["phases"];
  allowanceSchedule: Array<{ month: number; amountCzk: number }>;
  oneTimeMonth: number;
  oneTimeCzk: number;
  childcareFromMonth: number;
  childcareMonthlyCzk: number;
  extraChildFromMonth: number;
  extraChildMonthlyCzk: number;
  returnStartMonth: number;
  allowanceExhaustedMonth: number | null;
} {
  const start = Math.max(1, Math.trunc(plan.startMonth));
  const matMonths = Math.max(0, Math.trunc(plan.maternityMonths));
  const gap = Math.max(0, Math.trunc(plan.gapMonthsBeforeReturn));
  const matEnd = start + matMonths - 1;
  const allowanceStart = matMonths > 0 ? matEnd + 1 : start;

  const schedule: Array<{ month: number; amountCzk: number }> = [];
  let balance = Math.max(0, plan.parentalAllowanceBalanceCzk);
  const draw = Math.max(0, plan.parentalAllowanceMonthlyDrawCzk);
  let allowanceExhaustedMonth: number | null = null;
  let cursor = allowanceStart;
  // Cap allowance draw window; stop when balance depletes.
  const maxAllowanceMonths = 48;
  for (let i = 0; i < maxAllowanceMonths && balance > 0 && draw > 0; i += 1) {
    const amount = Math.min(draw, balance);
    schedule.push({ month: cursor, amountCzk: amount });
    balance = roundMoney(balance - amount);
    if (balance <= 0) {
      allowanceExhaustedMonth = cursor;
      break;
    }
    cursor += 1;
  }

  const lastAllowanceMonth =
    schedule.length > 0 ? schedule[schedule.length - 1]!.month : matEnd;
  const gapStart = Math.max(allowanceStart, lastAllowanceMonth + 1);
  const gapEnd = gapStart + gap - 1;
  const returnStart =
    gap > 0
      ? gapEnd + 1
      : schedule.length > 0
        ? lastAllowanceMonth + 1
        : matMonths > 0
          ? matEnd + 1
          : start;

  const phases: ContributingAdult["phases"] = [];
  if (matMonths > 0) {
    phases.push({
      startMonth: start,
      endMonth: matEnd,
      amountCzk: Math.max(0, plan.maternityMonthlyCzk),
      replacesRegularWage: true,
      label: "Příjem v období mateřství (uživatelský předpoklad)",
    });
  }
  for (const row of schedule) {
    phases.push({
      startMonth: row.month,
      endMonth: row.month,
      amountCzk: row.amountCzk,
      replacesRegularWage: true,
      label: "Rodičovský příspěvek (uživatelský předpoklad)",
    });
  }
  if (gap > 0) {
    phases.push({
      startMonth: gapStart,
      endMonth: gapEnd,
      amountCzk: 0,
      replacesRegularWage: true,
      label: "Období bez dávky před návratem",
    });
  }
  phases.push({
    startMonth: returnStart,
    endMonth: null,
    amountCzk: Math.max(0, plan.returnMonthlyCzk),
    replacesRegularWage: true,
    label: plan.returnIsPartial
      ? "Návrat na částečný úvazek"
      : "Návrat na plný úvazek",
  });

  return {
    phases,
    allowanceSchedule: schedule,
    oneTimeMonth: plan.oneTimeChildCostMonth ?? start,
    oneTimeCzk: Math.max(0, plan.oneTimeChildCostsCzk),
    childcareFromMonth: returnStart,
    childcareMonthlyCzk: Math.max(0, plan.childcareAfterReturnMonthlyCzk),
    extraChildFromMonth: start,
    extraChildMonthlyCzk: Math.max(0, plan.extraMonthlyChildCostsCzk),
    returnStartMonth: returnStart,
    allowanceExhaustedMonth,
  };
}

function adultIncomeForMonth(
  adult: ContributingAdult,
  month: number,
  gapAdultId: string | null,
  gapStart: number,
  gapEnd: number,
  gapReplacement: number
): { amountCzk: number; notes: string[] } {
  const notes: string[] = [];
  if (
    gapAdultId &&
    adult.id === gapAdultId &&
    month >= gapStart &&
    month <= gapEnd
  ) {
    notes.push("Výpadek příjmu — použit náhradní příjem zadaný uživatelem.");
    return { amountCzk: Math.max(0, gapReplacement), notes };
  }

  const active = adult.phases.filter((p) =>
    inWindow(month, p.startMonth, p.endMonth)
  );
  const replacing = active.filter((p) => p.replacesRegularWage);
  if (replacing.length > 0) {
    // Highest-priority replacing phase: prefer the one with a label about gap/maternity;
    // otherwise sum only if user consciously stacked non-replacing — here we take max
    // of replacing amounts when multiple replace in same month (shouldn't stack wages).
    const amount = replacing.reduce((sum, p) => sum + Math.max(0, p.amountCzk), 0);
    // If multiple replacing phases wrongly overlap, still don't add regular wage.
    if (replacing.length > 1) {
      notes.push(
        "Více nahrazujících fází ve stejném měsíci — částky se sčítají jen pokud jste je zadali vědomě."
      );
    }
    return {
      amountCzk: roundMoney(amount + Math.max(0, adult.irregularIncludedMonthlyCzk)),
      notes,
    };
  }

  const extra = active
    .filter((p) => !p.replacesRegularWage)
    .reduce((s, p) => s + Math.max(0, p.amountCzk), 0);

  return {
    amountCzk: roundMoney(
      Math.max(0, adult.regularNetMonthlyCzk) +
        Math.max(0, adult.irregularIncludedMonthlyCzk) +
        extra
    ),
    notes,
  };
}

function expenseForMonth(
  expense: HouseholdExpense,
  month: number,
  livingMultiplier: number,
  rentEndsMonth: number | null
): number {
  if (!inWindow(month, expense.startMonth, expense.endMonth)) return 0;

  if (expense.category === "rent" && rentEndsMonth != null && month > rentEndsMonth) {
    return 0;
  }

  const mult =
    expense.kind === "essential" || expense.kind === "optional"
      ? livingMultiplier
      : 1;

  if (expense.cadence === "annual") {
    if (expense.paymentMonthOfYear != null) {
      // Model months are sequential from month 1; map to calendar offset from start.
      const calendarMonth = ((month - 1) % 12) + 1;
      if (calendarMonth !== expense.paymentMonthOfYear) return 0;
      return roundMoney(Math.max(0, expense.amountCzk) * mult);
    }
    // Averaged annual → monthly; only when no specific payment month.
    return roundMoney((Math.max(0, expense.amountCzk) / 12) * mult);
  }

  return roundMoney(Math.max(0, expense.amountCzk) * mult);
}

function mortgagePaymentAtMonth(
  input: FamilyBudgetInput,
  month: number
): { paymentCzk: number; markers: MonthMarker[] } {
  const markers: MonthMarker[] = [];
  const m = input.mortgage;
  if (!input.refixation.enabled) {
    return { paymentCzk: roundMoney(Math.max(0, m.monthlyPaymentCzk)), markers };
  }
  const refixMonth = Math.max(1, Math.trunc(input.refixation.month));
  if (month < refixMonth) {
    return { paymentCzk: roundMoney(Math.max(0, m.monthlyPaymentCzk)), markers };
  }
  if (month === refixMonth) markers.push("refixation");

  const monthsBefore = refixMonth - 1;
  const amortized = amortizeKnownMonthlyPayment({
    principal: m.principalCzk,
    annualRatePercent: m.annualRatePercent,
    monthlyPayment: m.monthlyPaymentCzk,
    months: monthsBefore,
  });
  const remaining = amortized.remainingPrincipalCzk;
  const remainingYears = Math.max(
    1 / 12,
    m.termYears - monthsBefore / 12
  );
  const newRate = m.annualRatePercent + input.refixation.rateIncreasePp;
  const payment = calculateAnnuityPayment(remaining, newRate, remainingYears);
  return { paymentCzk: roundMoney(Math.max(0, payment)), markers };
}

export function simulateFamilyBudget(
  input: FamilyBudgetInput
): FamilyBudgetResult {
  const horizon = clampHorizon(input.horizonMonths);
  const assumptions: string[] = [
    "Model používá konstantní částky, pokud nezadáte změnu. Neobsahuje skrytou inflaci, růst mezd ani výnos rezervy.",
    "Výsledek popisuje rozpočet podle zadaných údajů — nejde o posouzení banky ani o potvrzení nároku na dávky.",
    "Počáteční rezervou jsou likvidní peníze zbývající po akontaci, koupi, stěhování a již zahrnutých jednorázových nákladech.",
  ];

  let adults = input.adults.map((a) => ({ ...a, phases: [...a.phases] }));
  let extraExpenses: HouseholdExpense[] = [];
  let parenthoodMeta: ReturnType<typeof buildParenthoodPhases> | null = null;

  if (input.applyParenthood && input.parenthood.enabled) {
    parenthoodMeta = buildParenthoodPhases(input.parenthood);
    adults = adults.map((a) => {
      if (a.id !== input.parenthood.adultId) return a;
      return { ...a, phases: [...a.phases, ...parenthoodMeta!.phases] };
    });
    if (parenthoodMeta.oneTimeCzk > 0) {
      extraExpenses.push({
        id: "child-one-time",
        category: "children",
        kind: "one_time",
        label: "Jednorázové výdaje na dítě",
        amountCzk: parenthoodMeta.oneTimeCzk,
        cadence: "monthly",
        startMonth: parenthoodMeta.oneTimeMonth,
        endMonth: parenthoodMeta.oneTimeMonth,
      });
    }
    if (parenthoodMeta.extraChildMonthlyCzk > 0) {
      extraExpenses.push({
        id: "child-extra-monthly",
        category: "children",
        kind: "essential",
        label: "Další pravidelné výdaje na dítě",
        amountCzk: parenthoodMeta.extraChildMonthlyCzk,
        cadence: "monthly",
        startMonth: parenthoodMeta.extraChildFromMonth,
        endMonth: null,
      });
    }
    if (parenthoodMeta.childcareMonthlyCzk > 0) {
      extraExpenses.push({
        id: "childcare",
        category: "childcare",
        kind: "essential",
        label: "Péče o dítě po návratu do práce",
        amountCzk: parenthoodMeta.childcareMonthlyCzk,
        cadence: "monthly",
        startMonth: parenthoodMeta.childcareFromMonth,
        endMonth: null,
      });
    }
    assumptions.push(
      "Částky PPM a rodičovského příspěvku jsou uživatelský předpoklad, nikoli potvrzení nároku. Rodičovský příspěvek končí po vyčerpání zadaného zůstatku."
    );
  }

  const gap = input.incomeGap;
  const gapAdultId = gap.enabled ? gap.adultId : null;
  const gapStart = gap.enabled ? Math.max(1, gap.startMonth) : 0;
  const gapEnd = gap.enabled
    ? gapStart + Math.max(1, gap.durationMonths) - 1
    : -1;

  if (gap.enabled) {
    assumptions.push(
      "Výpadek příjmu používá pouze vámi zadaný náhradní příjem. Podpora v nezaměstnanosti, nemocenské ani pojistné se nepřidávají automaticky."
    );
  }
  if (input.refixation.enabled) {
    assumptions.push(
      `Refixace v měsíci ${input.refixation.month}: nová splátka z jistiny zbývající po předchozích splátkách, sazba +${input.refixation.rateIncreasePp} p. b., zbývající splatnost.`
    );
  }
  if (input.livingExpenseMultiplier !== 1) {
    assumptions.push(
      `Životní výdaje (nezbytné a volitelné) jsou vynásobené faktorem ${input.livingExpenseMultiplier}.`
    );
  }

  const allExpenses = [...input.expenses, ...extraExpenses];
  const months: MonthBreakdown[] = [];
  let reserve = roundMoney(Math.max(0, input.initialLiquidReserveCzk));
  let firstExhaustion: number | null = null;
  let lowestReserve = reserve;
  let deficitCount = 0;
  let worstMonth: number | null = null;
  let worstBalance = Number.POSITIVE_INFINITY;

  for (let month = 1; month <= horizon; month += 1) {
    const markers: MonthMarker[] = [];
    const notes: string[] = [];

    if (
      input.applyParenthood &&
      input.parenthood.enabled &&
      month === input.parenthood.startMonth
    ) {
      markers.push("parenthood_start");
    }
    if (
      parenthoodMeta &&
      month === parenthoodMeta.returnStartMonth
    ) {
      markers.push("return_to_work");
    }
    if (
      parenthoodMeta?.allowanceExhaustedMonth != null &&
      month === parenthoodMeta.allowanceExhaustedMonth
    ) {
      markers.push("allowance_exhausted");
      notes.push("Rodičovský příspěvek vyčerpán (zadaný zůstatek).");
    }
    if (input.rentEndsMonth != null && month === input.rentEndsMonth) {
      markers.push("rent_end");
    }

    let income = 0;
    for (const adult of adults) {
      const part = adultIncomeForMonth(
        adult,
        month,
        gapAdultId,
        gapStart,
        gapEnd,
        gap.replacementMonthlyCzk
      );
      income += part.amountCzk;
      notes.push(...part.notes);
    }
    income += Math.max(0, input.otherMonthlyIncomeCzk);
    income += Math.max(0, input.rentalCashflowMonthlyCzk);
    if (input.rentalCashflowMonthlyCzk > 0) {
      if (month === 1) {
        notes.push(
          input.rentalAlreadyNetOfCostsAndLoans
            ? "Nájemní tok je zadán po nákladech a splátkách — znovu se neodečítají."
            : "Nájemní tok může ještě obsahovat náklady/splátky — zkontrolujte, zda je neodečítáte dvakrát ve výdajích."
        );
      }
    }
    income = roundMoney(income);

    let essential = 0;
    let optional = 0;
    let plannedSaving = 0;
    let oneTime = 0;

    for (const exp of allExpenses) {
      if (exp.category === "mortgage") continue;
      const amt = expenseForMonth(
        exp,
        month,
        input.livingExpenseMultiplier,
        input.rentEndsMonth
      );
      if (amt <= 0) continue;
      if (exp.kind === "one_time") {
        oneTime += amt;
        markers.push("one_time");
      } else if (exp.kind === "planned_saving") {
        plannedSaving += amt;
      } else if (exp.kind === "optional") {
        optional += amt;
      } else {
        essential += amt;
      }
    }

    const mortgage = mortgagePaymentAtMonth(input, month);
    markers.push(...mortgage.markers);

    essential = roundMoney(essential);
    optional = roundMoney(optional);
    plannedSaving = roundMoney(plannedSaving);
    oneTime = roundMoney(oneTime);
    const mortgagePayment = mortgage.paymentCzk;

    const expenseTotal = roundMoney(
      essential + optional + oneTime + mortgagePayment
    );
    const operatingBalance = roundMoney(income - expenseTotal);
    const balanceAfterSaving = roundMoney(operatingBalance - plannedSaving);

    const reserveStart = reserve;
    let reserveEnd = roundMoney(reserveStart + balanceAfterSaving);
    let uncovered = 0;
    if (reserveEnd < 0) {
      uncovered = roundMoney(-reserveEnd);
      if (firstExhaustion == null) firstExhaustion = month;
      // Keep showing negative as uncovered path; reserve floor display uses actual.
    }
    reserve = reserveEnd;
    if (reserveEnd < lowestReserve) lowestReserve = reserveEnd;
    if (operatingBalance < 0) deficitCount += 1;
    if (operatingBalance < worstBalance) {
      worstBalance = operatingBalance;
      worstMonth = month;
    }

    months.push({
      month,
      incomeTotalCzk: income,
      expenseTotalCzk: expenseTotal,
      mortgagePaymentCzk: mortgagePayment,
      essentialExpenseCzk: essential,
      optionalExpenseCzk: optional,
      plannedSavingCzk: plannedSaving,
      oneTimeExpenseCzk: oneTime,
      operatingBalanceCzk: operatingBalance,
      balanceAfterSavingCzk: balanceAfterSaving,
      reserveStartCzk: reserveStart,
      reserveEndCzk: reserveEnd,
      uncoveredDeficitCzk: uncovered,
      markers: Array.from(new Set(markers)),
      notes,
    });
  }

  const sample = months.slice(0, Math.min(12, months.length));
  const typicalMonthlySurplusCzk = roundMoney(
    sample.reduce((s, m) => s + m.operatingBalanceCzk, 0) / Math.max(1, sample.length)
  );
  const typicalMonthlyAfterSavingCzk = roundMoney(
    sample.reduce((s, m) => s + m.balanceAfterSavingCzk, 0) /
      Math.max(1, sample.length)
  );

  // Min reserve target from first month essentials + mortgage (stated period).
  const basisMonth = months[0];
  const basisEssentialWithMortgage = basisMonth
    ? basisMonth.essentialExpenseCzk + basisMonth.mortgagePaymentCzk
    : 0;
  const minReserveTargetCzk =
    input.minReserveMode === "months_essential"
      ? roundMoney(basisEssentialWithMortgage * Math.max(0, input.minReserveMonths))
      : roundMoney(Math.max(0, input.minReserveCzk));
  const minReserveBasisLabel =
    input.minReserveMode === "months_essential"
      ? `Nezbytné výdaje včetně splátky z 1. měsíce modelu × ${input.minReserveMonths}`
      : "Fixní částka zadaná uživatelem";

  const additionalCapitalForMinReserveCzk = Math.max(
    0,
    roundMoney(minReserveTargetCzk - lowestReserve)
  );

  const hasUncovered = months.some((m) => m.uncoveredDeficitCzk > 0);
  const drawsReserve = months.some((m) => m.balanceAfterSavingCzk < 0);
  let verdict: FamilyBudgetResult["verdict"] = "surplus";
  let verdictText =
    "Rozpočet je podle zadaného scénáře přebytkový.";
  if (hasUncovered) {
    verdict = "uncovered_deficit";
    const m = months.find((x) => x.uncoveredDeficitCzk > 0)!;
    verdictText = `V měsíci ${m.month} vzniká nekrytý schodek.`;
  } else if (drawsReserve) {
    verdict = "drawing_reserve";
    verdictText = "V tomto období budete čerpat rezervu.";
  }

  return {
    months,
    typicalMonthlySurplusCzk,
    typicalMonthlyAfterSavingCzk,
    worstMonth,
    worstOperatingBalanceCzk: roundMoney(
      Number.isFinite(worstBalance) ? worstBalance : 0
    ),
    deficitMonthCount: deficitCount,
    lowestReserveCzk: roundMoney(lowestReserve),
    firstReserveExhaustionMonth: firstExhaustion,
    additionalCapitalForMinReserveCzk,
    minReserveTargetCzk,
    minReserveBasisLabel,
    verdict,
    verdictText,
    assumptions,
  };
}

export type ScenarioPresetId =
  | "current"
  | "parenthood"
  | "income_gap_3"
  | "income_gap_6"
  | "refix_plus_2"
  | "expenses_plus_10"
  | "combo";

export function applyScenarioPreset(
  base: FamilyBudgetInput,
  preset: ScenarioPresetId
): FamilyBudgetInput {
  const next: FamilyBudgetInput = {
    ...base,
    parenthood: { ...base.parenthood, enabled: false },
    incomeGap: { ...base.incomeGap, enabled: false },
    refixation: { ...base.refixation, enabled: false },
    applyParenthood: false,
    livingExpenseMultiplier: 1,
  };

  switch (preset) {
    case "current":
      return next;
    case "parenthood":
      return {
        ...next,
        applyParenthood: true,
        parenthood: { ...base.parenthood, enabled: true },
      };
    case "income_gap_3":
      return {
        ...next,
        incomeGap: {
          ...base.incomeGap,
          enabled: true,
          durationMonths: 3,
        },
      };
    case "income_gap_6":
      return {
        ...next,
        incomeGap: {
          ...base.incomeGap,
          enabled: true,
          durationMonths: 6,
        },
      };
    case "refix_plus_2":
      return {
        ...next,
        refixation: {
          enabled: true,
          month: base.refixation.month || 36,
          rateIncreasePp: 2,
        },
      };
    case "expenses_plus_10":
      return { ...next, livingExpenseMultiplier: 1.1 };
    case "combo":
      return { ...base };
    default:
      return next;
  }
}
