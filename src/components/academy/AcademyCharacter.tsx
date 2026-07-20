"use client";

import type {
  AcademyCharacter,
  CharacterAnimationState,
} from "@/lib/academy/gamification/types";

const STATE_CLASS: Record<CharacterAnimationState, string> = {
  idle: "academy-char--idle",
  talking: "academy-char--talking",
  pointing: "academy-char--pointing",
  thinking: "academy-char--thinking",
};

/** CSS-ready character slot for future video/Lottie — editorial trust note always visible. */
export function AcademyCharacter({
  character,
  state = "idle",
  compact = false,
}: {
  character: AcademyCharacter;
  state?: CharacterAnimationState;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border border-border bg-white p-4 ${compact ? "items-center" : "flex-col sm:flex-row"}`}
      data-character={character.id}
    >
      <div
        className={`academy-character ${character.illustrationClass} ${STATE_CLASS[state]} flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl`}
        style={{ backgroundColor: `${character.accentColor}18`, borderColor: character.accentColor }}
        aria-hidden
      >
        {character.id === "investor_igor" && "📈"}
        {character.id === "banker_bohous" && "🏦"}
        {character.id === "madame_inflation" && "📊"}
        {character.id === "property_detective" && "🔍"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: character.accentColor }}>
          {character.name}
        </p>
        <p className="text-sm font-semibold text-foreground">{character.role}</p>
        {!compact && (
          <>
            <p className="mt-1 text-xs text-muted-foreground">{character.tagline}</p>
            <p className="mt-2 text-[10px] text-muted-foreground italic">{character.trustNote}</p>
          </>
        )}
      </div>
    </div>
  );
}
