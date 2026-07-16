import { unifiedDestinations } from "@/lib/unified-destinations";

export type FinancingChoice = "max_leverage" | "partial" | "cash";
export type PurposeChoice =
  | "yield_max"
  | "partial_use"
  | "conservative"
  | "flipping";
export type HorizonChoice = "3_months" | "6_months" | "1_year" | "just_looking";
export type RegionChoice =
  | "exotic_high_yield"
  | "eu_stability"
  | "czech_slovak";

export interface PassportFormData {
  capital: string;
  financing: FinancingChoice | "";
  purpose: PurposeChoice | "";
  horizon: HorizonChoice | "";
  region: RegionChoice | "";
  name: string;
  email: string;
  phone: string;
}

export const initialPassportForm: PassportFormData = {
  capital: "",
  financing: "",
  purpose: "",
  horizon: "",
  region: "",
  name: "",
  email: "",
  phone: "",
};

export const FINANCING_OPTIONS: {
  value: FinancingChoice;
  title: string;
  description: string;
}[] = [
  {
    value: "max_leverage",
    title: "Chci využít hypotéku / splátkový kalendář na maximum",
    description: "Chci finanční páku a maximální dostupný rozpočet.",
  },
  {
    value: "partial",
    title: "Mám dost hotovosti, možná využiji jen menší úvěr",
    description: "Kombinace silného vlastního kapitálu a menšího úvěru.",
  },
  {
    value: "cash",
    title: "Platím 100 % v hotovosti",
    description: "Bez úvěru — maximální vyjednávací pozice a rychlost.",
  },
];

export const PURPOSE_OPTIONS: {
  value: PurposeChoice;
  title: string;
  description: string;
}[] = [
  {
    value: "yield_max",
    title: "Čistě investice: Maximalizace cash-flow a výnosu",
    description: "Airbnb / dlouhodobý pronájem bez nutnosti vlastní rekreace.",
  },
  {
    value: "partial_use",
    title: "Mix: Občas užívat, zbytek roku pronajímat",
    description: "Dovolená + výnos — druhý domov s cash-flow.",
  },
  {
    value: "conservative",
    title: "Ochrana před inflací",
    description: "Konzervativní uložení peněz v bezpečné lokalitě.",
  },
  {
    value: "flipping",
    title: "Rychlý zisk: Flipping",
    description: "Koupit, zrekonstruovat a se ziskem prodat.",
  },
];

export const REGION_OPTIONS: {
  value: RegionChoice;
  title: string;
  description: string;
}[] = [
  {
    value: "exotic_high_yield",
    title: "Exotika a jiná měna je OK",
    description: "Nadstandardní výnos — Dubaj, Bali.",
  },
  {
    value: "eu_stability",
    title: "Evropská jistota a blízkost domova",
    description: "Právní ochrana EU — Španělsko, Itálie, Chorvatsko.",
  },
  {
    value: "czech_slovak",
    title: "Preferuji domácí trh",
    description: "ČR a Slovensko — bez zahraniční komplexity.",
  },
];

export const HORIZON_OPTIONS: {
  value: HorizonChoice;
  title: string;
}[] = [
  { value: "3_months", title: "Do 3 měsíců" },
  { value: "6_months", title: "Do 6 měsíců" },
  { value: "1_year", title: "Do roka" },
  { value: "just_looking", title: "Jen se rozhlížím" },
];

export interface ScoredMarket {
  name: string;
  score: number;
  reason: string;
  image: string;
  slug: string;
  desc: string;
}

export interface PassportResult {
  capital: number;
  reachableBudget: number;
  markets: ScoredMarket[];
  profileLabel: string;
  financingLabel: string;
  horizonLabel: string;
}

const BUDGET_MULTIPLIER = 3;

function getDestinationMeta(name: string) {
  return unifiedDestinations.find((d) => d.country === name);
}

export function calculateTopMarkets(
  data: PassportFormData
): ScoredMarket[] {
  const scores: Record<string, { score: number; reason: string }> = {
    "SAE (Dubaj)": {
      score: 0,
      reason:
        "Vysoký výnos a možnost výborných splátkových kalendářů od developerů.",
    },
    "Bali (Indonésie)": {
      score: 0,
      reason:
        "Absolutně nejvyšší ROI z krátkodobého pronájmu a exotická diverzifikace.",
    },
    Španělsko: {
      score: 0,
      reason:
        "Ideální evropský mix pro vlastní rekreaci a celoroční pronájem.",
    },
    Itálie: {
      score: 0,
      reason:
        "Stabilní právní systém a obrovský potenciál pro zhodnocení v turistických oblastech.",
    },
    Chorvatsko: {
      score: 0,
      reason:
        "Dostupnost autem, Schengen, Euro a prémiový růst adriatického pobřeží.",
    },
    "Česká republika": {
      score: 0,
      reason: "Bez měnového rizika, domácí právo a skvělá dostupnost hypoték.",
    },
    Slovensko: {
      score: 0,
      reason:
        "Zajištění v EUR bez jazykové bariéry a s identickým právním systémem.",
    },
  };

  if (data.purpose === "yield_max") {
    scores["Bali (Indonésie)"].score += 5;
    scores["SAE (Dubaj)"].score += 4;
  }
  if (data.purpose === "partial_use") {
    scores.Španělsko.score += 5;
    scores.Chorvatsko.score += 4;
    scores.Itálie.score += 4;
  }
  if (data.purpose === "conservative") {
    scores["Česká republika"].score += 5;
    scores.Španělsko.score += 3;
  }
  if (data.purpose === "flipping") {
    scores["SAE (Dubaj)"].score += 5;
    scores["Bali (Indonésie)"].score += 3;
    scores["Česká republika"].score += 3;
  }

  if (data.region === "exotic_high_yield") {
    scores["Bali (Indonésie)"].score += 5;
    scores["SAE (Dubaj)"].score += 5;
  }
  if (data.region === "eu_stability") {
    scores.Španělsko.score += 5;
    scores.Itálie.score += 4;
    scores.Chorvatsko.score += 4;
  }
  if (data.region === "czech_slovak") {
    scores["Česká republika"].score += 10;
    scores.Slovensko.score += 8;
  }

  if (data.financing === "max_leverage") {
    scores["Česká republika"].score += 2;
    scores["SAE (Dubaj)"].score += 3;
    scores.Slovensko.score += 1;
  }
  if (data.financing === "cash") {
    scores["Bali (Indonésie)"].score += 2;
    scores.Itálie.score += 1;
  }

  if (data.horizon === "3_months" || data.horizon === "6_months") {
    scores["Česká republika"].score += 1;
    scores["SAE (Dubaj)"].score += 1;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)
    .map(([name, meta]) => {
      const dest = getDestinationMeta(name);
      return {
        name,
        score: meta.score,
        reason: meta.reason,
        image: dest?.image ?? "",
        slug: dest?.slug ?? "",
        desc: dest?.desc ?? "",
      };
    });
}

function profileLabelFromData(data: PassportFormData): string {
  if (data.purpose === "yield_max") return "Yield maximizer";
  if (data.purpose === "partial_use") return "Lifestyle + yield investor";
  if (data.purpose === "conservative") return "Inflační konzervativec";
  if (data.purpose === "flipping") return "Value-add / Flipping specialista";
  return "Vyvážený investor";
}

export function evaluateInvestmentPassport(
  data: PassportFormData
): PassportResult {
  const capital = Number(data.capital) || 0;
  const reachableBudget =
    data.financing === "cash"
      ? capital
      : Math.round(capital * BUDGET_MULTIPLIER);

  const financingLabel =
    FINANCING_OPTIONS.find((o) => o.value === data.financing)?.title ?? "—";
  const horizonLabel =
    HORIZON_OPTIONS.find((o) => o.value === data.horizon)?.title ?? "—";

  return {
    capital,
    reachableBudget,
    markets: calculateTopMarkets(data),
    profileLabel: profileLabelFromData(data),
    financingLabel,
    horizonLabel,
  };
}
