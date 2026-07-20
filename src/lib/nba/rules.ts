import { routes } from "@/lib/routes";
import type { NbaEngineInput, NbaRule } from "@/lib/nba/types";

function daysFromNow(now: Date, days: number): string {
  return new Date(now.getTime() + days * 86_400_000).toISOString();
}

/**
 * Ordered catalog of rules. Engine evaluates all; priority decides ranking.
 * Keep predicates pure and side-effect free.
 */
export const NBA_RULES: NbaRule[] = [
  {
    id: "start_readiness",
    name: "Chybí Financial Passport / připravenost",
    priority: 100,
    when: (c) => !c.hasProfile,
    build: () => ({
      action: "Spusťte Hypoteční připravenost",
      reason:
        "Bez lokálního profilu neumíme spočítat safe buying power ani personalizovat další kroky.",
      expectedBenefit:
        "Získáte orientační skóre připravenosti a rozpočet (MODEL) — bez příslibu schválení.",
      expiresAt: null,
      sourceData: {
        keys: ["profile.exists"],
        claimKind: "DATA",
        snapshot: { hasProfile: false },
      },
      blockingIssues: ["Chybí uložený profil připravenosti"],
      href: routes.navrhNaMiru,
      urgency: "high",
    }),
  },
  {
    id: "add_income",
    name: "Chybí čistý příjem",
    priority: 96,
    when: (c) => c.hasProfile && c.incomeNet <= 0,
    build: () => ({
      action: "Doplňte příjem",
      reason: "Bez čistého příjmu je dostupnost a DSTI jen prázdný odhad.",
      expectedBenefit: "Odemkne výpočet bezpečné splátky a skóre affordability.",
      expiresAt: null,
      sourceData: {
        keys: ["income.totalNetIncome"],
        claimKind: "DATA",
        snapshot: { incomeNet: 0 },
      },
      blockingIssues: ["Chybí čistý měsíční příjem"],
      href: routes.navrhNaMiru,
      urgency: "high",
    }),
  },
  {
    id: "readiness_below_50",
    name: "Readiness pod 50",
    priority: 92,
    when: (c) =>
      c.hasProfile &&
      c.readinessScore != null &&
      c.readinessScore < 50 &&
      c.incomeNet > 0,
    build: (c) => ({
      action: "Nejdříve zlepšete finanční připravenost",
      reason: `Vaše modelové skóre je ${c.readinessScore}/100 — pod prahem 50. Další kroky (nemovitost, handoff) mají nižší smysl, dokud se nezvedne základ.`,
      expectedBenefit:
        "Simulace v Financial Passportu ukáže nejrychlejší páky (závazky, zdroje, příjem).",
      expiresAt: null,
      sourceData: {
        keys: ["readiness.overall"],
        claimKind: "MODEL",
        snapshot: { readinessScore: c.readinessScore },
      },
      blockingIssues: ["Nízká finanční připravenost (< 50)"],
      href: routes.financniPas,
      urgency: "high",
    }),
  },
  {
    id: "missing_own_funds",
    name: "Chybí / nízké vlastní prostředky",
    priority: 88,
    when: (c) =>
      c.hasProfile &&
      c.incomeNet > 0 &&
      c.ownFunds < 200_000 &&
      (c.readinessScore == null || c.readinessScore >= 40),
    build: (c) => ({
      action: "Simulujte alternativy financování",
      reason:
        "Vlastní zdroje v modelu jsou nízké nebo chybí — LTV rámec a akontace limitují možnosti.",
      expectedBenefit:
        "Uvidíte, jak doplnění equity nebo levnější cíl změní safe / recommended rozpočet.",
      expiresAt: null,
      sourceData: {
        keys: ["assets.totalOwnFundsModel", "financing.ownFundsRequirement"],
        claimKind: "DATA",
        snapshot: { ownFunds: c.ownFunds },
      },
      blockingIssues: ["Nedostatečné vlastní prostředky v modelu"],
      href: routes.financniPas,
      urgency: "high",
    }),
  },
  {
    id: "incomplete_profile",
    name: "Neúplný profil",
    priority: 84,
    when: (c) =>
      c.hasProfile && c.incomeNet > 0 && c.profileCompleteness < 55,
    build: (c) => ({
      action: "Doplňte profil připravenosti",
      reason: `Profil je hotový cca z ${c.profileCompleteness} % — chybí údaje potřebné pro spolehlivější model.`,
      expectedBenefit: "Přesnější dimenze skóre a méně NEOVĚŘENO v dashboardu.",
      expiresAt: null,
      sourceData: {
        keys: ["profile.completeness"],
        claimKind: "DATA",
        snapshot: { completeness: c.profileCompleteness },
      },
      blockingIssues: ["Neúplný Financial Passport"],
      href: routes.navrhNaMiru,
      urgency: "medium",
    }),
  },
  {
    id: "fixation_within_12m",
    name: "Fixace končí do 12 měsíců",
    priority: 82,
    when: (c) =>
      c.hasProfile &&
      c.fixationMonthsRemaining != null &&
      c.fixationMonthsRemaining >= 0 &&
      c.fixationMonthsRemaining <= 12,
    build: (c) => {
      const m = c.fixationMonthsRemaining!;
      const now = c.now ?? new Date();
      return {
        action: "Začněte sledovat refinancování",
        reason:
          m === 0
            ? "Fixace podle profilu právě končí nebo už skončila."
            : `Vaše fixace končí za ${m} měsíců — dává smysl připravit srovnání v klidu, ne na poslední chvíli.`,
        expectedBenefit:
          "Čas na stress test sazby a nezávaznou konzultaci — bez nátlaku „jen dnes“.",
        expiresAt: daysFromNow(now, Math.max(7, m * 30)),
        sourceData: {
          keys: ["refinance.yearsLeft", "fixationMonthsRemaining"],
          claimKind: "DATA",
          snapshot: { fixationMonthsRemaining: m, purpose: c.purpose },
        },
        blockingIssues:
          m <= 3 ? ["Blížící se konec fixace"] : [],
        href: routes.refinanceRadar,
        urgency: m <= 3 ? "high" : "medium",
      };
    },
  },
  {
    id: "high_ltv_stress",
    name: "Vysoké LTV u investora",
    priority: 78,
    when: (c) =>
      c.hasProfile &&
      (c.purpose === "investment" || c.purpose === "foreign_purchase") &&
      c.estimatedLtv != null &&
      c.estimatedLtv >= 0.8,
    build: (c) => ({
      action: "Simulovat pokles hodnoty nemovitosti",
      reason: `Modelové LTV je cca ${Math.round((c.estimatedLtv ?? 0) * 100)} % — při investici je cushion při poklesu ceny tenčí.`,
      expectedBenefit:
        "V Rentgenu / modeláři uvidíte citlivost cash-flow a equity na pokles ceny (MODEL).",
      expiresAt: null,
      sourceData: {
        keys: ["propertyGoals.targetPrice", "assets.totalOwnFundsModel", "ltv"],
        claimKind: "MODEL",
        snapshot: {
          estimatedLtv: c.estimatedLtv,
          purpose: c.purpose,
        },
      },
      blockingIssues: ["Vysoké modelové LTV (≥ 80 %)"],
      href: routes.investicniRentgenModelar,
      urgency: "medium",
    }),
  },
  {
    id: "price_drop_watchlist",
    name: "Pokles ceny na watchlistu",
    priority: 76,
    when: (c) => c.priceDropPct != null && c.priceDropPct <= -3,
    build: (c) => ({
      action: `Zkontrolujte „${c.priceDropLabel ?? "nemovitost"}“ po poklesu ceny`,
      reason: `Uložená cena klesla o ${Math.abs(c.priceDropPct!).toFixed(0)} % — ověřte fit k safe rozpočtu.`,
      expectedBenefit: "Aktualizovaný affordability fit bez zbytečného spěchu.",
      expiresAt: null,
      sourceData: {
        keys: ["watchlist.priceChangePct"],
        claimKind: "DATA",
        snapshot: {
          priceDropPct: c.priceDropPct,
          label: c.priceDropLabel,
        },
      },
      blockingIssues: [],
      href: routes.sledovani,
      urgency: "medium",
    }),
  },
  {
    id: "start_smart_watchlist",
    name: "Založit Smart Watchlist",
    priority: 72,
    when: (c) =>
      c.hasProfile &&
      c.watchlistCount === 0 &&
      !c.hasSavedProperty &&
      (c.readinessScore == null || c.readinessScore <= 75),
    build: () => ({
      action: "Přidejte nemovitost nebo filtr do Smart Watchlistu",
      reason:
        "Sledování ceny, stáří inzerátu a modelové splátky je hlavní retention funkce — alerty jen z dostupných dat.",
      expectedBenefit: "Vrátíte se, když se něco skutečně změní (throttle proti spamu).",
      expiresAt: null,
      sourceData: {
        keys: ["watchlist.count"],
        claimKind: "DATA",
        snapshot: { watchlistCount: 0 },
      },
      blockingIssues: [],
      href: routes.sledovani,
      urgency: "low",
    }),
  },
  {
    id: "property_over_budget",
    name: "Nemovitost nad stropem",
    priority: 74,
    when: (c) => Boolean(c.propertyOverBudgetLabel),
    build: (c) => ({
      action: "Zkontrolujte financování uložené nemovitosti",
      reason: `„${c.propertyOverBudgetLabel}“ je nad modelovým stropem z Financial Passportu.`,
      expectedBenefit:
        "Upravíte cíl, zdroje nebo splátku dřív, než budete řešit rezervaci.",
      expiresAt: null,
      sourceData: {
        keys: ["watchlist.affordabilityFit", "financing.estimatedMaximum"],
        claimKind: "MODEL",
        snapshot: { label: c.propertyOverBudgetLabel },
      },
      blockingIssues: ["Cena nad modelovým rozpočtem"],
      href: routes.kalkulacky.root,
      urgency: "medium",
    }),
  },
  {
    id: "ready_browse_majetio",
    name: "Vysoká readiness bez nemovitosti",
    priority: 70,
    when: (c) =>
      c.hasProfile &&
      c.readinessScore != null &&
      c.readinessScore > 75 &&
      !c.hasSavedProperty &&
      c.watchlistCount === 0,
    build: (c) => ({
      action: "Zobrazit vhodné nabídky na Majetio",
      reason: `Připravenost ${c.readinessScore}/100 a zatím nemáte vybranou nemovitost — discovery podle safe rozpočtu dává smysl.`,
      expectedBenefit:
        "Prohlédnete nabídky v rozpočtu z passportu (bez PII v URL).",
      expiresAt: null,
      sourceData: {
        keys: ["readiness.overall", "watchlist.count"],
        claimKind: "MODEL",
        snapshot: {
          readinessScore: c.readinessScore,
          watchlistCount: 0,
        },
      },
      blockingIssues: [],
      href: routes.oMajetio,
      urgency: "medium",
    }),
  },
  {
    id: "analyze_saved_property",
    name: "Uložená nemovitost → analýza",
    priority: 66,
    when: (c) => c.hasSavedProperty || c.watchlistCount > 0,
    build: (c) => ({
      action: "Spustit investiční analýzu",
      reason: "Máte uloženou nemovitost — free preview v Rentgenu doplní yield / rizika s claim statusem.",
      expectedBenefit: "DATA / MODEL / ODHAD metrik místo dojmů z inzerátu.",
      expiresAt: null,
      sourceData: {
        keys: ["watchlist.count"],
        claimKind: "DATA",
        snapshot: { watchlistCount: c.watchlistCount },
      },
      blockingIssues: [],
      href: routes.investicniRentgen,
      urgency: "low",
    }),
  },
  {
    id: "raise_score_moderate",
    name: "Střední readiness — páka",
    priority: 55,
    when: (c) =>
      c.hasProfile &&
      c.readinessScore != null &&
      c.readinessScore >= 50 &&
      c.readinessScore < 75,
    build: (c) => ({
      action: c.topLeverTitle ?? "Zlepšete připravenost o další stupeň",
      reason: `Skóre ${c.readinessScore}/100 je solidní základ, ale do „připraven k průzkumu“ zbývá prostor.`,
      expectedBenefit: "Konkrétní páka z Financial Passportu (simulace).",
      expiresAt: null,
      sourceData: {
        keys: ["readiness.overall", "readiness.topLevers"],
        claimKind: "MODEL",
        snapshot: { readinessScore: c.readinessScore },
      },
      blockingIssues: [],
      href: routes.financniPas,
      urgency: "low",
    }),
  },
  {
    id: "refinance_intent_generic",
    name: "Účel refinancování bez známé fixace",
    priority: 52,
    when: (c) =>
      c.hasProfile &&
      c.purpose === "refinance" &&
      (c.fixationMonthsRemaining == null || c.fixationMonthsRemaining > 12),
    build: () => ({
      action: "Doplňte zbývající fixaci a zůstatek",
      reason:
        "U refinancování bez údaje o fixaci neumíme včas upozornit na refixaci.",
      expectedBenefit: "Zapne pravidlo „sledovat refinancování“ ve správný čas.",
      expiresAt: null,
      sourceData: {
        keys: ["propertyGoals.purpose", "refinance.yearsLeft"],
        claimKind: "DATA",
        snapshot: { purpose: "refinance" },
      },
      blockingIssues: ["Neznámá zbývající fixace"],
      href: routes.navrhNaMiru,
      urgency: "low",
    }),
  },
];

export function getRuleById(id: string): NbaRule | undefined {
  return NBA_RULES.find((r) => r.id === id);
}
