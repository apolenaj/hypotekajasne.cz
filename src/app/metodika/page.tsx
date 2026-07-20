import type { Metadata } from "next";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { TrustNav } from "@/components/trust/TrustPageShell";
import { DATA_CATALOG } from "@/lib/data/catalog";
import { statusBadgeLabel } from "@/lib/data/display";
import {
  PUBLIC_DOMAIN_SOURCE,
  PUBLIC_METHODOLOGY_BLURBS,
  PUBLIC_STATUS_MEANINGS,
  publicFreshnessHint,
} from "@/lib/data/public-methodology";
import type { DataStatus } from "@/lib/data/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Metodika dat | HypotékaJasně.cz",
  description:
    "Odkud bereme data, jak často je aktualizujeme, co znamenají statusy a jak počítáme výnosy a skóre.",
};

const STATUS_ORDER: DataStatus[] = [
  "LIVE",
  "VERIFIED",
  "MODELLED",
  "PARTNER_QUOTE",
  "STALE",
];

export default function MetodikaPage() {
  return (
    <div className="bg-white">
      <TrustNav currentPath="/metodika" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Centrum důvěry · Metodika
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
          Metodika dat
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {PUBLIC_METHODOLOGY_BLURBS.general}{" "}
          <strong className="font-semibold text-text-dark">
            Modelový výpočet nikdy nevydáváme za aktuální data.
          </strong>
        </p>

        <section className="mt-12 space-y-4" aria-labelledby="statuses-heading">
          <h2
            id="statuses-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Co znamenají statusy
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
                    {PUBLIC_STATUS_MEANINGS[s].label}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {PUBLIC_STATUS_MEANINGS[s].description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {publicFreshnessHint(s)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="sources-heading">
          <h2
            id="sources-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Odkud data pocházejí
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.rates}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.rpsn}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.ltv}
          </p>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="freq-heading">
          <h2
            id="freq-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Jak často se aktualizují
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.updateFrequency}
          </p>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="calc-heading">
          <h2
            id="calc-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Jak počítáme
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.yields}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.prices}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.scoring}
          </p>

          <h3 className="pt-2 font-heading text-base font-semibold text-text-dark">
            Váhy dimenzí (organické skóre)
          </h3>
          <p className="text-xs text-muted-foreground">Součet = 100 %.</p>
          <ul className="divide-y divide-border rounded-xl border border-border text-sm">
            {[
              ["Požadovaný kapitál", "14 %"],
              ["Dostupnost financování", "12 %"],
              ["Cílový výnos", "12 %"],
              ["Volatilita / riziko", "10 %"],
              ["Jistota vlastnictví", "12 %"],
              ["Likvidita", "8 %"],
              ["Měnové riziko", "8 %"],
              ["Regulace", "8 %"],
              ["Investiční horizont", "8 %"],
              ["Zamýšlené použití", "8 %"],
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
              Žádné placené partnerství nesmí měnit organické skóre. Reklama
              nebo sponzorovaný obsah musí být explicitně označené a oddělené
              od organického žebříčku.
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
                Veřejný lístek sazby české banky. Stále nejde o závaznou smlouvu
                — banka schvaluje individuálně.
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <DataStatusBadge status="MODELLED" />
              <p className="mt-2 text-sm text-muted-foreground">
                Orientační výchozí hodnoty, sazba bez pojištění (+0,3 p. b.),
                zahraniční sazby, výnosy, historie, scénáře. Nikdy jako aktuální
                data.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="hist-heading">
          <h2
            id="hist-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Historie, predikce, právo
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.historical}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.predictions}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.legal}
          </p>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="catalog-heading">
          <h2
            id="catalog-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Přehled datových oblastí
          </h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {DATA_CATALOG.map((entry) => (
              <li key={entry.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-text-dark">{entry.label}</p>
                  <DataStatusBadge status={entry.defaultStatus} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {PUBLIC_DOMAIN_SOURCE[entry.domain] ??
                    statusBadgeLabel(entry.defaultStatus)}
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
