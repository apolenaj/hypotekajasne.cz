import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { TrustNav } from "@/components/trust/TrustPageShell";
import { DATA_CATALOG } from "@/lib/data/catalog";
import { statusBadgeLabel } from "@/lib/data/display";
import {
  PUBLIC_DOMAIN_SOURCE,
  PUBLIC_METHODOLOGY_BLURBS,
  PUBLIC_STATUS_MEANINGS,
  PUBLIC_STATUS_ORDER,
  publicFreshnessHint,
} from "@/lib/data/public-methodology";
import { NUMBER_PIPELINE_STEPS } from "@/lib/trust/number-pipeline";
import { listPublicChangelog } from "@/lib/trust/public-changelog";
import { getOperatorIdentity } from "@/lib/legal/operator";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/metodika");

export default function MetodikaPage() {
  const op = getOperatorIdentity();
  const changelog = listPublicChangelog().slice(0, 5);

  return (
    <div className="bg-white">
      <TrustNav currentPath="/metodika" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
          Centrum důvěry · Metodika 2.0
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

        <section className="mt-12 space-y-4" aria-labelledby="pipeline-heading">
          <h2
            id="pipeline-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Jak vzniká číslo, které vidíte
          </h2>
          <p className="text-sm text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.numberPipelineIntro}
          </p>
          <ol className="mt-4 space-y-0">
            {NUMBER_PIPELINE_STEPS.map((step, i) => (
              <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                {i < NUMBER_PIPELINE_STEPS.length - 1 ? (
                  <span
                    className="absolute left-[1.15rem] top-10 bottom-0 w-px bg-border"
                    aria-hidden
                  />
                ) : null}
                <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-deep-teal font-heading text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-1">
                  <p className="font-semibold text-text-dark">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                  {i < NUMBER_PIPELINE_STEPS.length - 1 ? (
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-deep-teal/70">
                      ↓
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="abbrev-heading">
          <h2
            id="abbrev-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Odborné zkratky
          </h2>
          <p className="text-sm text-muted-foreground">
            Na webu používáme běžné finanční zkratky. Při prvním výskytu je
            vysvětlujeme česky:
          </p>
          <ul className="space-y-2 text-sm text-text-dark">
            <li>
              <strong>LTV</strong> — poměr úvěru k hodnotě nemovitosti
            </li>
            <li>
              <strong>DTI</strong> — poměr dluhu k příjmu
            </li>
            <li>
              <strong>DSTI</strong> — podíl splátek na příjmu
            </li>
            <li>
              <strong>RPSN</strong> — roční procentní sazba nákladů
            </li>
            <li>
              <strong>ROI / IRR / DSCR / NOI</strong> — návratnost, vnitřní
              výnosové procento, krytí dluhové služby a provozní výsledek
              nemovitosti
            </li>
          </ul>
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="statuses-heading">
          <h2
            id="statuses-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Co znamenají statusy
          </h2>
          <p className="text-sm text-muted-foreground">
            Sjednocená taxonomie: LIVE · VERIFIED · MODEL · ESTIMATE ·
            UNVERIFIED · NEEDS UPDATE · PARTNER OFFER.
          </p>
          <ul className="space-y-3">
            {PUBLIC_STATUS_ORDER.map((s) => (
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

        <section className="mt-12 space-y-4" aria-labelledby="legal-review-heading">
          <h2
            id="legal-review-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Redakční kontrola vs. právní revize
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {PUBLIC_METHODOLOGY_BLURBS.legal}
          </p>
          {op.lastLegalReviewDate && op.legalReviewedBy ? (
            <div className="rounded-xl border border-deep-teal/20 bg-deep-teal/5 px-4 py-3 text-sm text-text-dark">
              <p className="font-semibold text-deep-teal">
                Evidovaná právní revize
              </p>
              <p className="mt-1 text-muted-foreground">
                {op.lastLegalReviewDate} · {op.legalReviewedBy}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-[#f7f8f7] px-4 py-3 text-sm text-muted-foreground">
              Aktuálně zveřejňujeme{" "}
              <strong className="text-text-dark">
                redakční kontrolu právních zdrojů
              </strong>
              . Oddělenou právní revizi kvalifikovaným odborníkem zobrazíme až po
              evidenci jména a data.
            </div>
          )}
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
              <DataStatusBadge status="MODEL" />
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
        </section>

        <section className="mt-12 space-y-4" aria-labelledby="changelog-heading">
          <h2
            id="changelog-heading"
            className="font-heading text-xl font-semibold text-text-dark"
          >
            Co jsme aktualizovali
          </h2>
          <p className="text-sm text-muted-foreground">
            Jen reálné změny — bez falešné historie.
          </p>
          <ol className="space-y-3">
            {changelog.map((row) => (
              <li
                key={`${row.date}-${row.area}`}
                className="rounded-xl border border-border px-4 py-3"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                  {row.date} · {row.area}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.summary}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-sm">
            <Link
              href={routes.opravyAAktualizace}
              className="font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              Celý přehled oprav a aktualizací →
            </Link>
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
            href={routes.duvera}
            className="font-medium text-deep-teal underline-offset-4 hover:underline"
          >
            ← Centrum důvěry
          </Link>
          {" · "}
          <Link
            href={routes.zdroje}
            className="font-medium text-deep-teal underline-offset-4 hover:underline"
          >
            Zdroje
          </Link>
        </p>
      </div>
    </div>
  );
}
