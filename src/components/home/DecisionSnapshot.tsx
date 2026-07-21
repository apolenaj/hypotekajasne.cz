"use client";

import Link from "next/link";
import { marketAggregateToRecords } from "@/lib/data/live-rates";
import { withEffectiveStatus } from "@/lib/data/freshness";
import {
  TRACKED_CZ_BANKS_COUNT,
  TRACKED_MARKETS_COUNT,
} from "@/lib/destination-metrics";
import { estimateAffordability } from "@/lib/affordability";
import { formatCurrency } from "@/lib/calculators";
import { useMortgageRateEngine } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function formatRateCs(value: number): string {
  return `${value.toLocaleString("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

function formatUpdated(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uiKindLabel(kind: "LIVE" | "OVĚŘENO" | "MODEL"): string {
  if (kind === "LIVE") return "Aktuální data";
  if (kind === "OVĚŘENO") return "Ověřeno";
  return "Modelový výpočet";
}

/**
 * Pravý sloupec hero — živá data + mini ukázka rozpočtu (ne prázdná plocha).
 * Při výpadku LIVE sazeb vždy spočítá orientační rozpočet z rate engine.
 */
export function DecisionSnapshot({ className }: { className?: string }) {
  const { rates, loading, resolved } = useMortgageRateEngine(true);
  const live = withEffectiveStatus(
    marketAggregateToRecords(rates).withInsurance
  );

  const demo = estimateAffordability({
    monthlyIncome: 60_000,
    monthlyLiabilities: 0,
    cash: 800_000,
    ratePercent: resolved.ratePercent,
    termYears: 30,
  });

  return (
    <aside
      aria-label="Přehled rozhodnutí"
      className={cn(
        "home-reveal home-reveal-delay-2 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
            Přehled rozhodnutí
          </p>
          <p className="mt-1 text-sm text-white/75">
            Orientační čísla — ne nabídka banky.
          </p>
        </div>
        {!loading ? (
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {uiKindLabel(resolved.uiKind)}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/20 px-3 py-3">
          <dt className="text-[11px] text-white/55">Sazba ČR s pojištěním</dt>
          <dd className="mt-1 font-heading text-xl font-bold tabular-nums text-white">
            {loading && resolved.isModelFallback
              ? "…"
              : formatRateCs(resolved.ratePercent)}
            <span className="ml-1 text-xs font-medium text-white/55">
              p. a.
            </span>
          </dd>
        </div>
        <div className="rounded-xl bg-black/20 px-3 py-3">
          <dt className="text-[11px] text-white/55">Podporované trhy</dt>
          <dd className="mt-1 font-heading text-xl font-bold tabular-nums text-white">
            {TRACKED_MARKETS_COUNT}
          </dd>
        </div>
        <div className="rounded-xl bg-black/20 px-3 py-3">
          <dt className="text-[11px] text-white/55">Sledované CZ banky</dt>
          <dd className="mt-1 font-heading text-xl font-bold tabular-nums text-white">
            {TRACKED_CZ_BANKS_COUNT}
          </dd>
        </div>
        <div className="rounded-xl bg-black/20 px-3 py-3">
          <dt className="text-[11px] text-white/55">Poslední aktualizace</dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums text-white">
            {loading
              ? "…"
              : formatUpdated(
                  resolved.lastVerifiedAt ?? rates.updatedAt ?? live.lastFetchedAt
                )}
          </dd>
        </div>
      </dl>

      {resolved.isModelFallback || resolved.uiKind === "OVĚŘENO" ? (
        <p className="mt-3 text-[11px] leading-relaxed text-white/65">
          {resolved.explanation}
        </p>
      ) : null}

      <div className="mt-4 rounded-xl border border-muted-gold/30 bg-gradient-to-br from-muted-gold/15 to-transparent px-3 py-3 sm:px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-gold">
          Mini ukázka rozpočtu
        </p>
        <p className="mt-1 text-xs text-white/60">
          Model: příjem 60&nbsp;000 Kč / měs., vlastní zdroje 800&nbsp;000 Kč,
          30 let.
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-white/55">
              Orientační bezpečný rozpočet
            </p>
            <p className="font-heading text-2xl font-bold tabular-nums text-white">
              {demo.maxPropertyPrice > 0
                ? formatCurrency(demo.maxPropertyPrice, "CZK")
                : "—"}
            </p>
          </div>
          <Link
            href={routes.mojeMoznosti}
            className="shrink-0 text-sm font-semibold text-muted-gold underline-offset-4 hover:underline"
          >
            Spočítat své →
          </Link>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-muted-gold"
            style={{ width: "28%" }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-white/45">
          Ilustrace podílu vlastních zdrojů — přesný výpočet ve widgetu níže.
        </p>
      </div>

      <p className="mt-3 text-center text-[10px] text-white/40">
        <Link href={routes.metodika} className="underline-offset-2 hover:underline">
          Metodika dat
        </Link>
      </p>
    </aside>
  );
}
