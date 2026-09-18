/**
 * Case-study analytics on top of the control model — no parallel engine.
 * Timeline-aware long-term, isolated vs connected refix, combined liquidity,
 * document-driven adjustments, public comps (Brno-Židenice), settlement.
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

export const CASE_STUDY_ID = "modelovy-byt-zidenice-60m2-v3" as const;
export const CASE_STUDY_LABEL_CS =
  "Modelový byt 2+kk · 60 m² · Brno-Židenice" as const;
export const CASE_STUDY_VERSION = "2026-09-18.v3" as const;

/** Historická neobsazenost z modelového podkladu: 4 měsíce / 36 měsíců. */
export const HISTORICAL_VACANCY_RATE = 4 / 36;
/** Budoucí modelový předpoklad výpadku — není potvrzen podkladem 4/36. */
export const FUTURE_VACANCY_ASSUMPTION_RATE = 0.05;

/** Access date for public listing notes in this demo build. */
export const LISTINGS_ACCESS_DATE = "2026-09-18" as const;

export type ProvenanceKind =
  | "modelovy_predpoklad"
  | "vypocteno"
  | "verejna_nabidka"
  | "modelovy_podklad"
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
  /** True = arises from document / market work, not calculator restatement */
  fromDocumentWork: boolean;
};

export type MarketListing = {
  id: string;
  kind: "sale" | "rent";
  label: string;
  locality: string;
  disposition: string;
  areaM2: number;
  priceOrRentCzk: number;
  /** Bare rent / purchase price — services noted separately */
  pricePerM2Czk: number;
  servicesIncluded: string;
  conditionNotes: string;
  includeReason: string;
  comparabilityLimit: string;
  url: string | null;
  accessDate: string;
  provenance: "verejna_nabidka" | "synteticka_srovnavaci_sada";
  excluded?: boolean;
  excludeReason?: string;
};

export type BudgetLine = {
  id: string;
  category: "closing" | "fitout" | "opex" | "extraordinary";
  label: string;
  purpose: string;
  amountCzk: number;
  timing: string;
  provenance: ProvenanceKind;
  uncertainty: string;
};

export type ModelDocument = {
  id: string;
  title: string;
  kindLabel: string;
  disclaimer: string;
  says: string;
  relevantForOwner: string;
  originalModelGap: string;
  amountDeltaMonthlyCzk: number;
  amountDeltaOneOffCzk: number;
};

export type ReserveMonth = {
  month: number;
  openingCzk: number;
  /** True cash from operations into reserve (surplus) */
  opsInflowCzk: number;
  /** Investor top-up (external) */
  investorInflowCzk: number;
  /** Operating shortfall + debt service + repairs drawn from reserve */
  outflowCzk: number;
  /** Accounting transfer into unit-maintenance pocket (not a second cash hit) */
  reserveTransferCzk: number;
  closingCzk: number;
  note: string;
};

export type RefixScenario = {
  id: "isolated_rate_shock" | "connected_year5";
  label: string;
  descriptionCs: string;
  fixationYears: number;
  balanceAtRefixCzk: number;
  remainingTermYears: number;
  rentAtRefixCzk: number;
  otherMonthlyAtRefixCzk: number;
  basePaymentCzk: number;
  shockedRatePercent: number;
  shockedPaymentCzk: number;
  paymentDeltaCzk: number;
  monthlyCashFlowAfterRefixCzk: number;
};

export type LongTermRow = {
  year: number;
  /** End of year Y after Y rent increases */
  rentCzk: number;
  otherMonthlyCzk: number;
  paymentCzk: number;
  netCfCzk: number;
  loanBalanceCzk: number;
  propertyValueCzk: number;
  equityCzk: number;
  assumptionsNote: string;
};

export type SaleScenario = {
  id: string;
  label: string;
  holdYears: number;
  assumedSalePriceCzk: number;
  sellingCostRate: number;
  sellingCostsCzk: number;
  loanBalanceCzk: number;
  /** Cash after sale costs and debt repayment — before tax, before reserve settlement */
  netProceedsBeforeTaxCzk: number;
  notes: string;
};

export type InvestmentSettlement = {
  holdYears: number;
  scenarioId: "base" | "stress";
  scenarioLabelCs: string;
  initialOwnCashCzk: number;
  /** Součet měsíčních provozních toků — jen informativní; do výsledku nevstupuje znovu */
  cumulativeOperatingCashCzk: number;
  investorTopUpsCzk: number;
  saleNetProceedsBeforeTaxCzk: number;
  /** Konečný zůstatek rezervy z dané historie (ne počátečních 150 tis. bez obnovení) */
  reserveReleasedCzk: number;
  /** Celkový výsledek = inkaso z prodeje + konečná rezerva − počáteční vklad − doplnění */
  totalResultBeforeTaxCzk: number;
  excludedCs: string;
};

export type VacancyAnalysis = {
  historicalEmptyMonths: number;
  historicalHorizonMonths: number;
  historicalRate: number;
  futureAssumptionRate: number;
  futureAssumptionReasonCs: string;
  monthlyCashFlowAtFutureAssumptionCzk: number;
  monthlyCashFlowAtHistoricalRateCzk: number;
  noteCs: string;
};

export type MonthlyTimelinePoint = {
  month: number;
  rentCzk: number;
  otherMonthlyCzk: number;
  paymentCzk: number;
  vacancyRate: number;
  netCfCzk: number;
  loanBalanceCzk: number;
  reserveCzk: number;
  eventCs: string | null;
};

export type SensitivityDelta = {
  id: string;
  label: string;
  changeDescriptionCs: string;
  deltaMonthlyCashFlowCzk: number;
  deltaPaymentCzk: number | null;
};

export type PropertyProfile = {
  caseId: typeof CASE_STUDY_ID;
  labelCs: typeof CASE_STUDY_LABEL_CS;
  disposition: string;
  areaM2: number;
  locality: string;
  floor: string;
  elevator: string;
  balcony: string;
  cellar: string;
  parking: string;
  buildingCondition: string;
  unitCondition: string;
  furnishing: string;
  intendedUse: string;
  plannedWorks: string;
  availableDocs: string[];
  missingDocs: string[];
  disclaimerCs: string;
};

export type CaseStudyBundle = {
  caseId: typeof CASE_STUDY_ID;
  caseVersion: typeof CASE_STUDY_VERSION;
  modelVersion: typeof CONTROL_MODEL_VERSION;
  generatedAt: string;
  profile: PropertyProfile;
  /** Client original assignment = control model */
  originalModel: ControlModelResult;
  /** After processing model documents (SVJ uplift etc.) */
  adjustedInputs: ControlModelInputs;
  adjustedModel: ControlModelResult;
  documents: ModelDocument[];
  budgets: BudgetLine[];
  scenarios: ControlScenarioResult[];
  sensitivity: {
    rents: number[];
    rates: number[];
    cells: Array<{
      monthlyRentCzk: number;
      annualRatePercent: number;
      monthlyCashFlowCzk: number;
    }>;
    concreteDeltas: SensitivityDelta[];
  };
  vacancyAnalysis: VacancyAnalysis;
  combinedLiquidity: {
    noteCs: string;
    /** Počet měsíců bez inkasa (včetně měsíce opravy) */
    emptyMonthsWithoutRent: number;
    emptyMonthsBeforeRepair: number;
    repairMonth: number;
    path: ReserveMonth[];
    minReserveCzk: number;
    extraCapitalNeededCzk: number;
    endingReserveCzk: number;
    whatReserveCoversCs: string;
    whatHappensNextVacancyCs: string;
    rebuildNoteCs: string;
  };
  timeline: {
    startLabel: string;
    rentGrowthPa: number;
    costGrowthPa: number;
    valueGrowthPa: number;
    fixationYears: number;
    refixRatePercent: number;
    /** Základní měsíční osa bez stresu (do 10 let / 120 měsíců) */
    baseMonthly: MonthlyTimelinePoint[];
    /** Roční agregace ze základní osy (průměrný měsíční tok ≠ tok na konci roku) */
    baseAnnualFromMonthly: LongTermRow[];
  };
  longTermFlatCosts: LongTermRow[];
  longTermGrownCosts: LongTermRow[];
  /** Dlouhodobá osa se skutečnou refixací splátky od měsíce 61 */
  longTermWithRefix: LongTermRow[];
  /** Stejná osa bez změny sazby (pro srovnání) */
  longTermNoRefix: LongTermRow[];
  refixIsolated: RefixScenario;
  refixConnected: RefixScenario;
  sales: SaleScenario[];
  /** Základní historie (bez stresu) — konečná rezerva z provozních toků */
  settlementY5: InvestmentSettlement;
  settlementY10: InvestmentSettlement;
  /** Stresová historie — konečná rezerva a doplnění z likviditního scénáře + pokračování */
  settlementStressY5: InvestmentSettlement;
  saleListings: MarketListing[];
  rentListings: MarketListing[];
  excludedListings: MarketListing[];
  findings: FindingBlock[];
  whatPremiumAddsCs: string[];
  pageTargets: { digital: string; premium: string };
};

const SENS_RENTS = [18_000, 19_000, 20_000, 21_000, 22_000];
const SENS_RATES = [3.8, 4.8, 5.8, 6.8];
const RENT_GROWTH_PA = 0.02;
const COST_GROWTH_PA = 0.02;
const VALUE_GROWTH_PA = 0.02;
const FIXATION_YEARS = 5;
const REFIX_RATE = 6.8;
const SELLING_COST_RATE = 0.04;

export const PROPERTY_PROFILE: PropertyProfile = {
  caseId: CASE_STUDY_ID,
  labelCs: CASE_STUDY_LABEL_CS,
  disposition: "2+kk",
  areaM2: 60,
  locality: "Brno-Židenice (modelový byt bez konkrétní adresy)",
  floor: "3. NP z 5",
  elevator: "Ne",
  balcony: "Ano, ~3 m²",
  cellar: "Ano, sklepní kóje",
  parking: "Ulice / zóny — bez vyhrazeného stání",
  buildingCondition: "Cihlový dům 1950–70, částečně udržovaný",
  unitCondition: "Obyvatelný, koupelna a kuchyň po částečné modernizaci",
  furnishing: "Částečně — kuchyňská linka, bez ložnicového nábytku",
  intendedUse: "Dlouhodobý pronájem (12+ měsíců)",
  plannedWorks: "Domalování, drobné opravy, doplnění vybavení pro pronájem",
  availableDocs: [
    "Modelový předpis měsíčních plateb SVJ",
    "Modelový přehled příjmů a neobsazenosti (předchozí vlastník)",
    "Položkový rozpočet úprav a vybavení",
    "Modelová informace o plánované opravě střechy",
  ],
  missingDocs: [
    "Aktuální list vlastnictví",
    "Technická prohlídka / zpráva o stavu",
    "Potvrzené bankovní podmínky úvěru",
    "Smlouva o budoucí koupi / výpis z katastru",
  ],
  disclaimerCs:
    "Byt je modelový. Lokalita Brno-Židenice je zvolena pro dohledatelné veřejné nabídky. Nejde o konkrétní adresu ani ověřený právní/technický stav.",
};

function monthlyOpsCashFlow(
  monthlyRentCzk: number,
  vacancyRate: number,
  managementFeeRate: number,
  otherAnnualCostsCzk: number,
  monthlyPaymentCzk: number
): number {
  const ops = computeOperatingSurplusAfterReserve({
    monthlyRentCzk,
    vacancyRate,
    managementFeeRate,
    otherAnnualCostsCzk,
  });
  return ops.operatingSurplusAfterReserveCzk / 12 - monthlyPaymentCzk;
}

function sensitivityCashFlow(
  input: ControlModelInputs,
  monthlyRentCzk: number,
  annualRatePercent: number
): number {
  const payment = computeMonthlyAnnuity(
    input.loanAmountCzk,
    annualRatePercent,
    input.termYears
  );
  return monthlyOpsCashFlow(
    monthlyRentCzk,
    input.vacancyRate,
    input.managementFeeRate,
    otherAnnualCosts(input),
    payment
  );
}

function buildDocuments(): ModelDocument[] {
  return [
    {
      id: "doc-svj",
      title: "Modelový předpis měsíčních plateb",
      kindLabel: "Modelový podklad vytvořený pro demonstraci analýzy",
      disclaimer:
        "Nejde o skutečný výpis SVJ ani o ověřené platby konkrétního domu.",
      says: "Příspěvek vlastníka na správu domu a fond oprav 2 800 Kč/měs. + pojištění budovy přeúčtované 300 Kč + daňový ekvivalent 200 Kč. Údržba jednotky není v předpisu — hradí vlastník zvlášť.",
      relevantForOwner:
        "Náklady na dům 2 800 Kč/měs. jsou o 800 Kč vyšší než v původním zadání (2 000 Kč).",
      originalModelGap:
        "Klient zadal 2 000 Kč/měs. na dům. Podklad ukazuje 2 800 Kč — rozdíl 800 Kč/měs. (9 600 Kč/rok).",
      amountDeltaMonthlyCzk: 800,
      amountDeltaOneOffCzk: 0,
    },
    {
      id: "doc-fitout",
      title: "Položkový rozpočet úprav a vybavení",
      kindLabel: "Modelový podklad vytvořený pro demonstraci analýzy",
      disclaimer: "Nejde o nabídku řemeslníka ani o fakturu.",
      says: "Malování 35 tis., drobné opravy 25 tis., kuchyňské doplňky 40 tis., pračka+lednice 45 tis., postel+úložný nábytek 35 tis. = 180 tis. Kč.",
      relevantForOwner:
        "Pro dlouhodobý pronájem není nutný veškerý nábytek ložnice (35 tis.) — lze přenést na nájemníka nebo vynechat.",
      originalModelGap:
        "Souhrn 180 tis. sedí, ale 35 tis. je volitelných. Po úpravě zůstává nutných 145 tis. Kč.",
      amountDeltaMonthlyCzk: 0,
      amountDeltaOneOffCzk: -35_000,
    },
    {
      id: "doc-roof",
      title: "Modelová informace o opravě střechy",
      kindLabel: "Modelový podklad vytvořený pro demonstraci analýzy",
      disclaimer: "Nejde o zápis ze schůze SVJ ani o závazný rozpočet.",
      says: "Výbor zvažuje výměnu střešní krytiny do 24 měsíců. Orientační podíl na jednotku 45–70 tis. Kč jednorázově.",
      relevantForOwner:
        "Mimořádný příspěvek není v běžné rezervě na údržbu jednotky. Likviditní plán musí počítat s rizikem ~60 tis. Kč.",
      originalModelGap:
        "Původní model neměl žádnou mimořádnou stavební položku kromě obecné rezervy 150 tis.",
      amountDeltaMonthlyCzk: 0,
      amountDeltaOneOffCzk: 60_000,
    },
    {
      id: "doc-occupancy",
      title: "Modelový přehled příjmů a neobsazenosti",
      kindLabel: "Modelový podklad vytvořený pro demonstraci analýzy",
      disclaimer: "Nejde o daňové přiznání ani o účetnictví konkrétního vlastníka.",
      says: "Za poslední 3 roky: 2 výměny nájemníků, celkem 4 měsíce bez nájmu (4 / 36 = 11,11 %), průměrný nájem 19,5–20,5 tis. Kč bez záloh.",
      relevantForOwner:
        "Historická neobsazenost je 11,11 %, nikoli 5 %. Budoucí modelový předpoklad 5 % je volba scénáře (nižší než historie), ne hodnota potvrzená tímto podkladem.",
      originalModelGap:
        "Původní model používal výpadek 5 % a prezentoval ho jako sladěný s historií — to je chybné. Varianta s historickým podílem 4/36 zhoršuje měsíční tok.",
      amountDeltaMonthlyCzk: 0,
      amountDeltaOneOffCzk: 0,
    },
  ];
}

function buildBudgets(adjustedFitOutCzk: number): BudgetLine[] {
  return [
    {
      id: "c-legal",
      category: "closing",
      label: "Právní zastoupení / úschova",
      purpose: "Smlouva, úschova, zápis",
      amountCzk: 25_000,
      timing: "Při koupi",
      provenance: "modelovy_predpoklad",
      uncertainty: "±10 tis. dle kanceláře",
    },
    {
      id: "c-admin",
      category: "closing",
      label: "Kolky, výpisy, odhady",
      purpose: "Administrativa k převodu a úvěru",
      amountCzk: 15_000,
      timing: "Při koupi",
      provenance: "modelovy_predpoklad",
      uncertainty: "Závisí na bance",
    },
    {
      id: "c-other",
      category: "closing",
      label: "Rezerva na vedlejší",
      purpose: "Neočekávané poplatky",
      amountCzk: 30_000,
      timing: "Při koupi",
      provenance: "modelovy_predpoklad",
      uncertainty: "Může zbýt nevyčerpáno",
    },
    {
      id: "f-paint",
      category: "fitout",
      label: "Malování a drobné opravy",
      purpose: "Příprava k pronájmu",
      amountCzk: 60_000,
      timing: "Měsíc 0–1",
      provenance: "modelovy_podklad",
      uncertainty: "Stav po prohlídce neznámý",
    },
    {
      id: "f-kitchen",
      category: "fitout",
      label: "Kuchyňské doplňky",
      purpose: "Dokončení kuchyňské linky",
      amountCzk: 40_000,
      timing: "Měsíc 0–1",
      provenance: "modelovy_podklad",
      uncertainty: "Střední",
    },
    {
      id: "f-appl",
      category: "fitout",
      label: "Pračka a lednice",
      purpose: "Základní spotřebiče pro pronájem",
      amountCzk: 45_000,
      timing: "Měsíc 0–1",
      provenance: "modelovy_podklad",
      uncertainty: "Nízká",
    },
    {
      id: "f-opt",
      category: "fitout",
      label: "Volitelný nábytek ložnice",
      purpose: "Lze vynechat / přenést na nájemníka",
      amountCzk: Math.max(0, 180_000 - adjustedFitOutCzk),
      timing: "Volitelné",
      provenance: "modelovy_podklad",
      uncertainty: "Není nutné pro inkaso",
    },
    {
      id: "o-building",
      category: "opex",
      label: "Náklady vlastníka na dům (po úpravě)",
      purpose: "SVJ / fond oprav dle modelového předpisu",
      amountCzk: 2_800 * 12,
      timing: "Ročně / měsíčně",
      provenance: "modelovy_podklad",
      uncertainty: "Bez ověřeného výpisu SVJ",
    },
    {
      id: "o-ins",
      category: "opex",
      label: "Pojištění jednotky",
      purpose: "Majetek vlastníka",
      amountCzk: 3_600,
      timing: "Ročně",
      provenance: "zadano_v_modelu",
      uncertainty: "Orientační",
    },
    {
      id: "o-tax",
      category: "opex",
      label: "Daň z nemovitých věcí",
      purpose: "Roční daň",
      amountCzk: 2_400,
      timing: "Ročně",
      provenance: "zadano_v_modelu",
      uncertainty: "Orientační",
    },
    {
      id: "o-maint",
      category: "opex",
      label: "Rezerva na údržbu jednotky",
      purpose: "Běžné opravy uvnitř bytu",
      amountCzk: 12_000,
      timing: "Tvorba rezervy 1 000 Kč/měs.",
      provenance: "zadano_v_modelu",
      uncertainty: "Není fond na havárie",
    },
    {
      id: "e-roof",
      category: "extraordinary",
      label: "Riziko podílu na opravě střechy",
      purpose: "Modelovaný jednorázový příspěvek",
      amountCzk: 60_000,
      timing: "Do 24 měsíců (nejisté)",
      provenance: "modelovy_podklad",
      uncertainty: "Rozsah 45–70 tis.; neschváleno",
    },
    {
      id: "e-repair",
      category: "extraordinary",
      label: "Stresová oprava jednotky",
      purpose: "Havarijní scénář v likviditním testu",
      amountCzk: 80_000,
      timing: "Měsíc 4 stresového scénáře",
      provenance: "modelovy_predpoklad",
      uncertainty: "Scénář, ne predikce",
    },
  ];
}

function applyDocumentAdjustments(
  base: ControlModelInputs
): ControlModelInputs {
  return {
    ...base,
    ownerBuildingCostsAnnualCzk: 2_800 * 12,
    initialFitOutCzk: 145_000,
  };
}

/**
 * Kombinovaný stres: 3 měsíce bez nájmu, 4. měsíc oprava bez inkasa
 * (celkem 4 měsíce bez nájemného), od 5. měsíce opětovné pronajmutí.
 * Průměrný výpadek se v měsících bez inkasa neaplikuje.
 */
function buildCombinedLiquidity(
  adjusted: ControlModelResult
): CaseStudyBundle["combinedLiquidity"] {
  const input = adjusted.inputs;
  const payment = adjusted.monthlyPaymentCzk;
  const fixedOwnerMonthly =
    input.ownerBuildingCostsAnnualCzk / 12 +
    input.insuranceAnnualCzk / 12 +
    input.propertyTaxAnnualCzk / 12 +
    input.unitMaintenanceReserveAnnualCzk / 12;
  const emptyOutflow = fixedOwnerMonthly + payment;
  const occupiedCf = adjusted.monthlyCashFlowCzk;

  // Pass 1: no investor top-ups — measure true trough
  let bal = input.cashReserveCzk;
  let minRaw = bal;
  const rawMonths: Array<{
    opening: number;
    opsIn: number;
    outflow: number;
    note: string;
    transfer: number;
  }> = [];

  for (let m = 1; m <= 12; m += 1) {
    const opening = bal;
    let opsIn = 0;
    let outflow = 0;
    let transfer = 0;
    let note = "";
    if (m <= 3) {
      outflow = emptyOutflow;
      transfer = input.unitMaintenanceReserveAnnualCzk / 12;
      note = `Měsíc ${m}: prázdný byt bez inkasa — odtok ${Math.round(emptyOutflow).toLocaleString("cs-CZ")} Kč (splátka + náklady vlastníka). Průměrný výpadek se neaplikuje.`;
    } else if (m === 4) {
      outflow = emptyOutflow + 80_000;
      transfer = input.unitMaintenanceReserveAnnualCzk / 12;
      note =
        "Měsíc 4: stále bez inkasa + mimořádná oprava 80 000 Kč (skutečný výdaj). Celkem 4. měsíc bez nájemného.";
    } else if (occupiedCf >= 0) {
      opsIn = occupiedCf;
      note =
        "Opětovné pronajmutí — kladný upravený měsíční tok posiluje rezervu.";
    } else {
      outflow = Math.abs(occupiedCf);
      note =
        "Opětovné pronajmutí — záporný upravený tok čerpá rezervu.";
    }
    const closing = opening + opsIn - outflow;
    rawMonths.push({ opening, opsIn, outflow, note, transfer });
    bal = closing;
    if (closing < minRaw) minRaw = closing;
  }

  const extraCapitalNeededCzk = minRaw < 0 ? Math.abs(minRaw) : 0;

  const path: ReserveMonth[] = [];
  bal = input.cashReserveCzk;
  let injected = 0;
  for (let i = 0; i < rawMonths.length; i += 1) {
    const r = rawMonths[i]!;
    const opening = bal;
    let investorIn = 0;
    let closing = opening + r.opsIn - r.outflow;
    let note = r.note;
    if (closing < 0) {
      investorIn = Math.abs(closing);
      injected += investorIn;
      closing = 0;
      note += ` Externí doplnění ${Math.round(investorIn).toLocaleString("cs-CZ")} Kč.`;
    }
    path.push({
      month: i + 1,
      openingCzk: opening,
      opsInflowCzk: r.opsIn,
      investorInflowCzk: investorIn,
      outflowCzk: r.outflow,
      reserveTransferCzk: r.transfer,
      closingCzk: closing,
      note,
    });
    bal = closing;
  }

  return {
    noteCs:
      "Přesná definice: tři měsíce bez nájmu, čtvrtý měsíc oprava bez inkasa (celkem čtyři měsíce bez nájemného), od pátého měsíce opětovné pronajmutí. Průměrný výpadek 5 % se v měsících bez inkasa nepoužívá. Položka údržby 1 000 Kč/měs. je součástí provozního odtoku při prázdnu (skutečný cash), nikoli druhý převod navíc.",
    emptyMonthsWithoutRent: 4,
    emptyMonthsBeforeRepair: 3,
    repairMonth: 4,
    path,
    minReserveCzk: minRaw,
    extraCapitalNeededCzk: Math.max(extraCapitalNeededCzk, injected),
    endingReserveCzk: bal,
    whatReserveCoversCs:
      "Oddělená hotovost 150 000 Kč: provozní odtoky při prázdnu, splátka, modelovaná havárie bytu. Nezahrnuje automaticky podíl na opravě střechy (samostatné riziko). Převod do kapsy údržby není nákladem celé investice navíc.",
    whatHappensNextVacancyCs:
      "Opakované čtyřměsíční období bez inkasa po vyčerpání vyžaduje nové externí doplnění — z doplatkového CF se polštář obnovuje pomalu nebo vůbec.",
    rebuildNoteCs:
      occupiedCf < 0
        ? `Upravený tok cca ${Math.round(occupiedCf).toLocaleString("cs-CZ")} Kč/měs. rezervu z provozu neobnovuje.`
        : `Přebytek cca ${Math.round(occupiedCf).toLocaleString("cs-CZ")} Kč/měs. postupně obnovuje rezervu.`,
  };
}

function balanceAfterMonths(
  loan: number,
  rate: number,
  termYears: number,
  months: number
): number {
  const amort = amortizeFirstMonths(loan, rate, termYears, months);
  const last = amort.rows[amort.rows.length - 1];
  return last?.closingBalanceCzk ?? loan;
}

function buildLongTerm(
  model: ControlModelResult,
  years: number,
  growCosts: boolean
): LongTermRow[] {
  const input = model.inputs;
  const baseOther = otherAnnualCosts(input);
  const rows: LongTermRow[] = [];
  for (let y = 1; y <= years; y += 1) {
    const rent = input.monthlyRentCzk * Math.pow(1 + RENT_GROWTH_PA, y);
    const otherAnnual = growCosts
      ? baseOther * Math.pow(1 + COST_GROWTH_PA, y)
      : baseOther;
    const balance = balanceAfterMonths(
      input.loanAmountCzk,
      input.annualRatePercent,
      input.termYears,
      y * 12
    );
    const payment = model.monthlyPaymentCzk;
    const netCf = monthlyOpsCashFlow(
      rent,
      input.vacancyRate,
      input.managementFeeRate,
      otherAnnual,
      payment
    );
    const propertyValue =
      input.purchasePriceCzk * Math.pow(1 + VALUE_GROWTH_PA, y);
    rows.push({
      year: y,
      rentCzk: rent,
      otherMonthlyCzk: otherAnnual / 12,
      paymentCzk: payment,
      netCfCzk: netCf,
      loanBalanceCzk: balance,
      propertyValueCzk: propertyValue,
      equityCzk: Math.max(0, propertyValue - balance),
      assumptionsNote: growCosts
        ? `Nájem +${RENT_GROWTH_PA * 100} % p.a., ostatní náklady +${COST_GROWTH_PA * 100} % p.a., splátka beze změny do refixace`
        : `Nájem +${RENT_GROWTH_PA * 100} % p.a., ostatní náklady bez růstu, splátka beze změny do refixace`,
    });
  }
  return rows;
}

function buildRefixScenarios(model: ControlModelResult): {
  isolated: RefixScenario;
  connected: RefixScenario;
} {
  const input = model.inputs;
  const months = FIXATION_YEARS * 12;
  const balance = balanceAfterMonths(
    input.loanAmountCzk,
    input.annualRatePercent,
    input.termYears,
    months
  );
  const remaining = input.termYears - FIXATION_YEARS;
  const shockedPayment = computeMonthlyAnnuity(balance, REFIX_RATE, remaining);
  const other = otherAnnualCosts(input);

  const isolatedCf = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    input.vacancyRate,
    input.managementFeeRate,
    other,
    shockedPayment
  );

  const rentAfterFiveIncreases =
    input.monthlyRentCzk * Math.pow(1 + RENT_GROWTH_PA, FIXATION_YEARS);
  const connectedCf = monthlyOpsCashFlow(
    rentAfterFiveIncreases,
    input.vacancyRate,
    input.managementFeeRate,
    other,
    shockedPayment
  );

  return {
    isolated: {
      id: "isolated_rate_shock",
      label: "Izolovaný test změny sazby",
      descriptionCs:
        "Stejný nájem a stejné provozní náklady jako na začátku; mění se jen splátka ze zůstatku po 5 letech při nové sazbě. Nesloučí se s růstem nájmu.",
      fixationYears: FIXATION_YEARS,
      balanceAtRefixCzk: balance,
      remainingTermYears: remaining,
      rentAtRefixCzk: input.monthlyRentCzk,
      otherMonthlyAtRefixCzk: other / 12,
      basePaymentCzk: model.monthlyPaymentCzk,
      shockedRatePercent: REFIX_RATE,
      shockedPaymentCzk: shockedPayment,
      paymentDeltaCzk: shockedPayment - model.monthlyPaymentCzk,
      monthlyCashFlowAfterRefixCzk: isolatedCf,
    },
    connected: {
      id: "connected_year5",
      label: "Navazující refixace po 5 letech",
      descriptionCs:
        "Na časové ose: po 5 zvýšeních nájmu o 2 % p.a. a při zůstatku po 60 splátkách se sazba mění na 6,8 %. Ostatní náklady zatím bez růstu (viz samostatná varianta dlouhodobého modelu).",
      fixationYears: FIXATION_YEARS,
      balanceAtRefixCzk: balance,
      remainingTermYears: remaining,
      rentAtRefixCzk: rentAfterFiveIncreases,
      otherMonthlyAtRefixCzk: other / 12,
      basePaymentCzk: model.monthlyPaymentCzk,
      shockedRatePercent: REFIX_RATE,
      shockedPaymentCzk: shockedPayment,
      paymentDeltaCzk: shockedPayment - model.monthlyPaymentCzk,
      monthlyCashFlowAfterRefixCzk: connectedCf,
    },
  };
}

function buildSales(
  longTerm: LongTermRow[],
  model: ControlModelResult
): SaleScenario[] {
  const y5 = longTerm[4]!;
  const y10 = longTerm[9]!;
  const mk = (
    id: string,
    label: string,
    holdYears: number,
    row: LongTermRow,
    priceMult: number
  ): SaleScenario => {
    const price = row.propertyValueCzk * priceMult;
    const costs = price * SELLING_COST_RATE;
    return {
      id,
      label,
      holdYears,
      assumedSalePriceCzk: price,
      sellingCostRate: SELLING_COST_RATE,
      sellingCostsCzk: costs,
      loanBalanceCzk: row.loanBalanceCzk,
      netProceedsBeforeTaxCzk: price - costs - row.loanBalanceCzk,
      notes: `Modelová hodnota z kupní ceny ${model.inputs.purchasePriceCzk.toLocaleString("cs-CZ")} Kč × (1+${VALUE_GROWTH_PA * 100} %)^${holdYears}. Prodejní náklady ${(SELLING_COST_RATE * 100).toLocaleString("cs-CZ")} % — ne daň z příjmů.`,
    };
  };
  return [
    mk("y5_base", "Prodej po 5 letech (modelová hodnota)", 5, y5, 1),
    mk("y5_low", "Prodej po 5 letech (−10 % k modelu)", 5, y5, 0.9),
    mk("y10_base", "Prodej po 10 letech (modelová hodnota)", 10, y10, 1),
  ];
}

function simulateReservePath(
  model: ControlModelResult,
  months: number,
  opts: {
    applyRefix: boolean;
    growCosts: boolean;
    /** If provided, prepend stress path months then continue with occupied CF */
    stressPrefix?: CaseStudyBundle["combinedLiquidity"];
  }
): {
  points: MonthlyTimelinePoint[];
  endingReserveCzk: number;
  topUpsCzk: number;
  cumulativeCfCzk: number;
} {
  const input = model.inputs;
  const baseOther = otherAnnualCosts(input);
  const basePayment = model.monthlyPaymentCzk;
  const monthsToRefix = FIXATION_YEARS * 12;
  const balanceAtRefix = balanceAfterMonths(
    input.loanAmountCzk,
    input.annualRatePercent,
    input.termYears,
    monthsToRefix
  );
  const shockedPayment = computeMonthlyAnnuity(
    balanceAtRefix,
    REFIX_RATE,
    input.termYears - FIXATION_YEARS
  );

  const points: MonthlyTimelinePoint[] = [];
  let reserve = input.cashReserveCzk;
  let topUps = 0;
  let cumulativeCf = 0;
  let startMonth = 1;

  if (opts.stressPrefix) {
    for (const m of opts.stressPrefix.path) {
      reserve = m.closingCzk;
      topUps += m.investorInflowCzk;
      const net =
        m.opsInflowCzk > 0 ? m.opsInflowCzk : -m.outflowCzk;
      // For stress months, don't double-count repair as "operating CF" in settlement info
      if (m.month >= 5) cumulativeCf += net;
      points.push({
        month: m.month,
        rentCzk: m.month <= 4 ? 0 : input.monthlyRentCzk,
        otherMonthlyCzk: baseOther / 12,
        paymentCzk: basePayment,
        vacancyRate: m.month <= 4 ? 1 : input.vacancyRate,
        netCfCzk: net,
        loanBalanceCzk: balanceAfterMonths(
          input.loanAmountCzk,
          input.annualRatePercent,
          input.termYears,
          m.month
        ),
        reserveCzk: reserve,
        eventCs: m.note,
      });
    }
    startMonth = opts.stressPrefix.path.length + 1;
  }

  for (let m = startMonth; m <= months; m += 1) {
    // Růst po dokončeném roce: měsíce 1–12 bez růstu, 13–24 +1× atd.
    const rentIncreases = Math.floor((m - 1) / 12);
    const rent =
      input.monthlyRentCzk * Math.pow(1 + RENT_GROWTH_PA, rentIncreases);
    const otherAnnual = opts.growCosts
      ? baseOther * Math.pow(1 + COST_GROWTH_PA, rentIncreases)
      : baseOther;
    const payment =
      opts.applyRefix && m > monthsToRefix ? shockedPayment : basePayment;
    const netCf = monthlyOpsCashFlow(
      rent,
      input.vacancyRate,
      input.managementFeeRate,
      otherAnnual,
      payment
    );
    cumulativeCf += netCf;
    reserve += netCf;
    let event: string | null = null;
    if (m % 12 === 0 && m > 0) {
      event = `Konec roku ${m / 12}: růst nájmu o ${RENT_GROWTH_PA * 100} % od dalšího měsíce`;
    }
    if (opts.applyRefix && m === monthsToRefix) {
      event = `Refixace: sazba ${REFIX_RATE} %, nová splátka od měsíce ${monthsToRefix + 1}`;
    }
    if (reserve < 0) {
      topUps += Math.abs(reserve);
      event = (event ? `${event}. ` : "") +
        `Externí doplnění ${Math.round(Math.abs(reserve)).toLocaleString("cs-CZ")} Kč`;
      reserve = 0;
    }
    points.push({
      month: m,
      rentCzk: rent,
      otherMonthlyCzk: otherAnnual / 12,
      paymentCzk: payment,
      vacancyRate: input.vacancyRate,
      netCfCzk: netCf,
      loanBalanceCzk: balanceAfterMonths(
        input.loanAmountCzk,
        input.annualRatePercent,
        input.termYears,
        m
      ),
      reserveCzk: reserve,
      eventCs: event,
    });
  }

  return {
    points,
    endingReserveCzk: reserve,
    topUpsCzk: topUps,
    cumulativeCfCzk: cumulativeCf,
  };
}

function aggregateAnnualFromMonthly(
  points: MonthlyTimelinePoint[],
  years: number,
  growCosts: boolean
): LongTermRow[] {
  const rows: LongTermRow[] = [];
  for (let y = 1; y <= years; y += 1) {
    const slice = points.filter((p) => p.month > (y - 1) * 12 && p.month <= y * 12);
    if (slice.length === 0) continue;
    const end = slice[slice.length - 1]!;
    const avgCf = slice.reduce((s, p) => s + p.netCfCzk, 0) / slice.length;
    rows.push({
      year: y,
      rentCzk: end.rentCzk,
      otherMonthlyCzk: end.otherMonthlyCzk,
      paymentCzk: end.paymentCzk,
      netCfCzk: avgCf,
      loanBalanceCzk: end.loanBalanceCzk,
      propertyValueCzk:
        CONTROL_MODEL_INPUTS.purchasePriceCzk *
        Math.pow(1 + VALUE_GROWTH_PA, y),
      equityCzk: Math.max(
        0,
        CONTROL_MODEL_INPUTS.purchasePriceCzk *
          Math.pow(1 + VALUE_GROWTH_PA, y) -
          end.loanBalanceCzk
      ),
      assumptionsNote: growCosts
        ? `Agregace měsíců ${(y - 1) * 12 + 1}–${y * 12}: průměrný měsíční tok; dluh a rezerva ke konci roku. Náklady s růstem.`
        : `Agregace měsíců ${(y - 1) * 12 + 1}–${y * 12}: průměrný měsíční tok; dluh ke konci roku. Náklady bez růstu.`,
    });
  }
  return rows;
}

function buildSettlementFromPath(
  model: ControlModelResult,
  sale: SaleScenario,
  path: {
    endingReserveCzk: number;
    topUpsCzk: number;
    cumulativeCfCzk: number;
  },
  scenarioId: "base" | "stress",
  scenarioLabelCs: string
): InvestmentSettlement {
  const total =
    -model.totalOwnCashIncludingReserveCzk -
    path.topUpsCzk +
    sale.netProceedsBeforeTaxCzk +
    path.endingReserveCzk;

  return {
    holdYears: sale.holdYears,
    scenarioId,
    scenarioLabelCs,
    initialOwnCashCzk: model.totalOwnCashIncludingReserveCzk,
    cumulativeOperatingCashCzk: path.cumulativeCfCzk,
    investorTopUpsCzk: path.topUpsCzk,
    saleNetProceedsBeforeTaxCzk: sale.netProceedsBeforeTaxCzk,
    reserveReleasedCzk: path.endingReserveCzk,
    totalResultBeforeTaxCzk: total,
    excludedCs:
      "Před daní z příjmů FO. Provozní měsíční toky jsou již v konečné rezervě — nepočítají se znovu. Splacená jistina je v nižším dluhu při prodeji. Převod mezi vlastními rezervními kapsami není nákladem investice.",
  };
}

function buildMarketListings(accessDate: string): {
  sale: MarketListing[];
  rent: MarketListing[];
  excluded: MarketListing[];
} {
  const sale: MarketListing[] = [
    {
      id: "S-gajdosova",
      kind: "sale",
      label: "Gajdošova — 2+kk, 62 m²",
      locality: "Brno-Židenice",
      disposition: "2+kk",
      areaM2: 62,
      priceOrRentCzk: 6_990_000,
      pricePerM2Czk: Math.round(6_990_000 / 62),
      servicesIncluded: "Kupní cena; garáž volitelně +790 tis. mimo cenu",
      conditionNotes: "Moderní cihlový dům, vybavený, výtahy",
      includeReason: "Blízká dispozice a lokalita; horní srovnávací okraj po rekonstrukci",
      comparabilityLimit:
        "Výrazně lepší stav a vybavení než modelový byt — nelze přímo jako tržní hodnota modelu",
      url: "https://www.framireal.cz/prodej-bytu-2-kk-brno-okres-brno-mesto-prodej-bytu-2-kk-62-m2-brno-zidenice-2261",
      accessDate,
      provenance: "verejna_nabidka",
    },
    {
      id: "S-miksickova",
      kind: "sale",
      label: "Mikšíčkova — 2+kk, 65 m²",
      locality: "Brno-Židenice",
      disposition: "2+kk",
      areaM2: 65,
      priceOrRentCzk: 7_950_000,
      pricePerM2Czk: Math.round(7_950_000 / 65),
      servicesIncluded: "Kupní cena dle inzerátu",
      conditionNotes: "Větší plocha, investiční marketing",
      includeReason: "Stejná městská část, podobná dispozice",
      comparabilityLimit: "Větší m² a pravděpodobně vyšší standard",
      url: "https://www.bydlisnami.cz/detail/2747098/prodej-bytu-2-kk-brno-zidenice-miksickova-65m2",
      accessDate,
      provenance: "verejna_nabidka",
    },
    {
      id: "S-sevcika",
      kind: "sale",
      label: "Otakara Ševčíka — 2+kk, 50 m²",
      locality: "Brno-Židenice",
      disposition: "2+kk",
      areaM2: 50,
      priceOrRentCzk: 5_100_000,
      pricePerM2Czk: Math.round(5_100_000 / 50),
      servicesIncluded: "Kupní cena; preferován souběžný odkup půdy",
      conditionNotes: "Původní stav k modernizaci, podkroví",
      includeReason: "Nižší standard — bližší modelovému „před rekonstrukcí“",
      comparabilityLimit:
        "Menší plocha + podmínka půdy zkresluje čistou cenu bytu",
      url: "https://www.realitypro.eu/detail/2909445/prodej-bytu-2-kk-brno-zidenice-otakara-sevcika-50m2",
      accessDate,
      provenance: "verejna_nabidka",
    },
  ];

  const rent: MarketListing[] = [
    {
      id: "R-karasek",
      kind: "rent",
      label: "Karáskovo nám. — 2+kk, 56 m²",
      locality: "Brno-Židenice",
      disposition: "2+kk",
      areaM2: 56,
      priceOrRentCzk: 17_000,
      pricePerM2Czk: Math.round(17_000 / 56),
      servicesIncluded: "Nájem bez energií (přepis elektřiny na nájemníka)",
      conditionNotes: "Částečně zařízený, 2. NP, bez výtahu, zahrada",
      includeReason: "Stejná lokalita, blízká plocha, dlouhodobý pronájem",
      comparabilityLimit: "Bez balkonu; nižší patro",
      url: "https://www.realitymat.cz/detail/2206658/pronajem-bytu-2-kk-brno-zidenice-karaskovo-namesti-56m2",
      accessDate,
      provenance: "verejna_nabidka",
    },
    {
      id: "R-belohorska",
      kind: "rent",
      label: "Bělohorská — 2+kk, 64 m²",
      locality: "Brno-Židenice",
      disposition: "2+kk",
      areaM2: 64,
      priceOrRentCzk: 20_400,
      pricePerM2Czk: Math.round(20_400 / 64),
      servicesIncluded: "Nájem 20 400 Kč + bydlení cca 5 100 Kč zvlášť",
      conditionNotes: "5. NP, výtah, balkon, sklep, částečně vybavený",
      includeReason: "Nejbližší inkasovaný nájem k modelovým 20 000 Kč",
      comparabilityLimit: "Větší plocha, výtah, družstevní vlastnictví",
      url: "https://realitymix.cz/detail/brno/pronajem-bytu-2-kk-belohorska-zidenice-20-400-kc-mes-64-m2-8064308.html",
      accessDate,
      provenance: "verejna_nabidka",
    },
    {
      id: "R-letni",
      kind: "rent",
      label: "Letní — 2+kk, 56 m²",
      locality: "Brno-Židenice",
      disposition: "2+kk",
      areaM2: 56,
      priceOrRentCzk: 24_000,
      pricePerM2Czk: Math.round(24_000 / 56),
      servicesIncluded: "Nájem 24 000 Kč + služby cca 3 160 Kč",
      conditionNotes: "Terasa, klimatizace, vyšší standard",
      includeReason: "Horní okraj nabídkového nájmu ve stejné části města",
      comparabilityLimit: "Výrazně vyšší vybavení — nad modelovým standardem",
      url: "https://www.realitymat.cz/detail/2244490/pronajem-bytu-2-kk-brno-letni-56m2",
      accessDate,
      provenance: "verejna_nabidka",
    },
  ];

  const excluded: MarketListing[] = [
    {
      id: "X-morizz",
      kind: "sale",
      label: "Nová Zbrojovka / Morizz — novostavba",
      locality: "Brno-Židenice",
      disposition: "2+kk",
      areaM2: 67,
      priceOrRentCzk: 9_091_000,
      pricePerM2Czk: Math.round(9_091_000 / 67),
      servicesIncluded: "Developerská cena",
      conditionNotes: "Novostavba s lodžií",
      includeReason: "",
      comparabilityLimit: "Jiný produktový segment",
      url: "https://cz.m2bomber.com/obj/1383068100/view/flat-sell/brno-1510-438171/prodej-bytu-2kk-62-m-lazaretni-brno",
      accessDate,
      provenance: "verejna_nabidka",
      excluded: true,
      excludeReason:
        "Vyřazeno: novostavba v projektu Nová Zbrojovka není srovnatelná s modelovým bytem ve starším cihlovém domě.",
    },
  ];

  return { sale, rent, excluded };
}

function buildConcreteDeltas(
  input: ControlModelInputs,
  baseCf: number,
  basePayment: number
): SensitivityDelta[] {
  const other = otherAnnualCosts(input);
  const cfRentUp = monthlyOpsCashFlow(
    input.monthlyRentCzk + 1_000,
    input.vacancyRate,
    input.managementFeeRate,
    other,
    basePayment
  );
  const cfRentDown = monthlyOpsCashFlow(
    input.monthlyRentCzk - 1_000,
    input.vacancyRate,
    input.managementFeeRate,
    other,
    basePayment
  );
  const pay58 = computeMonthlyAnnuity(
    input.loanAmountCzk,
    input.annualRatePercent + 1,
    input.termYears
  );
  const pay38 = computeMonthlyAnnuity(
    input.loanAmountCzk,
    input.annualRatePercent - 1,
    input.termYears
  );
  const cfRateUp = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    input.vacancyRate,
    input.managementFeeRate,
    other,
    pay58
  );
  const cfRateDown = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    input.vacancyRate,
    input.managementFeeRate,
    other,
    pay38
  );
  const cfCostUp = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    input.vacancyRate,
    input.managementFeeRate,
    other + 500 * 12,
    basePayment
  );
  const cfCostDown = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    input.vacancyRate,
    input.managementFeeRate,
    other - 500 * 12,
    basePayment
  );
  const cfHistVac = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    HISTORICAL_VACANCY_RATE,
    input.managementFeeRate,
    other,
    basePayment
  );
  const cfZeroVac = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    0,
    input.managementFeeRate,
    other,
    basePayment
  );
  return [
    {
      id: "rent-plus-1000",
      label: "Nájem +1 000 Kč/měs.",
      changeDescriptionCs:
        "Zvýšení potenciálního nájmu o 1 000 Kč při stejném výpadku, správě a splátce",
      deltaMonthlyCashFlowCzk: cfRentUp - baseCf,
      deltaPaymentCzk: null,
    },
    {
      id: "rent-minus-1000",
      label: "Nájem −1 000 Kč/měs.",
      changeDescriptionCs:
        "Snížení potenciálního nájmu o 1 000 Kč při stejném výpadku, správě a splátce",
      deltaMonthlyCashFlowCzk: cfRentDown - baseCf,
      deltaPaymentCzk: null,
    },
    {
      id: "rate-plus-1pp",
      label: "Sazba +1 p.b. od počátku",
      changeDescriptionCs: `Sazba ${input.annualRatePercent} % → ${(input.annualRatePercent + 1).toLocaleString("cs-CZ")} % při stejném úvěru a splatnosti (ne refixace)`,
      deltaMonthlyCashFlowCzk: cfRateUp - baseCf,
      deltaPaymentCzk: pay58 - basePayment,
    },
    {
      id: "rate-minus-1pp",
      label: "Sazba −1 p.b. od počátku",
      changeDescriptionCs: `Sazba ${input.annualRatePercent} % → ${(input.annualRatePercent - 1).toLocaleString("cs-CZ")} % při stejném úvěru a splatnosti`,
      deltaMonthlyCashFlowCzk: cfRateDown - baseCf,
      deltaPaymentCzk: pay38 - basePayment,
    },
    {
      id: "opex-plus-500",
      label: "Náklady vlastníka +500 Kč/měs.",
      changeDescriptionCs: "Zvýšení ostatních nákladů o 500 Kč měsíčně",
      deltaMonthlyCashFlowCzk: cfCostUp - baseCf,
      deltaPaymentCzk: null,
    },
    {
      id: "opex-minus-500",
      label: "Náklady vlastníka −500 Kč/měs.",
      changeDescriptionCs: "Snížení ostatních nákladů o 500 Kč měsíčně",
      deltaMonthlyCashFlowCzk: cfCostDown - baseCf,
      deltaPaymentCzk: null,
    },
    {
      id: "vacancy-historical",
      label: "Neobsazenost 4/36 (11,11 %)",
      changeDescriptionCs:
        "Místo budoucího předpokladu 5 % použít historický podíl z podkladu",
      deltaMonthlyCashFlowCzk: cfHistVac - baseCf,
      deltaPaymentCzk: null,
    },
    {
      id: "vacancy-zero",
      label: "Neobsazenost 0 %",
      changeDescriptionCs: "Plné obsazení — horní srovnávací okraj",
      deltaMonthlyCashFlowCzk: cfZeroVac - baseCf,
      deltaPaymentCzk: null,
    },
  ];
}

function buildFindings(b: {
  original: ControlModelResult;
  adjusted: ControlModelResult;
  docs: ModelDocument[];
  sale: MarketListing[];
  rent: MarketListing[];
  liquidity: CaseStudyBundle["combinedLiquidity"];
  refixIsolated: RefixScenario;
  refixConnected: RefixScenario;
}): FindingBlock[] {
  const salePsm = b.sale.map((l) => l.pricePerM2Czk);
  const rentVals = b.rent.map((l) => l.priceOrRentCzk);
  const modelPsm = b.original.pricePerM2Czk;
  const svj = b.docs.find((d) => d.id === "doc-svj")!;
  const fit = b.docs.find((d) => d.id === "doc-fitout")!;
  const roof = b.docs.find((d) => d.id === "doc-roof")!;

  return [
    {
      id: "f-svj",
      chapter: "Podklady",
      podklad: svj.title,
      zjisteni: `Po zpracování předpisu rostou náklady na dům o ${svj.amountDeltaMonthlyCzk} Kč/měs. Upravený měsíční tok je cca ${Math.round(b.adjusted.monthlyCashFlowCzk).toLocaleString("cs-CZ")} Kč oproti původním ${Math.round(b.original.monthlyCashFlowCzk).toLocaleString("cs-CZ")} Kč.`,
      dopad: "Doplatek investora se prohlubuje dřív, než se řeší trh nebo refixace.",
      overit: "Skutečný předpis SVJ za 12 měsíců a schválené čerpání fondu oprav.",
      provenance: "modelovy_podklad",
      fromDocumentWork: true,
    },
    {
      id: "f-market-sale",
      chapter: "Srovnání prodeje",
      podklad: `Veřejné nabídky prodeje (${b.sale.length}) v Brno-Židenice, přístup ${LISTINGS_ACCESS_DATE}`,
      zjisteni: `Nabídkové Kč/m² ${Math.min(...salePsm).toLocaleString("cs-CZ")}–${Math.max(...salePsm).toLocaleString("cs-CZ")}; modelový byt ${Math.round(modelPsm).toLocaleString("cs-CZ")} Kč/m² při kupní ceně 4,2 mil. Kč.`,
      dopad: "Zadaná kupní cena leží výrazně pod aktuálními nabídkami ve stejném obvodu — buď je vstup příliš optimistický, nebo byt patří do horšího segmentu (stav/patro/bez výtahu). Nejde o potvrzení „výhodné koupě“.",
      overit: "Nezávislé ocenění a prohlídka; vyloučit záměnu s novostavbami.",
      provenance: "verejna_nabidka",
      fromDocumentWork: true,
    },
    {
      id: "f-market-rent",
      chapter: "Srovnání nájmu",
      podklad: `Veřejné nabídky pronájmu (${b.rent.length}), nájem bez přeúčtovaných služeb`,
      zjisteni: `Nabídkové nájmy ${Math.min(...rentVals).toLocaleString("cs-CZ")}–${Math.max(...rentVals).toLocaleString("cs-CZ")} Kč/měs.; model 20 000 Kč leží uvnitř pásma (např. Bělohorská 20 400 Kč).`,
      dopad: "Nájemní předpoklad je obhajitelný nabídkově, ale služby jdou zvlášť a vyšší standard táhne horní okraj.",
      overit: "Dosahovaný nájem u bytů bez výtahu a s podobným stavem.",
      provenance: "verejna_nabidka",
      fromDocumentWork: true,
    },
    {
      id: "f-fitout",
      chapter: "Rozpočet úprav",
      podklad: fit.title,
      zjisteni: `Volitelný nábytek ${Math.abs(fit.amountDeltaOneOffCzk).toLocaleString("cs-CZ")} Kč lze vynechat; nutný fit-out klesá na 145 000 Kč.`,
      dopad: `Snížení vstupní hotovosti o ${Math.abs(fit.amountDeltaOneOffCzk).toLocaleString("cs-CZ")} Kč bez změny inkasa, pokud nájemník přijme vlastní nábytek.`,
      overit: "Poptávka nájemníků v lokalitě po nezařízených bytech.",
      provenance: "modelovy_podklad",
      fromDocumentWork: true,
    },
    {
      id: "f-roof",
      chapter: "Mimořádné riziko domu",
      podklad: roof.title,
      zjisteni: `Modelové riziko podílu na střeše cca ${roof.amountDeltaOneOffCzk.toLocaleString("cs-CZ")} Kč do 24 měsíců není v běžné údržbě jednotky.`,
      dopad: "Rezerva 150 000 Kč musí krýt i toto riziko vedle prázdna a havárie bytu.",
      overit: "Zápisy SVJ a stav fondu oprav.",
      provenance: "modelovy_podklad",
      fromDocumentWork: true,
    },
    {
      id: "f-occupancy",
      chapter: "Podklady",
      podklad: "Modelový přehled příjmů a neobsazenosti",
      zjisteni: `Historie: 4 měsíce bez nájmu ze 36 → ${(HISTORICAL_VACANCY_RATE * 100).toLocaleString("cs-CZ", { maximumFractionDigits: 2 })} %. Budoucí předpoklad modelu zůstává ${(FUTURE_VACANCY_ASSUMPTION_RATE * 100).toLocaleString("cs-CZ")} % (nižší než historie). Při historickém podílu je upravený tok cca ${Math.round(monthlyOpsCashFlow(b.adjusted.inputs.monthlyRentCzk, HISTORICAL_VACANCY_RATE, b.adjusted.inputs.managementFeeRate, otherAnnualCosts(b.adjusted.inputs), b.adjusted.monthlyPaymentCzk)).toLocaleString("cs-CZ")} Kč/měs.`,
      dopad: "5 % není potvrzeno podkladem. Volba budoucího předpokladu musí být viditelná; stres souvislého prázdna zůstává nutný.",
      overit: "Skutečná historie neobsazenosti u srovnatelných bytů v lokalitě.",
      provenance: "modelovy_podklad",
      fromDocumentWork: true,
    },
    {
      id: "f-liquidity",
      chapter: "Likvidita",
      podklad:
        "Kombinovaný stres: 3 měsíce prázdna + 4. měsíc oprava bez inkasa",
      zjisteni:
        b.liquidity.extraCapitalNeededCzk > 0
          ? `Bez doplnění klesá rezerva pod nulu; model vyžaduje doplnění cca ${Math.round(b.liquidity.extraCapitalNeededCzk).toLocaleString("cs-CZ")} Kč. Konečná rezerva po stresu (s doplněním) cca ${Math.round(b.liquidity.endingReserveCzk).toLocaleString("cs-CZ")} Kč.`
          : `Nejnižší modelový zůstatek rezervy cca ${Math.round(b.liquidity.minReserveCzk).toLocaleString("cs-CZ")} Kč.`,
      dopad: "Budoucí výpadek 5 % ani historických 11,11 % nejsou pojistkou na čtyři měsíce bez inkasa.",
      overit: "Osobní likvidita mimo modelovanou rezervu.",
      provenance: "vypocteno",
      fromDocumentWork: false,
    },
    {
      id: "f-refix",
      chapter: "Refixace",
      podklad: "Izolovaný vs. navazující scénář po 60 splátkách",
      zjisteni: `Izolovaně (nájem 20 000 Kč): tok cca ${Math.round(b.refixIsolated.monthlyCashFlowAfterRefixCzk).toLocaleString("cs-CZ")} Kč. Navazující (nájem po 5× +2 %): cca ${Math.round(b.refixConnected.monthlyCashFlowAfterRefixCzk).toLocaleString("cs-CZ")} Kč.`,
      dopad: "Záměna těchto scénářů zkreslí rozhodnutí o rezervě na refixaci.",
      overit: "Podmínky banky a možnost mimořádné splátky před refixací.",
      provenance: "vypocteno",
      fromDocumentWork: false,
    },
  ];
}

export function buildCaseStudyBundle(
  input: ControlModelInputs = CONTROL_MODEL_INPUTS,
  generatedAt = new Date().toISOString().slice(0, 10)
): CaseStudyBundle {
  const originalModel = runControlModel(input);
  const documents = buildDocuments();
  const adjustedInputs = applyDocumentAdjustments(input);
  // Keep future vacancy assumption explicit (not overwritten by historical 4/36)
  adjustedInputs.vacancyRate = FUTURE_VACANCY_ASSUMPTION_RATE;
  const adjustedModel = runControlModel(adjustedInputs);
  const budgets = buildBudgets(adjustedInputs.initialFitOutCzk);
  const scenarios = runControlScenarios(adjustedInputs);

  const vacancyAnalysis: VacancyAnalysis = {
    historicalEmptyMonths: 4,
    historicalHorizonMonths: 36,
    historicalRate: HISTORICAL_VACANCY_RATE,
    futureAssumptionRate: FUTURE_VACANCY_ASSUMPTION_RATE,
    futureAssumptionReasonCs:
      "Budoucí výpadek 5 % je modelový předpoklad (nižší než historie 11,11 %). Odpovídá scénáři s rychlejší obsazeností než v předloženém tříletém přehledu — není potvrzen podkladem.",
    monthlyCashFlowAtFutureAssumptionCzk: adjustedModel.monthlyCashFlowCzk,
    monthlyCashFlowAtHistoricalRateCzk: monthlyOpsCashFlow(
      adjustedInputs.monthlyRentCzk,
      HISTORICAL_VACANCY_RATE,
      adjustedInputs.managementFeeRate,
      otherAnnualCosts(adjustedInputs),
      adjustedModel.monthlyPaymentCzk
    ),
    noteCs:
      "4 / 36 = 11,11 %. Historii a budoucí předpoklad vždy rozlišujte. Kontrolní hodnoty při upravených nákladech 4 300 Kč/měs.: při 5 % tok ≈ −1 675 Kč; při 4/36 tok ≈ −2 836 Kč.",
  };

  const cells = [];
  for (const rent of SENS_RENTS) {
    for (const rate of SENS_RATES) {
      cells.push({
        monthlyRentCzk: rent,
        annualRatePercent: rate,
        monthlyCashFlowCzk: sensitivityCashFlow(adjustedInputs, rent, rate),
      });
    }
  }

  const concreteDeltas = buildConcreteDeltas(
    adjustedInputs,
    adjustedModel.monthlyCashFlowCzk,
    adjustedModel.monthlyPaymentCzk
  );

  const combinedLiquidity = buildCombinedLiquidity(adjustedModel);
  const longTermFlatCosts = buildLongTerm(adjustedModel, 10, false);
  const longTermGrownCosts = buildLongTerm(adjustedModel, 10, true);

  const basePath10y = simulateReservePath(adjustedModel, 120, {
    applyRefix: false,
    growCosts: false,
  });
  const refixPath10y = simulateReservePath(adjustedModel, 120, {
    applyRefix: true,
    growCosts: false,
  });
  const basePath5y = simulateReservePath(adjustedModel, 60, {
    applyRefix: false,
    growCosts: false,
  });
  const stressThen5y = simulateReservePath(adjustedModel, 60, {
    applyRefix: false,
    growCosts: false,
    stressPrefix: combinedLiquidity,
  });

  const longTermNoRefix = aggregateAnnualFromMonthly(
    basePath10y.points,
    10,
    false
  ).map((row, i) => ({
    ...row,
    propertyValueCzk: longTermFlatCosts[i]!.propertyValueCzk,
    equityCzk: longTermFlatCosts[i]!.equityCzk,
  }));
  const longTermWithRefix = aggregateAnnualFromMonthly(
    refixPath10y.points,
    10,
    false
  ).map((row, i) => ({
    ...row,
    propertyValueCzk: longTermFlatCosts[i]!.propertyValueCzk,
    equityCzk: Math.max(
      0,
      longTermFlatCosts[i]!.propertyValueCzk - row.loanBalanceCzk
    ),
  }));

  const { isolated: refixIsolated, connected: refixConnected } =
    buildRefixScenarios(adjustedModel);
  const sales = buildSales(longTermFlatCosts, adjustedModel);
  const settlementY5 = buildSettlementFromPath(
    adjustedModel,
    sales[0]!,
    basePath5y,
    "base",
    "Základní historie (bez stresu, bez refixace)"
  );
  const settlementY10 = buildSettlementFromPath(
    adjustedModel,
    sales[2]!,
    basePath10y,
    "base",
    "Základní historie (bez stresu, bez refixace)"
  );
  const settlementStressY5 = buildSettlementFromPath(
    adjustedModel,
    sales[0]!,
    stressThen5y,
    "stress",
    "Stres na začátku (4 měsíce bez inkasa + oprava) a pokračování základního provozu"
  );

  const { sale, rent, excluded } = buildMarketListings(
    generatedAt || LISTINGS_ACCESS_DATE
  );

  const findings = buildFindings({
    original: originalModel,
    adjusted: adjustedModel,
    docs: documents,
    sale,
    rent,
    liquidity: combinedLiquidity,
    refixIsolated,
    refixConnected,
  });

  return {
    caseId: CASE_STUDY_ID,
    caseVersion: CASE_STUDY_VERSION,
    modelVersion: CONTROL_MODEL_VERSION,
    generatedAt,
    profile: PROPERTY_PROFILE,
    originalModel,
    adjustedInputs,
    adjustedModel,
    documents,
    budgets,
    scenarios,
    vacancyAnalysis,
    sensitivity: {
      rents: SENS_RENTS,
      rates: SENS_RATES,
      cells,
      concreteDeltas,
    },
    combinedLiquidity,
    timeline: {
      startLabel: "Měsíc 0 = koupě; měsíc 1 = první splátka a provoz",
      rentGrowthPa: RENT_GROWTH_PA,
      costGrowthPa: COST_GROWTH_PA,
      valueGrowthPa: VALUE_GROWTH_PA,
      fixationYears: FIXATION_YEARS,
      refixRatePercent: REFIX_RATE,
      baseMonthly: basePath10y.points,
      baseAnnualFromMonthly: longTermNoRefix,
    },
    longTermFlatCosts,
    longTermGrownCosts,
    longTermWithRefix,
    longTermNoRefix,
    refixIsolated,
    refixConnected,
    sales,
    settlementY5,
    settlementY10,
    settlementStressY5,
    saleListings: sale,
    rentListings: rent,
    excludedListings: excluded,
    findings,
    whatPremiumAddsCs: [
      "Konkrétní lokalita Brno-Židenice a profil bytu (dispozice, patro, výtah, balkon).",
      "Veřejné nabídky prodeje a pronájmu s URL, datem přístupu a důvody vyřazení.",
      "Modelové podklady s úpravou nákladů a fit-outu (před → po) a oddělením historické neobsazenosti 4/36 od budoucího předpokladu 5 %.",
      "Oddělené scénáře: dlouhodobý tok, izolovaná změna sazby, navazující refixace.",
      "Souvislá likvidita: 3 měsíce prázdna + měsíc opravy bez inkasa → opětovné pronajmutí.",
      "Vypořádání investice z historie peněžních toků — konečná rezerva, ne dvojí započtení.",
    ],
    pageTargets: {
      digital: "6–10 stran A4",
      premium: "podle hustoty obsahu a grafů (skutečný počet ve finálním PDF)",
    },
  };
}

/** @deprecated Use saleListings / rentListings; kept for gradual call-site updates */
export type SyntheticListing = MarketListing;
