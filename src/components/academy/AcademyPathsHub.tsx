"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Calculator,
  Sparkles,
} from "lucide-react";
import { AcademyCharacter } from "@/components/academy/AcademyCharacter";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { ClaimBadge } from "@/components/property-rentgen/ClaimBadge";
import {
  ACADEMY_GAMIFICATION_FEATURE_STATUS,
  LEARNING_PATHS,
  buildGamificationDashboard,
  defaultAcademyProgressStore,
  estimatePathReadingMinutes,
  getAcademyPathHref,
  getCharacter,
  getLearningPath,
  getNextRecommendedStep,
  getPathCalculatorStep,
  isPrimaryLearningPath,
  loadAcademyProgressStore,
  type LearningPath,
  type LearningPathId,
} from "@/lib/academy/gamification";
import { getAcademyLessonPath } from "@/lib/academy/lesson-path";
import { ACADEMY_UI_CS } from "@/lib/i18n/ui-cs";
import { learningStepKindLabel } from "@/lib/i18n/labels";

function ProgressRing({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" className="-rotate-90" aria-hidden>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#0f4c48"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="44"
          y="48"
          textAnchor="middle"
          className="rotate-90 fill-foreground text-sm font-bold"
          style={{ transformOrigin: "44px 44px" }}
        >
          {percent}%
        </text>
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {ACADEMY_UI_CS.progress}
      </span>
    </div>
  );
}

function PathCard({
  path,
  progressPercent,
}: {
  path: LearningPath;
  progressPercent: number;
}) {
  const guide = getCharacter(path.guideCharacterId);
  const minutes = estimatePathReadingMinutes(path);
  const lessonCount = path.steps.filter((s) => s.kind === "lesson").length;

  return (
    <Link
      href={getAcademyPathHref(path.id)}
      className="block rounded-2xl border border-border bg-white p-5 transition hover:border-deep-teal/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-deep-teal">
            {path.persona}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold">{path.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{path.subtitle}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />≈ {minutes} min
            </span>
            <span>
              {lessonCount}{" "}
              {lessonCount === 1 ? "lekce" : lessonCount < 5 ? "lekce" : "lekcí"}
            </span>
            <span>Průvodce: {guide.name}</span>
          </p>
        </div>
        <ProgressRing percent={progressPercent} />
      </div>
    </Link>
  );
}

export function AcademyPathsHub() {
  // Always start with default store — never block SSR/hydration on localStorage.
  const [store, setStore] = useState(defaultAcademyProgressStore);

  useEffect(() => {
    setStore(loadAcademyProgressStore());
  }, []);

  const dashboard = useMemo(
    () => buildGamificationDashboard(store),
    [store]
  );

  if (LEARNING_PATHS.length === 0) {
    return (
      <section
        className="rounded-2xl border border-dashed border-border bg-[#f7f8f7] px-6 py-10 text-center"
        role="status"
      >
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-3 font-heading text-lg font-bold text-text-dark">
          Vzdělávací cesty zatím nejsou k dispozici
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Katalog cest není nakonfigurován. Pojmové lekce akademie zůstávají
          dostupné v přehledu akademie.
        </p>
        <Link
          href="/akademie"
          className="mt-4 inline-flex text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
        >
          Přejít na pojmovou akademii
        </Link>
      </section>
    );
  }

  const primaryPaths = LEARNING_PATHS.filter((p) =>
    isPrimaryLearningPath(p.id)
  );
  const secondaryPaths = LEARNING_PATHS.filter(
    (p) => !isPrimaryLearningPath(p.id)
  );

  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-center gap-2">
        <FeatureStatusBadge status={ACADEMY_GAMIFICATION_FEATURE_STATUS} />
        <span className="text-xs text-muted-foreground">
          Bez streaků · smysluplné odznaky · vzdělávání → nástroj
        </span>
      </div>

      <div className="rounded-2xl border border-deep-teal/20 bg-[#eef3f1] p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Sparkles className="h-5 w-5 text-deep-teal" />
          Doporučeno pro vaši situaci
        </h2>
        <ul className="mt-4 space-y-4">
          {dashboard.recommendations.map((rec) => (
            <li key={rec.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-start gap-3">
                <AcademyCharacter
                  character={getCharacter(rec.characterId)}
                  state="talking"
                  compact
                />
                <div className="flex-1">
                  <ClaimBadge kind={rec.claimKind} />
                  <p className="mt-1 font-medium">{rec.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {rec.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={getAcademyLessonPath(rec.lessonSlug)}
                      className="inline-flex items-center gap-1 rounded-full bg-deep-teal px-3 py-1 text-xs font-semibold text-white"
                    >
                      {rec.estimatedMinutes} min lekce
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                    <Link
                      href={rec.tryOnScenarioHref}
                      className="inline-flex items-center gap-1 rounded-full border border-deep-teal px-3 py-1 text-xs font-semibold text-deep-teal"
                    >
                      {rec.tryOnScenarioLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <BookOpen className="h-5 w-5" />
          Vzdělávací cesty
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Čtyři základní scénáře z existujících lekcí — bez filler obsahu.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {primaryPaths.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              progressPercent={
                dashboard.paths.find((p) => p.pathId === path.id)
                  ?.progressPercent ?? 0
              }
            />
          ))}
        </div>
      </div>

      {secondaryPaths.length > 0 ? (
        <div>
          <h2 className="font-heading text-lg font-bold">Další cesty</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {secondaryPaths.map((path) => (
              <PathCard
                key={path.id}
                path={path}
                progressPercent={
                  dashboard.paths.find((p) => p.pathId === path.id)
                    ?.progressPercent ?? 0
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Award className="h-5 w-5" />
          {ACADEMY_UI_CS.badges}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.availableBadges.map((badge) => {
            const earned = dashboard.earnedBadges.some((b) => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-4 ${
                  earned
                    ? "border-amber-300 bg-amber-50"
                    : "border-border bg-muted/20 opacity-70"
                }`}
              >
                <p className="font-semibold">{badge.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {badge.description}
                </p>
                {!earned ? (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {badge.unlockCriteria}
                  </p>
                ) : null}
                {earned ? (
                  <p className="mt-2 text-[10px] font-semibold text-amber-800">
                    {ACADEMY_UI_CS.completed}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold">
          Postavy pro budoucí videa
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Vizuální vrstva — ne nahrazují odbornou důvěryhodnost ani označení
          Data / Modelový výpočet.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {dashboard.characters.map((c) => (
            <AcademyCharacter key={c.id} character={c} state="idle" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AcademyPathDetail({ pathId }: { pathId: LearningPathId }) {
  const path = getLearningPath(pathId);
  const [store, setStore] = useState(defaultAcademyProgressStore);

  useEffect(() => {
    setStore(loadAcademyProgressStore());
  }, []);

  const dashboard = useMemo(
    () => buildGamificationDashboard(store),
    [store]
  );

  const pathProgress = useMemo(
    () => dashboard.paths.find((p) => p.pathId === pathId),
    [dashboard, pathId]
  );

  if (!path) {
    return (
      <div
        className="rounded-2xl border border-dashed border-border bg-[#f7f8f7] px-6 py-10 text-center"
        role="status"
      >
        <h1 className="font-heading text-xl font-bold">Cesta nenalezena</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tato vzdělávací cesta není v katalogu. Vyberte jinou z přehledu.
        </p>
        <Link
          href="/akademie/cesty"
          className="mt-4 inline-flex text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
        >
          ← Vzdělávací cesty
        </Link>
      </div>
    );
  }

  const guide = getCharacter(path.guideCharacterId);
  const minutes = estimatePathReadingMinutes(path);
  const nextStep = getNextRecommendedStep(path, store);
  const calculatorStep = getPathCalculatorStep(path);
  const progressPercent = pathProgress?.progressPercent ?? 0;
  const completedCount = path.steps.filter((step) =>
    Boolean(pathProgress?.steps[step.id]?.completedAt)
  ).length;

  return (
    <div className="space-y-6">
      <AcademyCharacter character={guide} state="pointing" />
      <div className="flex flex-wrap items-center gap-4">
        <ProgressRing percent={progressPercent} />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-deep-teal">
            {path.persona}
          </p>
          <h1 className="font-heading text-2xl font-bold">{path.title}</h1>
          <p className="text-sm text-muted-foreground">{path.subtitle}</p>
          <p className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />≈ {minutes} min odhad
            </span>
            <span>
              {completedCount}/{path.steps.length} kroků
            </span>
          </p>
        </div>
      </div>

      {nextStep ? (
        <div className="rounded-2xl border border-deep-teal/25 bg-[#eef3f1] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
            Další doporučený krok
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-text-dark">
            {nextStep.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {nextStep.estimatedMinutes} min ·{" "}
            {learningStepKindLabel(nextStep.kind)}
          </p>
          <Link
            href={nextStep.href}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-deep-teal px-4 py-2 text-sm font-semibold text-white hover:bg-deep-teal/90"
          >
            Pokračovat
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <p className="font-semibold">Cesta je dokončená (v tomto prohlížeči).</p>
          {calculatorStep ? (
            <Link
              href={calculatorStep.href}
              className="mt-2 inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
            >
              <Calculator className="h-4 w-4" />
              Znovu otevřít {calculatorStep.label}
            </Link>
          ) : null}
        </div>
      )}

      {calculatorStep ? (
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Relevantní kalkulačka
          </p>
          <Link
            href={calculatorStep.href}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-deep-teal hover:underline"
          >
            <Calculator className="h-4 w-4" />
            {calculatorStep.label}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}

      <ol className="space-y-2">
        {path.steps.map((step, i) => {
          const done = Boolean(pathProgress?.steps[step.id]?.completedAt);
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm hover:border-deep-teal/40"
              >
                <span className="min-w-0">
                  <span className="mr-2 font-bold text-muted-foreground">
                    {i + 1}.
                  </span>
                  {step.label}
                  <span className="ml-2 text-xs text-muted-foreground">
                    · {step.estimatedMinutes} min ·{" "}
                    {learningStepKindLabel(step.kind)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {done ? (
                    <CheckCircle2
                      className="h-4 w-4 text-emerald-600"
                      aria-label="Dokončeno"
                    />
                  ) : null}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
