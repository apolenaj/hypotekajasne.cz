import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LEARNING_PATHS,
  PRIMARY_LEARNING_PATH_IDS,
  getLearningPath,
  getLessonToolBridge,
  estimatePathReadingMinutes,
  getNextRecommendedStep,
  getPathCalculatorStep,
} from "@/lib/academy/gamification/paths";
import {
  computePathProgress,
  markLessonRead,
  markQuizPassed,
} from "@/lib/academy/gamification/progress";
import { evaluateEarnedBadges } from "@/lib/academy/gamification/recommendations";
import { buildGamificationDashboard } from "@/lib/academy/gamification/build";
import { defaultAcademyProgressStore } from "@/lib/academy/gamification/types";
import { ACADEMY_CHARACTERS } from "@/lib/academy/gamification/paths";
import { getAllAcademySlugs } from "@/lib/academy/catalog";
import { routes } from "@/lib/routes";

describe("learning paths", () => {
  it("has six situational paths including four primaries", () => {
    assert.equal(LEARNING_PATHS.length, 6);
    assert.equal(PRIMARY_LEARNING_PATH_IDS.length, 4);
    for (const p of LEARNING_PATHS) {
      assert.ok(p.steps.some((s) => s.kind === "lesson"));
      assert.ok(p.steps.some((s) => s.kind === "quiz"));
      assert.ok(p.steps.some((s) => s.kind === "calculator"));
      assert.ok(p.steps.some((s) => s.kind === "practical_task"));
    }
  });

  it("names primary paths as requested", () => {
    assert.equal(getLearningPath("first_home")!.title, "První hypotéka");
    assert.equal(
      getLearningPath("first_investment")!.title,
      "Investiční nemovitost"
    );
    assert.equal(getLearningPath("refinance")!.title, "Refinancování");
    assert.equal(
      getLearningPath("foreign_property")!.title,
      "Koupě v zahraničí"
    );
  });

  it("first home path includes LTV lesson", () => {
    const p = getLearningPath("first_home")!;
    assert.ok(p.steps.some((s) => s.lessonSlug === "ltv"));
  });

  it("all lesson slugs exist in catalog (no filler / broken lessons)", () => {
    const slugs = new Set(getAllAcademySlugs());
    for (const path of LEARNING_PATHS) {
      for (const step of path.steps) {
        if (step.lessonSlug) {
          assert.ok(
            slugs.has(step.lessonSlug),
            `missing lesson ${step.lessonSlug} in path ${path.id}`
          );
        }
      }
    }
  });

  it("all step hrefs point to known app routes", () => {
    const known = [
      routes.akademie,
      routes.kalkulacky.root,
      routes.kalkulacky.historickyVyvoj,
      routes.financniPas,
      routes.navrhNaMiru,
      routes.documentVault,
      routes.refinanceRadar,
      routes.investicniRentgen,
      routes.investicniRentgenModelar,
      routes.investicniRentgenPorovnani,
      routes.globalFinancing,
      routes.dueDiligence,
      routes.portfolio,
    ];
    for (const path of LEARNING_PATHS) {
      for (const step of path.steps) {
        const href = step.href.split("#")[0]!;
        const ok =
          href.startsWith(`${routes.akademie}/`) ||
          known.some((k) => href === k || href.startsWith(`${k}/`));
        assert.ok(ok, `broken href ${step.href} in ${path.id}/${step.id}`);
      }
    }
  });

  it("exposes reading time and next/calculator helpers", () => {
    const path = getLearningPath("first_home")!;
    assert.ok(estimatePathReadingMinutes(path) > 20);
    const next = getNextRecommendedStep(path, defaultAcademyProgressStore());
    assert.ok(next);
    assert.equal(next!.kind, "lesson");
    assert.ok(getPathCalculatorStep(path)?.href === routes.kalkulacky.root);
  });
});

describe("progress", () => {
  it("computes 0-100 percent", () => {
    const path = getLearningPath("first_home")!;
    const empty = computePathProgress(path, defaultAcademyProgressStore());
    assert.equal(empty.progressPercent, 0);

    let store = markLessonRead(defaultAcademyProgressStore(), "ltv");
    store = markQuizPassed(store, "ltv");
    const partial = computePathProgress(path, store);
    assert.ok(partial.progressPercent > 0);
    assert.ok(partial.progressPercent <= 100);
  });
});

describe("badges — meaningful only", () => {
  it("awards understand_ltv after lesson + quiz", () => {
    let store = markLessonRead(defaultAcademyProgressStore(), "ltv");
    store = markQuizPassed(store, "ltv");
    const badges = evaluateEarnedBadges(store);
    assert.ok(badges.includes("understand_ltv"));
  });

  it("dashboard has no streak fields", () => {
    const dash = buildGamificationDashboard(defaultAcademyProgressStore());
    assert.ok(!("streak" in dash));
    assert.ok(dash.methodology.some((m) => m.includes("streak")));
  });
});

describe("education to tool bridge", () => {
  it("ltv lesson links to personalized scenario", () => {
    const bridge = getLessonToolBridge("ltv")!;
    assert.ok(bridge.label.includes("Vyzkoušet"));
    assert.ok(bridge.href.includes("financni-pas"));
  });
});

describe("characters", () => {
  it("defines four future video characters", () => {
    assert.equal(ACADEMY_CHARACTERS.length, 4);
    for (const c of ACADEMY_CHARACTERS) {
      assert.ok(c.trustNote.length > 15);
      assert.ok(c.animationStates.includes("idle"));
    }
  });
});
