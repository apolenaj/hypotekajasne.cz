import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LEARNING_PATHS,
  getLearningPath,
  getLessonToolBridge,
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

describe("learning paths", () => {
  it("has six situational paths", () => {
    assert.equal(LEARNING_PATHS.length, 6);
    for (const p of LEARNING_PATHS) {
      assert.ok(p.steps.some((s) => s.kind === "lesson"));
      assert.ok(p.steps.some((s) => s.kind === "quiz"));
      assert.ok(p.steps.some((s) => s.kind === "calculator"));
      assert.ok(p.steps.some((s) => s.kind === "practical_task"));
    }
  });

  it("first home path includes LTV lesson", () => {
    const p = getLearningPath("first_home")!;
    assert.ok(p.steps.some((s) => s.lessonSlug === "ltv"));
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
