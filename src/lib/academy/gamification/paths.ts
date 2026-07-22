import { routes } from "@/lib/routes";
import { getAcademyLessonPath } from "@/lib/academy/lesson-path";
import type {
  AcademyCharacter,
  AcademyCharacterId,
  AcademyProgressStore,
  LearningPath,
  LearningPathId,
  LearningPathStep,
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
    trustNote: "Scénáře jsou orientační model — ne predikce ČNB.",
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
    trustNote: "Detektiv není právník — při pochybnostech konzultujte specialistu.",
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

/** Primární cesty — zobrazené jako hlavní nabídka. */
export const PRIMARY_LEARNING_PATH_IDS: LearningPathId[] = [
  "first_home",
  "first_investment",
  "refinance",
  "foreign_property",
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "first_home",
    title: "První hypotéka",
    subtitle: "LTV, DSTI, RPSN a fixace — základ před první prohlídkou.",
    persona: "Vlastní bydlení",
    guideCharacterId: "banker_bohous",
    badgeId: "ready_first_viewing",
    steps: [
      lessonStep("ltv", "Lekce: LTV", 5),
      quizStep("ltv", "Kvíz: LTV"),
      lessonStep("dsti", "Lekce: DSTI", 4),
      quizStep("dsti", "Kvíz: DSTI"),
      lessonStep("rpsn", "Lekce: RPSN", 4),
      quizStep("rpsn", "Kvíz: RPSN"),
      lessonStep("fixace", "Lekce: Fixace", 4),
      quizStep("fixace", "Kvíz: Fixace"),
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
        label: "Praktický úkol: vyplnit Finanční pas",
        href: routes.financniPas,
        estimatedMinutes: 10,
        weight: 0.15,
      },
    ],
  },
  {
    id: "first_investment",
    title: "Investiční nemovitost",
    subtitle: "Peněžní tok, DTI a páka — základy investora.",
    persona: "První investiční byt",
    guideCharacterId: "investor_igor",
    badgeId: "investor_basics_complete",
    steps: [
      lessonStep("ltv", "Lekce: LTV (páka)", 5),
      quizStep("ltv", "Kvíz: LTV"),
      lessonStep("cash-flow", "Lekce: Peněžní tok", 5),
      quizStep("cash-flow", "Kvíz: Peněžní tok"),
      lessonStep("dti", "Lekce: DTI", 4),
      quizStep("dti", "Kvíz: DTI"),
      lessonStep("snowball", "Lekce: Sněhová koule", 4),
      quizStep("snowball", "Kvíz: Sněhová koule"),
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
    id: "refinance",
    title: "Refinancování",
    subtitle: "Fixace, RPSN a kdy dává smysl refinancovat.",
    persona: "Majitel hypotéky před koncem fixace",
    guideCharacterId: "banker_bohous",
    badgeId: "refinance_ready",
    steps: [
      lessonStep("fixace", "Lekce: Fixace", 4),
      quizStep("fixace", "Kvíz: Fixace"),
      lessonStep("rpsn", "Lekce: RPSN", 4),
      quizStep("rpsn", "Kvíz: RPSN"),
      lessonStep("americka-hypoteka", "Lekce: Americká hypotéka", 5),
      quizStep("americka-hypoteka", "Kvíz: Americká hypotéka"),
      {
        kind: "calculator",
        id: "calc_refinance_radar",
        label: "Radar refinancování",
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
    id: "foreign_property",
    title: "Koupě v zahraničí",
    subtitle: "Freehold, off-plan, escrow — právní a finanční rámec.",
    persona: "Nákup mimo ČR",
    guideCharacterId: "property_detective",
    badgeId: "foreign_dd_basics",
    steps: [
      lessonStep(
        "freehold-vs-leasehold",
        "Lekce: Volné vlastnictví vs. nájemní právo",
        5
      ),
      quizStep("freehold-vs-leasehold", "Kvíz: Freehold / leasehold"),
      lessonStep("off-plan", "Lekce: Koupě před dokončením", 5),
      quizStep("off-plan", "Kvíz: Off-plan"),
      lessonStep("escrow", "Lekce: Jistotní účet (escrow)", 4),
      quizStep("escrow", "Kvíz: Escrow"),
      lessonStep("inflace", "Lekce: Inflace a měnový kontext", 4),
      quizStep("inflace", "Kvíz: Inflace"),
      {
        kind: "calculator",
        id: "calc_global_financing",
        label: "Mapa globálního financování",
        href: routes.globalFinancing,
        estimatedMinutes: 8,
        weight: 0.2,
      },
      {
        kind: "practical_task",
        id: "task_foreign_dd",
        label: "Praktický úkol: checklist prověrky",
        href: routes.dueDiligence,
        estimatedMinutes: 20,
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
      quizStep("dti", "Kvíz: DTI"),
      lessonStep("dsti", "Lekce: DSTI", 4),
      quizStep("dsti", "Kvíz: DSTI"),
      lessonStep("ltv", "Lekce: LTV a akontace", 5),
      quizStep("ltv", "Kvíz: LTV"),
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
    id: "advanced_investor",
    title: "Pokročilý investor",
    subtitle: "Portfolio, sněhová koule a rizika koupě před dokončením.",
    persona: "Více nemovitostí / aktivní investor",
    guideCharacterId: "investor_igor",
    badgeId: null,
    steps: [
      lessonStep("cash-flow", "Lekce: Peněžní tok (pokročilé)", 5),
      quizStep("cash-flow", "Kvíz: Peněžní tok"),
      lessonStep("snowball", "Lekce: Efekt sněhové koule", 5),
      quizStep("snowball", "Kvíz: Sněhová koule"),
      lessonStep("off-plan", "Lekce: Rizika off-plan", 5),
      quizStep("off-plan", "Kvíz: Off-plan"),
      lessonStep("inflace", "Lekce: Makro kontext", 4),
      quizStep("inflace", "Kvíz: Inflace"),
      {
        kind: "calculator",
        id: "calc_portfolio",
        label: "Správa portfolia",
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

export function isPrimaryLearningPath(id: LearningPathId): boolean {
  return PRIMARY_LEARNING_PATH_IDS.includes(id);
}

export function estimatePathReadingMinutes(path: LearningPath): number {
  return path.steps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
}

function isStepDone(
  store: AcademyProgressStore,
  step: LearningPathStep
): boolean {
  switch (step.kind) {
    case "lesson":
      return step.lessonSlug
        ? Boolean(store.lessonReadAt[step.lessonSlug])
        : false;
    case "quiz":
      return step.lessonSlug
        ? Boolean(store.quizPassedAt[step.lessonSlug])
        : false;
    case "calculator":
      return Boolean(store.calculatorUsedAt[step.id]);
    case "practical_task":
      return Boolean(store.practicalTaskDoneAt[step.id]);
    default:
      return false;
  }
}

/** Další nedokončený krok — preferuje lekci, jinak první otevřený krok. */
export function getNextRecommendedStep(
  path: LearningPath,
  store: AcademyProgressStore
): LearningPathStep | null {
  const incomplete = path.steps.filter((s) => !isStepDone(store, s));
  if (incomplete.length === 0) return null;
  return (
    incomplete.find((s) => s.kind === "lesson") ??
    incomplete.find((s) => s.kind === "quiz") ??
    incomplete[0] ??
    null
  );
}

export function getPathCalculatorStep(
  path: LearningPath
): LearningPathStep | null {
  return path.steps.find((s) => s.kind === "calculator") ?? null;
}

/** Education → tool → personalized result */
export const LESSON_TOOL_BRIDGES: LessonToolBridge[] = [
  {
    lessonSlug: "ltv",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.financniPas,
    description: "Přeneste LTV do Finančního pasu a uvidíte modelovou akontaci.",
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
    lessonSlug: "snowball",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.portfolio,
    description: "Sněhová koule v kontextu portfolia (MODEL).",
  },
  {
    lessonSlug: "americka-hypoteka",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.refinanceRadar,
    description: "Americká hypotéka vs. refinancování — orientační model.",
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
    lessonSlug: "escrow",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.dueDiligence,
    description: "Escrow a jistotní účet v checklistu prověrky.",
  },
  {
    lessonSlug: "inflace",
    label: "Vyzkoušet na mém vlastním scénáři",
    href: routes.kalkulacky.historickyVyvoj,
    description: "Historický vývoj cen a inflace v Laboratoři rozhodnutí.",
  },
];

export function getLessonToolBridge(slug: string): LessonToolBridge | undefined {
  return LESSON_TOOL_BRIDGES.find((b) => b.lessonSlug === slug);
}
