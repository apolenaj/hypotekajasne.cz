import { routes } from "@/lib/routes";
import { getAcademyLessonPath } from "@/lib/academy";
import type {
  AcademyCharacter,
  AcademyCharacterId,
  LearningPath,
  LearningPathId,
  LessonToolBridge,
} from "@/lib/academy/gamification/types";

export const ACADEMY_CHARACTERS: AcademyCharacter[] = [
  {
    id: "investor_igor",
    name: "Investor Igor",
    role: "Investiční průvodce",
    tagline: "Výnos, cash flow a páka — bez slibů garantovaného zisku.",
    topics: ["yield", "cash-flow", "portfolio", "investment"],
    accentColor: "#1a5c4a",
    illustrationClass: "academy-char-igor",
    animationStates: ["idle", "talking", "pointing", "thinking"],
    trustNote:
      "Igor je vizuální průvodce lekcemi — numerická tvrzení vždy z kalkulaček a DATA/MODEL badge.",
  },
  {
    id: "banker_bohous",
    name: "Bankéř Bohouš",
    role: "Hypoteční mechanika",
    tagline: "LTV, RPSN, fixace — vysvětlí pravidla, neprodává produkt.",
    topics: ["ltv", "rpsn", "fixace", "dti", "dsti"],
    accentColor: "#0f4c48",
    illustrationClass: "academy-char-bohous",
    animationStates: ["idle", "talking", "pointing"],
    trustNote:
      "Bohouš nenahrazuje hypotečního specialistu ani schválení banky.",
  },
  {
    id: "madame_inflation",
    name: "Paní Inflace",
    role: "Makro a reálná hodnota peněz",
    tagline: "Inflace, úroky a čas — kontext pro rozhodnutí koupit vs. čekat.",
    topics: ["inflace", "macro", "rates"],
    accentColor: "#8b6914",
    illustrationClass: "academy-char-inflation",
    animationStates: ["idle", "talking", "thinking"],
    trustNote: "Scénáře jsou MODEL — ne predikce ČNB.",
  },
  {
    id: "property_detective",
    name: "Realitní detektiv",
    role: "Due diligence a prohlídky",
    tagline: "Co ověřit před nabídkou — checklist, ne clickbait.",
    topics: ["due-diligence", "foreign", "off-plan", "escrow"],
    accentColor: "#4a3728",
    illustrationClass: "academy-char-detective",
    animationStates: ["idle", "pointing", "thinking"],
    trustNote: "Detektiv není právník — eskalace na human-expert zůstává.",
  },
];

export function getCharacter(id: AcademyCharacterId): AcademyCharacter {
  return ACADEMY_CHARACTERS.find((c) => c.id === id)!;
}

function lessonStep(slug: string, label: string, mins: number) {
  return {
    kind: "lesson" as const,
    id: `lesson_${slug}`,
    label,
    lessonSlug: slug,
    href: getAcademyLessonPath(slug),
    estimatedMinutes: mins,
    weight: 0.1,
  };
}

function quizStep(slug: string, label: string) {
  return {
    kind: "quiz" as const,
    id: `quiz_${slug}`,
    label,
    lessonSlug: slug,
    href: `${getAcademyLessonPath(slug)}#quiz`,
    estimatedMinutes: 3,
    weight: 0.0625,
  };
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "first_home",
    title: "První bydlení",
    subtitle: "LTV, DSTI a fixace — základ před první prohlídkou.",
    persona: "Vlastní bydlení, první hypotéka",
    guideCharacterId: "banker_bohous",
    badgeId: "ready_first_viewing",
    steps: [
      lessonStep("ltv", "Lekce: LTV", 5),
      quizStep("ltv", "Quiz: LTV"),
      lessonStep("dsti", "Lekce: DSTI", 4),
      quizStep("dsti", "Quiz: DSTI"),
      lessonStep("rpsn", "Lekce: RPSN", 4),
      quizStep("rpsn", "Quiz: RPSN"),
      lessonStep("fixace", "Lekce: Fixace", 4),
      quizStep("fixace", "Quiz: Fixace"),
      {
        kind: "calculator",
        id: "calc_first_home",
        label: "Kalkulačka: splátka a LTV",
        href: routes.kalkulacky.root,
        estimatedMinutes: 5,
        weight: 0.2,
      },
      {
        kind: "practical_task",
        id: "task_first_home_passport",
        label: "Praktický úkol: vyplnit Financial Passport",
        href: routes.financniPas,
        estimatedMinutes: 10,
        weight: 0.15,
      },
    ],
  },
  {
    id: "osvc_mortgage",
    title: "Hypotéka pro OSVČ",
    subtitle: "DTI, DSTI a doložení příjmů — bez slibů schválení.",
    persona: "OSVČ / živnostník",
    guideCharacterId: "banker_bohous",
    badgeId: "understand_ltv",
    steps: [
      lessonStep("dti", "Lekce: DTI", 5),
      quizStep("dti", "Quiz: DTI"),
      lessonStep("dsti", "Lekce: DSTI", 4),
      quizStep("dsti", "Quiz: DSTI"),
      lessonStep("ltv", "Lekce: LTV a akontace", 5),
      quizStep("ltv", "Quiz: LTV"),
      {
        kind: "calculator",
        id: "calc_osvc_readiness",
        label: "Hypoteční připravenost",
        href: routes.navrhNaMiru,
        estimatedMinutes: 8,
        weight: 0.2,
      },
      {
        kind: "practical_task",
        id: "task_osvc_vault",
        label: "Praktický úkol: checklist dokumentů OSVČ",
        href: routes.documentVault,
        estimatedMinutes: 15,
        weight: 0.15,
      },
    ],
  },
  {
    id: "refinance",
    title: "Refinancování",
    subtitle: "Fixace, RPSN a kdy dává smysl refinancovat.",
    persona: "Majitel hypotéky před koncem fixace",
    guideCharacterId: "banker_bohous",
    badgeId: "refinance_ready",
    steps: [
      lessonStep("fixace", "Lekce: Fixace", 4),
      quizStep("fixace", "Quiz: Fixace"),
      lessonStep("rpsn", "Lekce: RPSN", 4),
      quizStep("rpsn", "Quiz: RPSN"),
      lessonStep("americka-hypoteka", "Lekce: Americká hypotéka", 5),
      quizStep("americka-hypoteka", "Quiz: Americká hypotéka"),
      {
        kind: "calculator",
        id: "calc_refinance_radar",
        label: "Refinance Radar",
        href: routes.refinanceRadar,
        estimatedMinutes: 8,
        weight: 0.2,
      },
      {
        kind: "practical_task",
        id: "task_refinance_profile",
        label: "Praktický úkol: zadat profil úvěru",
        href: routes.refinanceRadar,
        estimatedMinutes: 10,
        weight: 0.15,
      },
    ],
  },
  {
    id: "first_investment",
    title: "První investiční byt",
    subtitle: "Cash flow, DTI a páka — investor basics.",
    persona: "První investiční nemovitost",
    guideCharacterId: "investor_igor",
    badgeId: "investor_basics_complete",
    steps: [
      lessonStep("ltv", "Lekce: LTV (páka)", 5),
      quizStep("ltv", "Quiz: LTV"),
      lessonStep("cash-flow", "Lekce: Cash flow", 5),
      quizStep("cash-flow", "Quiz: Cash flow"),
      lessonStep("dti", "Lekce: DTI", 4),
      quizStep("dti", "Quiz: DTI"),
      lessonStep("snowball", "Lekce: Snowball", 4),
      quizStep("snowball", "Quiz: Snowball"),
      {
        kind: "calculator",
        id: "calc_investment_rentgen",
        label: "Investiční rentgen",
        href: routes.investicniRentgen,
        estimatedMinutes: 10,
        weight: 0.2,
      },
      {
        kind: "practical_task",
        id: "task_investment_model",
        label: "Praktický úkol: modelovat první byt",
        href: routes.investicniRentgenModelar,
        estimatedMinutes: 15,
        weight: 0.15,
      },
    ],
  },
  {
    id: "foreign_property",
    title: "Zahraniční nemovitost",
    subtitle: "Freehold, off-plan, escrow — právní a finanční rámec.",
    persona: "Nákup mimo ČR",
    guideCharacterId: "property_detective",
    badgeId: "foreign_dd_basics",
    steps: [
      lessonStep("freehold-vs-leasehold", "Lekce: Freehold vs leasehold", 5),
      quizStep("freehold-vs-leasehold", "Quiz: Freehold"),
      lessonStep("off-plan", "Lekce: Off-plan", 5),
      quizStep("off-plan", "Quiz: Off-plan"),
      lessonStep("escrow", "Lekce: Escrow", 4),
      quizStep("escrow", "Quiz: Escrow"),
      lessonStep("inflace", "Lekce: Inflace a FX kontext", 4),
      quizStep("inflace", "Quiz: Inflace"),
      {
        kind: "calculator",
        id: "calc_global_financing",
        label: "Global Financing Router",
        href: routes.globalFinancing,
        estimatedMinutes: 8,
        weight: 0.2,
      },
      {
        kind: "practical_task",
        id: "task_foreign_dd",
        label: "Praktický úkol: Due Diligence checklist",
        href: routes.dueDiligence,
        estimatedMinutes: 20,
        weight: 0.15,
      },
    ],
  },
  {
    id: "advanced_investor",
    title: "Pokročilý investor",
    subtitle: "Portfolio, snowball a off-plan rizika.",
    persona: "Více nemovitostí / aktivní investor",
    guideCharacterId: "investor_igor",
    badgeId: null,
    steps: [
      lessonStep("cash-flow", "Lekce: Cash flow (pokročilé)", 5),
      quizStep("cash-flow", "Quiz: Cash flow"),
      lessonStep("snowball", "Lekce: Snowball efekt", 5),
      quizStep("snowball", "Quiz: Snowball"),
      lessonStep("off-plan", "Lekce: Off-plan rizika", 5),
      quizStep("off-plan", "Quiz: Off-plan"),
      lessonStep("inflace", "Lekce: Makro kontext", 4),
      quizStep("inflace", "Quiz: Inflace"),
      {
        kind: "calculator",
        id: "calc_portfolio",
        label: "Portfolio OS",
        href: routes.portfolio,
        estimatedMinutes: 10,
        weight: 0.2,
      },
      {
        kind: "practical_task",
        id: "task_compare",
        label: "Praktický úkol: porovnat 2 nemovitosti",
        href: routes.investicniRentgenPorovnani,
        estimatedMinutes: 15,
        weight: 0.15,
      },
    ],
  },
];

export function getLearningPath(id: LearningPathId): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id);
}

export function getAcademyPathHref(pathId: LearningPathId): string {
  return `${routes.akademie}/cesty/${pathId}`;
}

/** Education → tool → personalized result */
export const LESSON_TOOL_BRIDGES: LessonToolBridge[] = [
  {
    lessonSlug: "ltv",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.financniPas,
    description: "Přeneste LTV do Financial Passport a uvidíte modelovou akontaci.",
  },
  {
    lessonSlug: "dsti",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.kalkulacky.root,
    description: "DSTI v hypoteční kalkulačce s vašimi příjmy.",
  },
  {
    lessonSlug: "dti",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.navrhNaMiru,
    description: "DTI a připravenost v hypotečním wizardu.",
  },
  {
    lessonSlug: "fixace",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.refinanceRadar,
    description: "Zadejte fixaci a porovnejte scénáře refinancování.",
  },
  {
    lessonSlug: "rpsn",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.kalkulacky.root,
    description: "RPSN vs. nominální sazba v kalkulačce.",
  },
  {
    lessonSlug: "cash-flow",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.investicniRentgenModelar,
    description: "Cash flow na konkrétní nemovitost v modeláři.",
  },
  {
    lessonSlug: "freehold-vs-leasehold",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.dueDiligence,
    description: "Due diligence checklist pro zahraniční typ nemovitosti.",
  },
  {
    lessonSlug: "off-plan",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.dueDiligence,
    description: "Off-plan položky v Due Diligence Engine.",
  },
  {
    lessonSlug: "inflace",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.kalkulacky.historickyVyvoj,
    description: "Historický vývoj cen a inflace v Decision Lab.",
  },
];

export function getLessonToolBridge(slug: string): LessonToolBridge | undefined {
  return LESSON_TOOL_BRIDGES.find((b) => b.lessonSlug === slug);
}
