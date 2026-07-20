import type {
  ScoreDimensionId,
  TimelineEntry,
} from "@/lib/financial-passport/types";

const TIMELINE_KEY = "hj-fp-timeline-v1";
const MAX_ENTRIES = 30;

export function loadPassportTimeline(): TimelineEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TIMELINE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { entries?: TimelineEntry[] };
    return Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    return [];
  }
}

function saveTimeline(entries: TimelineEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    TIMELINE_KEY,
    JSON.stringify({ version: 1, entries: entries.slice(0, MAX_ENTRIES) })
  );
}

export function clearPassportTimeline() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TIMELINE_KEY);
}

/**
 * Zaznamená změnu skóre, pokud se overall posunul.
 * Vrací nový entry nebo null.
 */
export function recordScoreChange(input: {
  scoreFrom: number;
  scoreTo: number;
  dimensionFrom: { id: ScoreDimensionId; score: number }[];
  dimensionTo: { id: ScoreDimensionId; score: number }[];
  reasons?: string[];
}): TimelineEntry | null {
  if (input.scoreFrom === input.scoreTo) return null;

  const dimensionDeltas: Partial<Record<ScoreDimensionId, number>> = {};
  const reasons: string[] = [...(input.reasons ?? [])];

  for (const d of input.dimensionTo) {
    const prev = input.dimensionFrom.find((x) => x.id === d.id);
    const delta = d.score - (prev?.score ?? d.score);
    if (delta !== 0) {
      dimensionDeltas[d.id] = delta;
    }
  }

  // Auto reasons from largest dimension moves
  const moves = Object.entries(dimensionDeltas)
    .map(([id, delta]) => ({ id: id as ScoreDimensionId, delta: delta! }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  if (reasons.length === 0) {
    for (const m of moves) {
      const dir = m.delta > 0 ? "zlepšila" : "zhoršila";
      reasons.push(
        `Dimenze „${m.id.replace(/_/g, " ")}“ se ${dir} o ${Math.abs(m.delta)} b.`
      );
    }
    if (reasons.length === 0) {
      reasons.push("Aktualizace profilu připravenosti.");
    }
  }

  const entry: TimelineEntry = {
    id: `tl_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    scoreFrom: input.scoreFrom,
    scoreTo: input.scoreTo,
    reasons,
    dimensionDeltas,
  };

  const prev = loadPassportTimeline();
  saveTimeline([entry, ...prev]);
  return entry;
}

export function formatTimelineHeadline(entry: TimelineEntry): string {
  return `Vaše hypoteční připravenost se změnila ${entry.scoreFrom} → ${entry.scoreTo}.`;
}
