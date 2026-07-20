"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Check, ChevronDown, ChevronUp, Clock, X } from "lucide-react";
import type { NbaRecommendation } from "@/lib/nba/types";
import {
  markNbaCompleted,
  markNbaDismissed,
  markNbaRemindLater,
} from "@/lib/nba/feedback";
import { cn } from "@/lib/utils";

function RecommendationCard({
  rec,
  onChange,
}: {
  rec: NbaRecommendation;
  onChange: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(false);

  const complete = useCallback(() => {
    markNbaCompleted(rec.id);
    onChange();
  }, [rec.id, onChange]);

  const dismiss = useCallback(() => {
    markNbaDismissed(rec.id);
    onChange();
  }, [rec.id, onChange]);

  const remind = useCallback(() => {
    markNbaRemindLater(rec.id, 3);
    onChange();
  }, [rec.id, onChange]);

  return (
    <article className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Priorita {rec.priority} · {rec.urgency}
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-deep-teal">
            {rec.action}
          </h3>
        </div>
        <Link
          href={rec.href}
          className="rounded-full bg-deep-teal px-4 py-2 text-xs font-bold text-white"
        >
          Otevřít
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setWhyOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-text-dark"
        aria-expanded={whyOpen}
      >
        Proč?
        {whyOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {whyOpen ? (
        <div className="mt-2 space-y-2 rounded-lg bg-[#f7f8f7] p-3 text-sm text-muted-foreground">
          <p>{rec.reason}</p>
          <p>
            <span className="font-semibold text-text-dark">Očekávaný přínos: </span>
            {rec.expectedBenefit}
          </p>
          {rec.blockingIssues.length > 0 ? (
            <p>
              <span className="font-semibold text-text-dark">Blokátory: </span>
              {rec.blockingIssues.join(" · ")}
            </p>
          ) : null}
          <p className="text-xs">
            Zdroj: {rec.sourceData.keys.join(", ")} ·{" "}
            <span className="font-bold uppercase text-deep-teal">
              {rec.sourceData.claimKind}
            </span>
          </p>
        </div>
      ) : (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{rec.reason}</p>
      )}

      {/* Soft actions — no dark patterns, equal weight */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={complete}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          )}
        >
          <Check className="h-3.5 w-3.5" />
          Hotovo
        </button>
        <button
          type="button"
          onClick={remind}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
        >
          <Clock className="h-3.5 w-3.5" />
          Připomenout později
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-slate-50"
        >
          <X className="h-3.5 w-3.5" />
          Skrýt
        </button>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Doporučení je orientační — není nátlak ani závazek. Skrýt / odložit je vždy možné.
      </p>
    </article>
  );
}

export function NextBestActionPanel({
  recommendations,
  onUserFeedback,
}: {
  recommendations: NbaRecommendation[];
  onUserFeedback?: () => void;
}) {
  const refresh = useCallback(() => {
    onUserFeedback?.();
  }, [onUserFeedback]);

  if (recommendations.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="font-heading text-base font-bold">Doporučujeme nyní</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Žádné aktivní doporučení — buď je vše hotové, nebo jste je skryli / odložili.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-lg font-bold text-text-dark">
          Doporučujeme nyní
        </h2>
        <p className="text-sm text-muted-foreground">
          Rule-based engine · 1–{recommendations.length} nejlogičtější kroky (ne black-box).
        </p>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} onChange={refresh} />
        ))}
      </div>
    </section>
  );
}
