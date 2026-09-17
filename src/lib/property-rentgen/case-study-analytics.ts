/**
 * Case-study analytics on top of the control model — no parallel engine.
 * Stress, refix, reserve path, sale, sensitivity, synthetic market comps.
 */

import {
  CONTROL_MODEL_INPUTS,
  CONTROL_MODEL_VERSION,
  amortizeFirstMonths,
  computeMonthlyAnnuity,
  computeOperatingSurplusAfterReserve,
  otherAnnualCosts,
  runControlModel,
  runControlScenarios,
  type ControlModelInputs,
  type ControlModelResult,
  type ControlScenarioResult,
} from "@/lib/property-rentgen/control-model";

export const CASE_STUDY_ID = "modelovy-byt-60m2-v1" as const;
export const CASE_STUDY_LABEL_CS =
  "Modelový byt 60 m² — demonstrační případová studie" as const;

export type ProvenanceKind =
  | "modelovy_predpoklad"
  | "vypocteno"
  | "synteticka_srovnavaci_sada"
  | "neznamo"
  | "zadano_v_modelu";

export type FindingBlock = {
  id: string;
  chapter: string;
  podklad: string;
  zjisteni: string;
  dopad: string;
  overit: string;
  provenance: ProvenanceKind;
};

export type SyntheticListing = {
  id: string;
  kind: "sale" | "rent";
  label: string;
  areaM2: number;
  priceOrRentCzk: number;
  pricePerM2Czk: number;
  notes: string;
  provenance: "synteticka_srovnavaci_sada";
  accessDate: string;
  /** Intentionally not a real URL */
  sourceNote: string;
};

export type SensitivityCell = {
  monthlyRentCzk: number;
  annualRatePercent: number;
  monthlyCashFlowCzk: number;
};

export type ReserveMonth = {
  month: number;
  openingCzk: number;
  inflowCzk: number;
  outflowCzk: number;
  closingCzk: number;
  note: string;
};

export type RefixResult = {
  fixationYears: number;
  balanceAtRefixCzk: number;
  remainingTermYears: number;
  basePaymentCzk: number;
  shockedRatePercent: number;
  shockedPaymentCzk: number;
  paymentDeltaCzk: number;
  monthlyCashFlowAfterRefixCzk: number;
};

export type SaleScenario = {
  id: string;
  label: string;
  holdYears: number;
  assumedSalePriceCzk: number;
  sellingCostRate: number;
  sellingCostsCzk: number;
  loanBalanceCzk: number;
  netBeforeTaxCzk: number;
  notes: string;
};

export type CaseStudyBundle = {
  caseId: typeof CASE_STUDY_ID;
  modelVersion: typeof CONTROL_MODEL_VERSION;
  generatedAt: string;
  model: ControlModelResult;
  scenarios: ControlScenarioResult[];
  sensitivity: {
    rents: number[];
    rates: number[];
    cells: SensitivityCell[];
  };
  vacancyStress: {
    emptyMonths: number;
    /** Average vacancy already in base CF — not reapplied during empty months */
    noteCs: string;
    monthlyOpsWithoutVacancyFactorCzk: number;
    monthlyPaymentCzk: number;
    reservePath: ReserveMonth[];
    minReserveCzk: number;
    extraCapitalNeededCzk: number;
  };
  emergencyRepair: {
    amountCzk: number;
    month: number;
    noteCs: string;
    reservePath: ReserveMonth[];
    minReserveCzk: number;
    extraCapitalNeededCzk: number;
  };
  refix: RefixResult;
  longTerm: Array<{
    year: number;
    rentCzk: number;
    paymentCzk: number;
    netCfCzk: number;
    loanBalanceCzk: number;
    propertyValueCzk: number;
    equityCzk: number;
  }>;
  sales: SaleScenario[];
  saleListings: SyntheticListing[];
  rentListings: SyntheticListing[];
  findings: FindingBlock[];
  whatPremiumAddsCs: string[];
  pageTargets: { digital: string; premium: string };
};

const SENS_RENTS = [18_000, 19_000, 20_000, 21_000, 22_000];
const SENS_RATES = [3.8, 4.8, 5.8, 6.8];

function sensitivityCashFlow(
  input: ControlModelInputs,
  monthlyRentCzk: number,
  annualRatePercent: number
): number {
  const other = otherAnnualCosts(input);
  const ops = computeOperatingSurplusAfterReserve({
    monthlyRentCzk,
    vacancyRate: input.vacancyRate,
    managementFeeRate: input.managementFeeRate,
    otherAnnualCostsCzk: other,
  });
  const payment = computeMonthlyAnnuity(
    input.loanAmountCzk,
    annualRatePercent,
    input.termYears
  );
  return ops.operatingSurplusAfterReserveCzk / 12 - payment;
}

/**
 * During explicit empty months we do NOT also apply the average vacancy %.
 * Collected rent = 0; management = 0; owner costs + insurance + tax + maint continue;
 * debt service continues. Opening reserve = cashReserveCzk; no CF surplus added.
 */
function buildVacancyStressPath(
  model: ControlModelResult,
  emptyMonths: number
): CaseStudyBundle["vacancyStress"] {
  const input = model.inputs;
  const fixedMonthly =
    input.ownerBuildingCostsAnnualCzk / 12 +
    input.insuranceAnnualCzk / 12 +
    input.propertyTaxAnnualCzk / 12 +
    input.unitMaintenanceReserveAnnualCzk / 12;
  const payment = model.monthlyPaymentCzk;
  const path: ReserveMonth[] = [];
  let bal = input.cashReserveCzk;
  let min = bal;

  for (let m = 1; m <= emptyMonths; m += 1) {
    const opening = bal;
    const outflow = fixedMonthly + payment;
    const closing = opening - outflow;
    path.push({
      month: m,
      openingCzk: opening,
      inflowCzk: 0,
      outflowCzk: outflow,
      closingCzk: closing,
      note: "Prázdný byt — bez průměrného výpadku (0 % místo 5 %)",
    });
    bal = closing;
    if (closing < min) min = closing;
  }

  return {
    emptyMonths,
    noteCs:
      "Stresový scénář prázdného bytu nepoužívá zároveň průměrný roční výpadek 5 %. V těchto měsících je inkaso 0 Kč.",
    monthlyOpsWithoutVacancyFactorCzk: -fixedMonthly,
    monthlyPaymentCzk: payment,
    reservePath: path,
    minReserveCzk: min,
    extraCapitalNeededCzk: min < 0 ? Math.abs(min) : 0,
  };
}

function buildEmergencyRepairPath(
  model: ControlModelResult,
  amountCzk: number,
  month: number
): CaseStudyBundle["emergencyRepair"] {
  const input = model.inputs;
  const monthlyCf = model.monthlyCashFlowCzk;
  const path: ReserveMonth[] = [];
  let bal = input.cashReserveCzk;
  let min = bal;
  const horizon = Math.max(month + 2, 6);

  for (let m = 1; m <= horizon; m += 1) {
    const opening = bal;
    const inflow = monthlyCf >= 0 ? monthlyCf : 0;
    const baseOut = monthlyCf < 0 ? Math.abs(monthlyCf) : 0;
    const repair = m === month ? amountCzk : 0;
    const outflow = baseOut + repair;
    const closing = opening + inflow - outflow;
    path.push({
      month: m,
      openingCzk: opening,
      inflowCzk: inflow,
      outflowCzk: outflow,
      closingCzk: closing,
      note:
        repair > 0
          ? `Jednorázová modelová oprava ${amountCzk.toLocaleString("cs-CZ")} Kč (není součástí běžné rezervy na údržbu)`
          : "Základní měsíční tok modelu",
    });
    bal = closing;
    if (closing < min) min = closing;
  }

  return {
    amountCzk,
    month,
    noteCs:
      "Mimořádná oprava je oddělená od měsíční rezervy na údržbu — nepočítá se dvakrát.",
    reservePath: path,
    minReserveCzk: min,
    extraCapitalNeededCzk: min < 0 ? Math.abs(min) : 0,
  };
}

function buildRefix(
  model: ControlModelResult,
  fixationYears: number,
  shockedRatePercent: number
): RefixResult {
  const months = fixationYears * 12;
  const amort = amortizeFirstMonths(
    model.inputs.loanAmountCzk,
    model.inputs.annualRatePercent,
    model.inputs.termYears,
    months
  );
  const last = amort.rows[amort.rows.length - 1];
  const balance = last?.closingBalanceCzk ?? model.inputs.loanAmountCzk;
  const remainingTermYears = model.inputs.termYears - fixationYears;
  const shockedPayment = computeMonthlyAnnuity(
    balance,
    shockedRatePercent,
    remainingTermYears
  );
  const opsMonthly = model.operatingSurplusAfterReserveCzk / 12;

  return {
    fixationYears,
    balanceAtRefixCzk: balance,
    remainingTermYears,
    basePaymentCzk: model.monthlyPaymentCzk,
    shockedRatePercent,
    shockedPaymentCzk: shockedPayment,
    paymentDeltaCzk: shockedPayment - model.monthlyPaymentCzk,
    monthlyCashFlowAfterRefixCzk: opsMonthly - shockedPayment,
  };
}

function buildLongTerm(model: ControlModelResult, years: number) {
  const input = model.inputs;
  const appreciationPa = 0.02; // modelový předpoklad
  const rentGrowthPa = 0.02;
  const rows = [];
  for (let y = 1; y <= years; y += 1) {
    const months = y * 12;
    const amort = amortizeFirstMonths(
      input.loanAmountCzk,
      input.annualRatePercent,
      input.termYears,
      months
    );
    const last = amort.rows[amort.rows.length - 1];
    const balance = last?.closingBalanceCzk ?? 0;
    const rent = input.monthlyRentCzk * Math.pow(1 + rentGrowthPa, y - 1);
    const other = otherAnnualCosts(input);
    const ops = computeOperatingSurplusAfterReserve({
      monthlyRentCzk: rent,
      vacancyRate: input.vacancyRate,
      managementFeeRate: input.managementFeeRate,
      otherAnnualCostsCzk: other,
    });
    const payment = model.monthlyPaymentCzk;
    const netCf = ops.operatingSurplusAfterReserveCzk / 12 - payment;
    const propertyValue =
      input.purchasePriceCzk * Math.pow(1 + appreciationPa, y);
    rows.push({
      year: y,
      rentCzk: rent,
      paymentCzk: payment,
      netCfCzk: netCf,
      loanBalanceCzk: balance,
      propertyValueCzk: propertyValue,
      equityCzk: Math.max(0, propertyValue - balance),
    });
  }
  return rows;
}

function buildSales(model: ControlModelResult): SaleScenario[] {
  const longTerm = buildLongTerm(model, 10);
  const y5 = longTerm[4];
  const y10 = longTerm[9];
  const costRate = 0.04; // modelové prodejní náklady (provize+právní) — ne daň

  const mk = (
    id: string,
    label: string,
    holdYears: number,
    row: (typeof longTerm)[0],
    priceMult: number
  ): SaleScenario => {
    const price = row.propertyValueCzk * priceMult;
    const costs = price * costRate;
    return {
      id,
      label,
      holdYears,
      assumedSalePriceCzk: price,
      sellingCostRate: costRate,
      sellingCostsCzk: costs,
      loanBalanceCzk: row.loanBalanceCzk,
      netBeforeTaxCzk: price - costs - row.loanBalanceCzk,
      notes:
        "Čistý výstup před daní z příjmů / FO. Konkrétní daňová povinnost není ověřena — neuvádíme ji jako jistotu.",
    };
  };

  return [
    mk("y5_base", "Prodej po 5 letech (modelová cena)", 5, y5!, 1),
    mk("y5_low", "Prodej po 5 letech (−10 % k modelu)", 5, y5!, 0.9),
    mk("y10_base", "Prodej po 10 letech (modelová cena)", 10, y10!, 1),
  ];
}

function buildSyntheticListings(accessDate: string): {
  sale: SyntheticListing[];
  rent: SyntheticListing[];
} {
  const sale: SyntheticListing[] = [
    {
      id: "S1",
      kind: "sale",
      label: "Syntetická nabídka A — 58 m², 3+kk",
      areaM2: 58,
      priceOrRentCzk: 3_950_000,
      pricePerM2Czk: Math.round(3_950_000 / 58),
      notes: "Nižší patro, bez balkonu — omezená srovnatelnost",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
    {
      id: "S2",
      kind: "sale",
      label: "Syntetická nabídka B — 62 m², 2+kk",
      areaM2: 62,
      priceOrRentCzk: 4_350_000,
      pricePerM2Czk: Math.round(4_350_000 / 62),
      notes: "Po rekonstrukci, výtah — vyšší konec pásma",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
    {
      id: "S3",
      kind: "sale",
      label: "Syntetická nabídka C — 60 m², 2+kk",
      areaM2: 60,
      priceOrRentCzk: 4_150_000,
      pricePerM2Czk: Math.round(4_150_000 / 60),
      notes: "Nejbližší plocha; stav interiéru neověřen",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
    {
      id: "S4",
      kind: "sale",
      label: "Syntetická nabídka D — 65 m², 3+kk",
      areaM2: 65,
      priceOrRentCzk: 4_580_000,
      pricePerM2Czk: Math.round(4_580_000 / 65),
      notes: "Větší dispozice — korekce dolů při srovnání",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
  ];

  const rent: SyntheticListing[] = [
    {
      id: "R1",
      kind: "rent",
      label: "Syntetický nájem A — 55 m²",
      areaM2: 55,
      priceOrRentCzk: 18_500,
      pricePerM2Czk: Math.round(18_500 / 55),
      notes: "Bez vybavení, služby zvlášť",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
    {
      id: "R2",
      kind: "rent",
      label: "Syntetický nájem B — 60 m²",
      areaM2: 60,
      priceOrRentCzk: 20_500,
      pricePerM2Czk: Math.round(20_500 / 60),
      notes: "Zařízené — blízké modelovému nájmu",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
    {
      id: "R3",
      kind: "rent",
      label: "Syntetický nájem C — 63 m²",
      areaM2: 63,
      priceOrRentCzk: 21_800,
      pricePerM2Czk: Math.round(21_800 / 63),
      notes: "Novější dům — horní okraj",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
    {
      id: "R4",
      kind: "rent",
      label: "Syntetický nájem D — 58 m²",
      areaM2: 58,
      priceOrRentCzk: 19_200,
      pricePerM2Czk: Math.round(19_200 / 58),
      notes: "Delší neobsazenost v inzerátu neuváděna",
      provenance: "synteticka_srovnavaci_sada",
      accessDate,
      sourceNote: "Modelový podklad vytvořený pro demonstraci analýzy (bez URL)",
    },
  ];

  return { sale, rent };
}

function buildFindings(bundle: {
  model: ControlModelResult;
  vacancyStress: CaseStudyBundle["vacancyStress"];
  emergencyRepair: CaseStudyBundle["emergencyRepair"];
  refix: RefixResult;
  saleListings: SyntheticListing[];
  rentListings: SyntheticListing[];
}): FindingBlock[] {
  const m = bundle.model;
  const salePsm = bundle.saleListings.map((l) => l.pricePerM2Czk);
  const saleMin = Math.min(...salePsm);
  const saleMax = Math.max(...salePsm);
  const rentVals = bundle.rentListings.map((l) => l.priceOrRentCzk);
  const rentMin = Math.min(...rentVals);
  const rentMax = Math.max(...rentVals);

  return [
    {
      id: "f-cash",
      chapter: "Hotovost",
      podklad: "Vstupy modelu: cena, úvěr, úpravy, vedlejší, rezerva",
      zjisteni: `Potřebná vlastní hotovost včetně rezervy je ${Math.round(m.totalOwnCashIncludingReserveCzk).toLocaleString("cs-CZ")} Kč.`,
      dopad: "Bez této částky nelze scénář financovat tak, jak je modelován.",
      overit: "Skutečná výše vedlejších nákladů a nutných úprav po prohlídce.",
      provenance: "vypocteno",
    },
    {
      id: "f-cf",
      chapter: "Peněžní tok",
      podklad: "Nájem, výpadek, správa, provozní náklady, anuita",
      zjisteni: `Základní měsíční tok vychází přibližně ${Math.round(m.monthlyCashFlowCzk).toLocaleString("cs-CZ")} Kč před daní z příjmů.`,
      dopad: "Investor průměrně doplácí — nejde o pasivní přebytek.",
      overit: "Skutečný nájemní předpis a náklady SVJ za 12 měsíců.",
      provenance: "vypocteno",
    },
    {
      id: "f-sale-band",
      chapter: "Srovnání prodeje",
      podklad: "Syntetická srovnávací sada (4 nabídky)",
      zjisteni: `Modelové pásmo ceny/m² ${saleMin.toLocaleString("cs-CZ")}–${saleMax.toLocaleString("cs-CZ")} Kč; modelový byt ${Math.round(m.pricePerM2Czk).toLocaleString("cs-CZ")} Kč/m².`,
      dopad: "Kupní cena leží uvnitř modelového pásma, ale sada neprokazuje tržní úroveň.",
      overit: "Dohledat aktuální veřejné nabídky se zdrojem a datem.",
      provenance: "synteticka_srovnavaci_sada",
    },
    {
      id: "f-rent-band",
      chapter: "Srovnání nájmu",
      podklad: "Syntetická srovnávací sada nájmů (4 nabídky)",
      zjisteni: `Modelové nájmy ${rentMin.toLocaleString("cs-CZ")}–${rentMax.toLocaleString("cs-CZ")} Kč/měs.; vstup ${Math.round(m.inputs.monthlyRentCzk).toLocaleString("cs-CZ")} Kč.`,
      dopad: "Zadaný nájem je uvnitř pásma, ale není ověřený z inzerátů.",
      overit: "Ověřit dosažitelné nájemné u srovnatelných bytů v lokalitě.",
      provenance: "synteticka_srovnavaci_sada",
    },
    {
      id: "f-vacancy",
      chapter: "Prázdný byt",
      podklad: `Stres ${bundle.vacancyStress.emptyMonths} měsíců bez inkasa`,
      zjisteni:
        bundle.vacancyStress.extraCapitalNeededCzk > 0
          ? `Rezerva klesne do záporu; potřeba dodatečného kapitálu cca ${Math.round(bundle.vacancyStress.extraCapitalNeededCzk).toLocaleString("cs-CZ")} Kč.`
          : `Rezerva ${Math.round(m.inputs.cashReserveCzk).toLocaleString("cs-CZ")} Kč stres pokrývá (min. zůstatek ${Math.round(bundle.vacancyStress.minReserveCzk).toLocaleString("cs-CZ")} Kč).`,
      dopad: "Průměrný výpadek 5 % nestačí jako náhrada za několik měsíců prázdna.",
      overit: "Plán likvidity a strategie hledání nájemníka.",
      provenance: "vypocteno",
    },
    {
      id: "f-repair",
      chapter: "Mimořádná oprava",
      podklad: `Modelová oprava ${bundle.emergencyRepair.amountCzk.toLocaleString("cs-CZ")} Kč v měsíci ${bundle.emergencyRepair.month}`,
      zjisteni:
        bundle.emergencyRepair.extraCapitalNeededCzk > 0
          ? `Po opravě chybí cca ${Math.round(bundle.emergencyRepair.extraCapitalNeededCzk).toLocaleString("cs-CZ")} Kč nad rezervou.`
          : "Oddělená rezerva modelovou opravu unese spolu s běžným tokem.",
      dopad: "Běžná měsíční rezerva na údržbu ≠ fond na havárie.",
      overit: "Technický stav (rozvody, okna, jádro) — v ukázce neprohlíženo.",
      provenance: "modelovy_predpoklad",
    },
    {
      id: "f-refix",
      chapter: "Refixace",
      podklad: `Zůstatek po ${bundle.refix.fixationYears} letech, sazba ${bundle.refix.shockedRatePercent} %`,
      zjisteni: `Splátka vzroste o cca ${Math.round(bundle.refix.paymentDeltaCzk).toLocaleString("cs-CZ")} Kč/měs.; tok po refixaci cca ${Math.round(bundle.refix.monthlyCashFlowAfterRefixCzk).toLocaleString("cs-CZ")} Kč.`,
      dopad: "Nejde o sazbu od počátku úvěru — počítá se ze zbývající jistiny a splatnosti.",
      overit: "Podmínky banky při refixaci a možnost mimořádné splátky.",
      provenance: "vypocteno",
    },
    {
      id: "f-unknown-lv",
      chapter: "Právní stav",
      podklad: "List vlastnictví — nedodán",
      zjisteni: "Vlastnictví, věcná břemena a omezení nejsou ověřena.",
      dopad: "Bez LV nelze potvrdit převoditelnost ani absenci zástav třetích stran nad rámec modelového úvěru.",
      overit: "Vyžádat aktuální LV a výpis SVJ.",
      provenance: "neznamo",
    },
  ];
}

export function buildCaseStudyBundle(
  input: ControlModelInputs = CONTROL_MODEL_INPUTS,
  generatedAt = new Date().toISOString().slice(0, 10)
): CaseStudyBundle {
  const model = runControlModel(input);
  const scenarios = runControlScenarios(input);
  const cells: SensitivityCell[] = [];
  for (const rent of SENS_RENTS) {
    for (const rate of SENS_RATES) {
      cells.push({
        monthlyRentCzk: rent,
        annualRatePercent: rate,
        monthlyCashFlowCzk: sensitivityCashFlow(input, rent, rate),
      });
    }
  }

  const vacancyStress = buildVacancyStressPath(model, 3);
  const emergencyRepair = buildEmergencyRepairPath(model, 80_000, 4);
  const refix = buildRefix(model, 5, 6.8);
  const longTerm = buildLongTerm(model, 10);
  const sales = buildSales(model);
  const { sale, rent } = buildSyntheticListings(generatedAt);
  const findings = buildFindings({
    model,
    vacancyStress,
    emergencyRepair,
    refix,
    saleListings: sale,
    rentListings: rent,
  });

  return {
    caseId: CASE_STUDY_ID,
    modelVersion: CONTROL_MODEL_VERSION,
    generatedAt,
    model,
    scenarios,
    sensitivity: { rents: SENS_RENTS, rates: SENS_RATES, cells },
    vacancyStress,
    emergencyRepair,
    refix,
    longTerm,
    sales,
    saleListings: sale,
    rentListings: rent,
    findings,
    whatPremiumAddsCs: [
      "Syntetické srovnání prodejních a nájemních nabídek s pásmem a omezeními srovnatelnosti (ne statistický průměr trhu).",
      "Stres prázdného bytu a mimořádné opravy s průběhem rezervy bez dvojího započtení výpadku.",
      "Refixace ze skutečného zůstatku jistiny po 5 letech, ne ze sazby od počátku.",
      "Varianty prodeje včetně modelových prodejních nákladů a zbývajícího dluhu (před daní).",
      "Individuální zjištění ve struktuře podklad → zjištění → dopad → co ověřit.",
      "Seznam chybějících podkladů (LV, prohlídka, SVJ) a otázky pro prodávajícího.",
    ],
    pageTargets: {
      digital: "6–10 stran A4",
      premium: "cíl ~30 stran A4",
    },
  };
}
