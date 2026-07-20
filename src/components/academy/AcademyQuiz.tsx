"use client";

import { useState } from "react";
import type { AcademyQuizQuestion } from "@/lib/academy/types";
import {
  loadAcademyProgressStore,
  markQuizPassed,
  saveAcademyProgressStore,
} from "@/lib/academy/gamification";
import { cn } from "@/lib/utils";

export function AcademyQuiz({
  questions,
  lessonSlug,
}: {
  questions: AcademyQuizQuestion[];
  lessonSlug?: string;
}) {  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);

  if (!questions.length) {
    return (
      <p className="text-sm text-muted-foreground">Quiz připravujeme.</p>
    );
  }

  const score = questions.reduce((s, q) => {
    return s + (answers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-5">
      {questions.map((q) => (
        <fieldset key={q.id} className="rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-text-dark">
            {q.prompt}
          </legend>
          <div className="mt-2 space-y-2">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              const show =
                revealed &&
                (i === q.correctIndex || selected);
              return (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                    selected ? "border-deep-teal bg-deep-teal/5" : "border-border",
                    revealed && i === q.correctIndex && "border-emerald-500 bg-emerald-50",
                    revealed &&
                      selected &&
                      i !== q.correctIndex &&
                      "border-red-300 bg-red-50"
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="mt-1"
                    checked={selected}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: i }))
                    }
                    disabled={revealed}
                  />
                  <span>
                    {opt}
                    {show && i === q.correctIndex ? (
                      <span className="mt-1 block text-xs text-emerald-800">
                        {q.explain}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={() => {
          const s = questions.reduce(
            (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
            0
          );
          setRevealed(true);
          if (lessonSlug && s >= 1) {
            const store = loadAcademyProgressStore();
            saveAcademyProgressStore(markQuizPassed(store, lessonSlug));
          }
        }}
        disabled={
          revealed || questions.some((q) => answers[q.id] === undefined)
        }
        className="rounded-lg bg-deep-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {revealed
          ? `Výsledek: ${score}/${questions.length}`
          : "Vyhodnotit quiz"}
      </button>
    </div>
  );
}
