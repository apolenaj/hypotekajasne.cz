import type { Metadata } from "next";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { TrustNav } from "@/components/trust/TrustPageShell";
import { DATA_CATALOG } from "@/lib/data/catalog";
import { statusBadgeLabel, statusDescription } from "@/lib/data/display";
import { FRESHNESS_THRESHOLD_MS } from "@/lib/data/freshness";
import { METHODOLOGY_BLURBS } from "@/lib/data/provenance";
import type { DataStatus } from "@/lib/data/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Metodika dat | HypotékaJasně.cz",
  description:
    "Jak získáváme sazby, počítáme výnos, scoring a jak odlišujeme model od skutečné nabídky banky.",
};

const STATUS_ORDER: DataStatus[] = [
  "LIVE",
  "VERIFIED",
  "MODELLED",
  "PARTNER_QUOTE",
  "STALE",
];

function hoursLabel(ms: number): string {
  if (!Number.isFinite(ms)) return "neaplikuje se (zůstává MODEL)";
  const h = ms / (60 * 60 * 1000);
  if (h < 48) return `${h} hodin`;
  return `${Math.round(h / 24)} dní`;
}

export default function MetodikaPage() {
  return (
    <div className="bg-white">
      <TrustNav currentPath="/metodika" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Trust Center · Metodika
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
          Metodika dat
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          HypotékaJasně je datová platforma. Každé důležité číslo má status,
          zdroj a datum. Chybějící údaj nikdy nevymýšlíme — UI ukáže „Na
          vyžádání“ nebo „Data ověřujeme“.{" "}
          <strong className="font-semibold text-text-dark">
            MODEL nikdy nevydáváme za LIVE.
          </strong>
        </p>

        <section className="mt-12 space-y-4" aria-labelledby="statuses-heading">
          <h2
            id="statuses-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Statusy údajů
          </h2>
          <ul className="space-y-3">
            {STATUS_ORDER.map((s) => (
              <li
                key={s}
                className="flex items-start gap-3 rounded-xl border border-border px-4 py-3"
              >
                <DataStatusBadge status={s} size="md" className="mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-dark">
                    {statusBadgeLabel(s)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {statusDescription(s)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Freshness threshold: {hoursLabel(FRESHNESS_THRESHOLD_MS[s])}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="rates-heading">
          <h2
            id="rates-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Jak získáváme sazby
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.rates}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.rpsn}
          </p>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="yield-heading">
          <h2
            id="yield-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Jak počítáme výnos
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.yields}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.prices}
          </p>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="scoring-heading">
          <h2
            id="scoring-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Jak funguje scoring (market matching)
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.scoring}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Produkt: <strong className="text-text-dark">Osobní investiční průvodce</strong>{" "}
            (`/investicni-pas`). Výsledek ukazuje Top 3 trhy s Overall Match,
            důvody pro/proti, kapitál, financování, rizika a data freshness —
            plus rozklad „Proč tento trh získal X/100?“.
          </p>

          <h3
            id="scoring-weights"
            className="pt-2 font-heading text-base font-semibold text-text-dark"
          >
            Váhy dimenzí (organické skóre)
          </h3>
          <p className="text-xs text-muted-foreground">
            Verze vah: <code className="text-text-dark">2026-07-market-matching-v1</code>.
            Součet = 100 %.
          </p>
          <ul className="divide-y divide-border rounded-xl border border-border text-sm">
            {[
              ["Požadovaný kapitál (required capital)", "14 %"],
              ["Dostupnost financování (financing availability)", "12 %"],
              ["Cílový výnos (target yield)", "12 %"],
              ["Volatilita / riziko (volatility/risk)", "10 %"],
              ["Jistota vlastnictví (ownership security)", "12 %"],
              ["Likvidita (liquidity)", "8 %"],
              ["Měnové riziko (currency risk)", "8 %"],
              ["Regulace (regulation)", "8 %"],
              ["Investiční horizont (investment horizon)", "8 %"],
              ["Zamýšlené použití (intended use)", "8 %"],
            ].map(([label, w]) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-text-dark">
                  {w}
                </span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Pravidlo sponzoringu</p>
            <p className="mt-1 text-amber-900/90">
              Žádné placené partnerství nesmí měnit organické Overall Match.
              Reklama nebo sponzorovaný listing musí být explicitně označené a
              oddělené od organického žebříčku — nikdy jako tichý boost skóre.
            </p>
          </div>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="model-vs-heading">
          <h2
            id="model-vs-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Model vs skutečná nabídka
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <DataStatusBadge status="LIVE" />
              <p className="mt-2 text-sm text-muted-foreground">
                Veřejný lístek / scrapovaná sazba CZ banky. Stále nejde o
                závaznou smlouvu — banka schvaluje individuálně.
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <DataStatusBadge status="MODELLED" />
              <p className="mt-2 text-sm text-muted-foreground">
                Orientační default, +0,3 p.b. bez pojištění, zahraniční sazby,
                výnosy, historie, predikce. Nikdy jako LIVE.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="freq-heading">
          <h2
            id="freq-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Jak často data kontrolujeme
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-text-dark">CZ sazby:</strong> automatický
              scrape (cron) → po 48 h bez aktualizace status STALE + upozornění.
            </li>
            <li>
              <strong className="text-text-dark">Partner quote (KB):</strong>{" "}
              manuální kontrola; threshold 7 dní.
            </li>
            <li>
              <strong className="text-text-dark">ČNB / právní editorial:</strong>{" "}
              manuální revize; threshold ~6 měsíců.
            </li>
            <li>
              <strong className="text-text-dark">Modely:</strong> zůstávají
              MODEL; nepřepínají se na LIVE stárnutím.
            </li>
          </ul>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="hist-heading">
          <h2
            id="hist-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Historie, predikce, právo
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.historical}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.predictions}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.legal}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {METHODOLOGY_BLURBS.ltv}
          </p>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="catalog-heading">
          <h2
            id="catalog-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Katalog domén ({DATA_CATALOG.length})
          </h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {DATA_CATALOG.map((entry) => (
              <li key={entry.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-text-dark">{entry.label}</p>
                  <DataStatusBadge status={entry.defaultStatus} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entry.canonicalModule}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-sm text-muted-foreground">
          <Link
            href={routes.home}
            className="font-medium text-deep-teal underline-offset-4 hover:underline"
          >
            ← Zpět na homepage
          </Link>
          {" · "}
          <Link
            href={routes.kalkulacky.root}
            className="font-medium text-deep-teal underline-offset-4 hover:underline"
          >
            Kalkulačky
          </Link>
        </p>
      </div>
    </div>
  );
}
