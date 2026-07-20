"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Award, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { AcademyCharacter } from "@/components/academy/AcademyCharacter";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { ClaimBadge } from "@/components/property-rentgen/ClaimBadge";
import {
  ACADEMY_GAMIFICATION_FEATURE_STATUS,
  LEARNING_PATHS,
  buildGamificationDashboard,
  getAcademyPathHref,
  getCharacter,
  getLearningPath,
  loadAcademyProgressStore,
  type LearningPathId,
} from "@/lib/academy/gamification";
import { getAcademyLessonPath } from "@/lib/academy";
import { ACADEMY_UI_CS } from "@/lib/i18n/ui-cs";
import { learningStepKindLabel } from "@/lib/i18n/labels";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

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

export function AcademyPathsHub() {
  const ready = useIsClient();
  const [store, setStore] = useState(() =>
    ready ? loadAcademyProgressStore() : null
  );

  useEffect(() => {
    if (ready) setStore(loadAcademyProgressStore());
  }, [ready]);

  const dashboard = useMemo(() => {
    if (!store) return null;
    return buildGamificationDashboard(store);
  }, [store]);

  if (!ready || !dashboard) {
    return (
      <div className="py-8 text-sm text-muted-foreground">Načítám vzdělávací cesty…</div>
    );
  }

  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-center gap-2">
        <FeatureStatusBadge status={ACADEMY_GAMIFICATION_FEATURE_STATUS} />
        <span className="text-xs text-muted-foreground">
          Bez streaků · smysluplné odznaky · vzdělávání → nástroj
        </span>
      </div>

      {/* Copilot-style recommendations */}
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
                  <p className="mt-1 text-xs text-muted-foreground">{rec.reason}</p>
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

      {/* Learning paths grid */}
      <div>
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <BookOpen className="h-5 w-5" />
          Vzdělávací cesty
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {LEARNING_PATHS.map((path) => {
            const progress =
              dashboard.paths.find((p) => p.pathId === path.id)?.progressPercent ?? 0;
            const guide = getCharacter(path.guideCharacterId);
            return (
              <Link
                key={path.id}
                href={getAcademyPathHref(path.id)}
                className="block rounded-2xl border border-border bg-white p-5 transition hover:border-deep-teal/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-deep-teal">{path.persona}</p>
                    <h3 className="mt-1 font-heading text-lg font-bold">{path.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{path.subtitle}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Průvodce: {guide.name}
                    </p>
                  </div>
                  <ProgressRing percent={progress} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Badges */}
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
                className={`rounded-xl border p-4 ${earned ? "border-amber-300 bg-amber-50" : "border-border bg-muted/20 opacity-70"}`}
              >
                <p className="font-semibold">{badge.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
                {!earned && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {badge.unlockCriteria}
                  </p>
                )}
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

      {/* Characters preview */}
      <div>
        <h2 className="font-heading text-lg font-bold">Postavy pro budoucí videa</h2>
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
  const path = getLearningPath(pathId)!;
  const ready = useIsClient();
  const [store, setStore] = useState(() =>
    ready ? loadAcademyProgressStore() : null
  );

  useEffect(() => {
    if (ready) setStore(loadAcademyProgressStore());
  }, [ready]);

  const progress = useMemo(() => {
    if (!store) return 0;
    return (
      buildGamificationDashboard(store).paths.find((p) => p.pathId === pathId)
        ?.progressPercent ?? 0
    );
  }, [store, pathId]);

  if (!path) return null;

  const guide = getCharacter(path.guideCharacterId);

  return (
    <div className="space-y-6">
      <AcademyCharacter character={guide} state="pointing" />
      <div className="flex items-center gap-4">
        <ProgressRing percent={progress} />
        <div>
          <h1 className="font-heading text-2xl font-bold">{path.title}</h1>
          <p className="text-sm text-muted-foreground">{path.subtitle}</p>
        </div>
      </div>
      <ol className="space-y-2">
        {path.steps.map((step, i) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm hover:border-deep-teal/40"
            >
              <span>
                <span className="mr-2 font-bold text-muted-foreground">{i + 1}.</span>
                {step.label}
                <span className="ml-2 text-xs text-muted-foreground">
                  · {step.estimatedMinutes} min ·{" "}
                  {learningStepKindLabel(step.kind)}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
