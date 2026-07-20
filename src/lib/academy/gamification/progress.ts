import type {
  AcademyProgressStore,
  LearningPath,
  PathProgress,
} from "@/lib/academy/gamification/types";
import { LEARNING_PATHS } from "@/lib/academy/gamification/paths";

function isStepComplete(
  store: AcademyProgressStore,
  step: LearningPath["steps"][number]
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

export function computePathProgress(
  path: LearningPath,
  store: AcademyProgressStore
): PathProgress {
  let earned = 0;
  const totalWeight = path.steps.reduce((s, st) => s + st.weight, 0);
  const steps: PathProgress["steps"] = {};

  for (const step of path.steps) {
    const done = isStepComplete(store, step);
    if (done) earned += step.weight;
    steps[step.id] = {
      stepId: step.id,
      completedAt: done ? new Date().toISOString() : null,
    };
  }

  const progressPercent =
    totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;

  return {
    pathId: path.id,
    steps,
    progressPercent: Math.min(100, progressPercent),
  };
}

export function computeAllPathProgress(
  store: AcademyProgressStore
): PathProgress[] {
  return LEARNING_PATHS.map((p) => computePathProgress(p, store));
}

export function markLessonRead(
  store: AcademyProgressStore,
  lessonSlug: string
): AcademyProgressStore {
  return {
    ...store,
    lessonReadAt: {
      ...store.lessonReadAt,
      [lessonSlug]: new Date().toISOString(),
    },
  };
}

export function markQuizPassed(
  store: AcademyProgressStore,
  lessonSlug: string
): AcademyProgressStore {
  return {
    ...store,
    quizPassedAt: {
      ...store.quizPassedAt,
      [lessonSlug]: new Date().toISOString(),
    },
  };
}

export function markCalculatorUsed(
  store: AcademyProgressStore,
  stepId: string
): AcademyProgressStore {
  return {
    ...store,
    calculatorUsedAt: {
      ...store.calculatorUsedAt,
      [stepId]: new Date().toISOString(),
    },
  };
}

export function markPracticalTaskDone(
  store: AcademyProgressStore,
  stepId: string
): AcademyProgressStore {
  return {
    ...store,
    practicalTaskDoneAt: {
      ...store.practicalTaskDoneAt,
      [stepId]: new Date().toISOString(),
    },
  };
}
