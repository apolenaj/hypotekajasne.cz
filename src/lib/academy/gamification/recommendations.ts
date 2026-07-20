import { routes } from "@/lib/routes";
import { loadFinancialProfile } from "@/lib/financial-passport";
import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import type {
  AcademyBadgeId,
  AcademyLessonRecommendation,
  AcademyProgressStore,
} from "@/lib/academy/gamification/types";
import { computeAllPathProgress } from "@/lib/academy/gamification/progress";
import { getLessonToolBridge } from "@/lib/academy/gamification/paths";

function estimateLtv(profile: FinancialProfileAnswers | null): number | null {
  if (!profile?.targetPrice || profile.targetPrice <= 0) return null;
  const equity = profile.ownFunds ?? 0;
  return Math.min(99, Math.max(0, ((profile.targetPrice - equity) / profile.targetPrice) * 100));
}

/**
 * Situační doporučení — Copilot-style, bez halucinací.
 * Vychází z Financial Passport / readiness profilu.
 */
export function recommendLessons(
  profile: FinancialProfileAnswers | null = loadFinancialProfile()
): AcademyLessonRecommendation[] {
  const out: AcademyLessonRecommendation[] = [];
  const ltv = estimateLtv(profile);

  if (ltv != null && ltv >= 85) {
    const bridge = getLessonToolBridge("ltv")!;
    out.push({
      id: "rec_high_ltv",
      lessonSlug: "ltv",
      headline: `Máte vysoké LTV (~${Math.round(ltv)} %) — doporučujeme 5min lekci o vlastních zdrojích.`,
      reason: "Modelová akontace je pod 15 % — banka může vyžadovat vyšší equity nebo jiný produkt.",
      estimatedMinutes: 5,
      characterId: "banker_bohous",
      tryOnScenarioHref: bridge.href,
      tryOnScenarioLabel: bridge.label,
      claimKind: "MODEL",
    });
  }

  if (profile?.incomeType === "osvc_pausal" || profile?.incomeType === "osvc_evidence") {
    const bridge = getLessonToolBridge("dti")!;
    out.push({
      id: "rec_osvc_dti",
      lessonSlug: "dti",
      headline: "OSVČ profil — doporučujeme 5min lekci o DTI a doložení příjmů.",
      reason: "Banka posuzuje OSVČ jinak než zaměstnance — DTI a dokumentace jsou klíčové.",
      estimatedMinutes: 5,
      characterId: "banker_bohous",
      tryOnScenarioHref: bridge.href,
      tryOnScenarioLabel: bridge.label,
      claimKind: "MODEL",
    });
  }

  if (profile?.intent === "refinance") {
    const bridge = getLessonToolBridge("fixace")!;
    out.push({
      id: "rec_refinance_fixace",
      lessonSlug: "fixace",
      headline: "Refinancování — 4min lekce o fixaci před rozhodnutím.",
      reason: "Koniec fixace určuje okno pro srovnání — ne generické „sazby klesly“.",
      estimatedMinutes: 4,
      characterId: "banker_bohous",
      tryOnScenarioHref: bridge.href,
      tryOnScenarioLabel: bridge.label,
      claimKind: "MODEL",
    });
  }

  if (profile?.intent === "foreign_purchase") {
    const bridge = getLessonToolBridge("freehold-vs-leasehold")!;
    out.push({
      id: "rec_foreign_freehold",
      lessonSlug: "freehold-vs-leasehold",
      headline: "Zahraniční nákup — 5min lekce freehold vs leasehold.",
      reason: "Právní forma vlastnictví určuje riziko exitu a financování.",
      estimatedMinutes: 5,
      characterId: "property_detective",
      tryOnScenarioHref: bridge.href,
      tryOnScenarioLabel: bridge.label,
      claimKind: "MODEL",
    });
  }

  if (profile?.intent === "investment") {
    const bridge = getLessonToolBridge("cash-flow")!;
    out.push({
      id: "rec_investment_cf",
      lessonSlug: "cash-flow",
      headline: "Investiční profil — 5min lekce o cash flow.",
      reason: "Hrubý yield ≠ čistý cash flow — modelujte náklady před nabídkou.",
      estimatedMinutes: 5,
      characterId: "investor_igor",
      tryOnScenarioHref: bridge.href,
      tryOnScenarioLabel: bridge.label,
      claimKind: "MODEL",
    });
  }

  if (out.length === 0) {
    out.push({
      id: "rec_default_ltv",
      lessonSlug: "ltv",
      headline: "Začněte 5min lekcí LTV — základ každého hypotečního rozhodnutí.",
      reason: "Bez profilu doporučujeme univerzální základ — doplníte Financial Passport pro personalizaci.",
      estimatedMinutes: 5,
      characterId: "banker_bohous",
      tryOnScenarioHref: routes.financniPas,
      tryOnScenarioLabel: "Vyzkoušet na mém vlastním scénáři",
      claimKind: "MODEL",
    });
  }

  return out.slice(0, 3);
}

export function evaluateEarnedBadges(
  store: AcademyProgressStore
): AcademyBadgeId[] {
  const paths = computeAllPathProgress(store);
  const earned: AcademyBadgeId[] = [];

  if (store.lessonReadAt.ltv && store.quizPassedAt.ltv) {
    earned.push("understand_ltv");
  }

  const firstHome = paths.find((p) => p.pathId === "first_home");
  if (firstHome && firstHome.progressPercent >= 80) {
    earned.push("ready_first_viewing");
  }

  const investment = paths.find((p) => p.pathId === "first_investment");
  if (investment && investment.progressPercent >= 100) {
    earned.push("investor_basics_complete");
  }

  const refinance = paths.find((p) => p.pathId === "refinance");
  if (
    refinance &&
    refinance.progressPercent >= 80 &&
    store.practicalTaskDoneAt.task_refinance_profile
  ) {
    earned.push("refinance_ready");
  }

  const foreign = paths.find((p) => p.pathId === "foreign_property");
  if (foreign && foreign.progressPercent >= 75) {
    earned.push("foreign_dd_basics");
  }

  return [...new Set(earned)];
}

export function syncBadges(store: AcademyProgressStore): AcademyProgressStore {
  const earned = evaluateEarnedBadges(store);
  return { ...store, earnedBadges: earned };
}
