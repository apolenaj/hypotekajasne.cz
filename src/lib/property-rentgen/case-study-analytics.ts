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

export const CASE_STUDY_ID = "modelovy-byt-zidenice-60m2-v2" as const;
export const CASE_STUDY_LABEL_CS =
  "Modelový byt 2+kk · 60 m² · Brno-Židenice" as const;
export const CASE_STUDY_VERSION = "2026-09-18.v2" as const;

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
  initialOwnCashCzk: number;
  cumulativeOperatingCashCzk: number;
  investorTopUpsCzk: number;
  saleNetProceedsBeforeTaxCzk: number;
  reserveReleasedCzk: number;
  /** Total wealth change vs starting cash — before income tax */
  totalResultBeforeTaxCzk: number;
  excludedCs: string;
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
  combinedLiquidity: {
    noteCs: string;
    path: ReserveMonth[];
    minReserveCzk: number;
    extraCapitalNeededCzk: number;
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
  };
  longTermFlatCosts: LongTermRow[];
  longTermGrownCosts: LongTermRow[];
  refixIsolated: RefixScenario;
  refixConnected: RefixScenario;
  sales: SaleScenario[];
  settlementY5: InvestmentSettlement;
  settlementY10: InvestmentSettlement;
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
      says: "Za poslední 3 roky: 2 výměny nájemníků, celkem 4 měsíce bez nájmu, průměrný nájem 19,5–20,5 tis. Kč bez záloh.",
      relevantForOwner:
        "Průměrný výpadek ~5 % je sladěný s historií, ale 3 měsíce souvislého prázdna se v historii vyskytly — stresový test je nutný.",
      originalModelGap:
        "Výpadek 5 % v modelu sedí jako dlouhodobý průměr; nestačí jako likviditní polštář pro souvislé prázdno.",
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
 * Combined path: 3 empty months (no average vacancy), repair 80k in month 4,
 * re-lease from month 5 with base adjusted CF. Unit-maintenance 1 000 Kč is part
 * of fixed outflow while empty (cash expense), not double-counted as a separate
 * transfer on top of that. When occupied, the 1 000 Kč is inside the CF figure.
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

  for (let m = 1; m <= 8; m += 1) {
    const opening = bal;
    let opsIn = 0;
    let outflow = 0;
    let transfer = 0;
    let note = "";
    if (m <= 3) {
      outflow = emptyOutflow;
      transfer = input.unitMaintenanceReserveAnnualCzk / 12;
      note = `Prázdný byt — odtok ${Math.round(emptyOutflow).toLocaleString("cs-CZ")} Kč (splátka + náklady vlastníka vč. tvorby rezervy na údržbu). Průměrný výpadek 5 % se neaplikuje.`;
    } else if (m === 4) {
      outflow = emptyOutflow + 80_000;
      transfer = input.unitMaintenanceReserveAnnualCzk / 12;
      note =
        "Prázdný byt + mimořádná oprava 80 000 Kč (skutečný výdaj). Údržbová položka v odtoku není druhý převod navíc.";
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

  // Pass 2: apply top-up when balance would go negative (external capital)
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
      "Souvislý scénář: 3 měsíce bez nájmu → oprava 80 000 Kč v měsíci 4 → opětovné pronajmutí. Průměrný výpadek 5 % se v prázdných měsících nepoužívá. Položka údržby 1 000 Kč/měs. je součástí provozního odtoku při prázdnu (skutečný cash), nikoli druhý převod navíc.",
    path,
    minReserveCzk: minRaw,
    extraCapitalNeededCzk: Math.max(extraCapitalNeededCzk, injected),
    whatReserveCoversCs:
      "Oddělená hotovost 150 000 Kč: provozní odtoky při prázdnu, splátka, modelovaná havárie bytu. Nezahrnuje automaticky podíl na opravě střechy (samostatné riziko).",
    whatHappensNextVacancyCs:
      "Opakované 3měsíční prázdno po vyčerpání vyžaduje nové externí doplnění — z doplatkového CF se polštář obnovuje pomalu nebo vůbec.",
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

function buildSettlement(
  model: ControlModelResult,
  sale: SaleScenario,
  longTerm: LongTermRow[],
  topUpsCzk: number
): InvestmentSettlement {
  const years = sale.holdYears;
  let cumulative = 0;
  for (let y = 1; y <= years; y += 1) {
    cumulative += longTerm[y - 1]!.netCfCzk * 12;
  }
  const reserveReleased = model.inputs.cashReserveCzk;
  const total =
    -model.totalOwnCashIncludingReserveCzk +
    cumulative -
    topUpsCzk +
    sale.netProceedsBeforeTaxCzk +
    reserveReleased;

  return {
    holdYears: years,
    initialOwnCashCzk: model.totalOwnCashIncludingReserveCzk,
    cumulativeOperatingCashCzk: cumulative,
    investorTopUpsCzk: topUpsCzk,
    saleNetProceedsBeforeTaxCzk: sale.netProceedsBeforeTaxCzk,
    reserveReleasedCzk: reserveReleased,
    totalResultBeforeTaxCzk: total,
    excludedCs:
      "Bez daně z příjmů FO, bez poplatků za úvěr mimo model a bez výnosu z hotovostní rezervy. Splacená jistina je v nižším dluhu při prodeji — nepočítá se znovu jako příjem.",
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
  const pay58 = computeMonthlyAnnuity(
    input.loanAmountCzk,
    input.annualRatePercent + 1,
    input.termYears
  );
  const cfRateUp = monthlyOpsCashFlow(
    input.monthlyRentCzk,
    input.vacancyRate,
    input.managementFeeRate,
    other,
    pay58
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
      id: "rate-plus-1pp",
      label: "Sazba +1 p.b. od počátku",
      changeDescriptionCs: `Sazba ${input.annualRatePercent} % → ${(input.annualRatePercent + 1).toLocaleString("cs-CZ")} % při stejném úvěru a splatnosti (ne refixace)`,
      deltaMonthlyCashFlowCzk: cfRateUp - baseCf,
      deltaPaymentCzk: pay58 - basePayment,
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
      id: "f-liquidity",
      chapter: "Likvidita",
      podklad: "Kombinovaný stres 3× prázdno + oprava 80 tis.",
      zjisteni:
        b.liquidity.extraCapitalNeededCzk > 0
          ? `Bez doplnění klesá rezerva pod nulu; model vyžaduje doplnění cca ${Math.round(b.liquidity.extraCapitalNeededCzk).toLocaleString("cs-CZ")} Kč.`
          : `Nejnižší modelový zůstatek rezervy cca ${Math.round(b.liquidity.minReserveCzk).toLocaleString("cs-CZ")} Kč.`,
      dopad: "Průměrný výpadek 5 % ≠ pojistka na souvislé prázdno.",
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
  const adjustedModel = runControlModel(adjustedInputs);
  const budgets = buildBudgets(adjustedInputs.initialFitOutCzk);
  const scenarios = runControlScenarios(adjustedInputs);

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
  const { isolated: refixIsolated, connected: refixConnected } =
    buildRefixScenarios(adjustedModel);
  const sales = buildSales(longTermFlatCosts, adjustedModel);
  const settlementY5 = buildSettlement(
    adjustedModel,
    sales[0]!,
    longTermFlatCosts,
    combinedLiquidity.extraCapitalNeededCzk
  );
  const settlementY10 = buildSettlement(
    adjustedModel,
    sales[2]!,
    longTermFlatCosts,
    combinedLiquidity.extraCapitalNeededCzk
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
    sensitivity: {
      rents: SENS_RENTS,
      rates: SENS_RATES,
      cells,
      concreteDeltas,
    },
    combinedLiquidity,
    timeline: {
      startLabel: "Měsíc 0 = koupě a začátek úvěru",
      rentGrowthPa: RENT_GROWTH_PA,
      costGrowthPa: COST_GROWTH_PA,
      valueGrowthPa: VALUE_GROWTH_PA,
      fixationYears: FIXATION_YEARS,
      refixRatePercent: REFIX_RATE,
    },
    longTermFlatCosts,
    longTermGrownCosts,
    refixIsolated,
    refixConnected,
    sales,
    settlementY5,
    settlementY10,
    saleListings: sale,
    rentListings: rent,
    excludedListings: excluded,
    findings,
    whatPremiumAddsCs: [
      "Konkrétní lokalita Brno-Židenice a profil bytu (dispozice, patro, výtah, balkon).",
      "Veřejné nabídky prodeje a pronájmu s URL, datem přístupu a důvody vyřazení.",
      "Čtyři modelové podklady s úpravou nákladů a fit-outu (před → po).",
      "Oddělené scénáře: dlouhodobý tok, izolovaná změna sazby, navazující refixace.",
      "Souvislá likvidita: prázdno → oprava → opětovné pronajmutí.",
      "Vypořádání investice oddělené od pouhého inkasa při prodeji.",
    ],
    pageTargets: {
      digital: "6–10 stran A4",
      premium: "cíl 25–30 stran A4 podle hustoty obsahu",
    },
  };
}

/** @deprecated Use saleListings / rentListings; kept for gradual call-site updates */
export type SyntheticListing = MarketListing;
