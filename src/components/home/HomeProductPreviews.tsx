import Link from "next/link";
import {
  BookOpen,
  FlaskConical,
  Layers,
  MessageSquareText,
  ScanSearch,
} from "lucide-react";
import { CLAIM_KIND_LABELS } from "@/lib/property-rentgen/types";
import { RENTGEN_METRICS_CATALOG } from "@/lib/property-rentgen/metrics-catalog";
import { routes } from "@/lib/routes";

const FREE_METRICS = RENTGEN_METRICS_CATALOG.filter((m) => m.tier === "free").slice(
  0,
  6
);

/**
 * Decision Lab, Rentgen, Finanční pas, Copilot — preview bez falešných výsledků.
 */
export function HomeProductPreviews() {
  return (
    <>
      {/* Decision Lab */}
      <section
        aria-labelledby="home-decision-lab-heading"
        className="border-b border-border bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-12">
          <div className="min-w-0 lg:col-span-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Laboratoř rozhodnutí
            </p>
            <h2
              id="home-decision-lab-heading"
              className="mt-2 font-heading text-2xl font-bold text-text-dark sm:text-3xl"
            >
              Nejen články — porovnávejte rozhodnutí
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Koupě vs. nájem, historický vývoj a modelové scénáře. Každý výstup
              je orientační model platformy, ne doporučení banky.
            </p>
            <Link
              href={routes.kalkulacky.root}
              className="mt-5 inline-flex h-11 items-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            >
              Otevřít laboratoř →
            </Link>
          </div>
          <ul className="grid min-w-0 gap-3 sm:grid-cols-3 lg:col-span-6">
            {[
              {
                href: routes.kalkulacky.koupeVsNajem,
                title: "Koupě vs. nájem",
                hint: "Cash-flow a bod zvratu",
              },
              {
                href: routes.kalkulacky.historickyVyvoj,
                title: "Historický vývoj",
                hint: "Sazby a trendy v čase",
              },
              {
                href: routes.kalkulacky.potencialniVyvoj,
                title: "Potenciální vývoj",
                hint: "Modelové scénáře dopředu",
              },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col rounded-xl border border-border bg-[#f7f8f7] p-4 transition-colors hover:border-deep-teal/40 hover:bg-white"
                >
                  <FlaskConical
                    className="h-5 w-5 text-deep-teal"
                    aria-hidden
                  />
                  <span className="mt-3 font-semibold text-text-dark">
                    {item.title}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {item.hint}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Rentgen */}
      <section
        aria-labelledby="home-rentgen-heading"
        className="border-b border-border bg-[#f7f8f7]"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
                Investiční rentgen
              </p>
              <h2
                id="home-rentgen-heading"
                className="mt-2 font-heading text-2xl font-bold text-text-dark sm:text-3xl"
              >
                Struktura výsledku — ne vymyšlená nemovitost
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Ukázka metrik z produktu. Čísla vzniknou až z vašich vstupů;
                každá položka nese typ claimu.
              </p>
            </div>
            <Link
              href={routes.investicniRentgen}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
            >
              <ScanSearch className="h-4 w-4" aria-hidden />
              Spustit rentgen
            </Link>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FREE_METRICS.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-border bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-text-dark">{m.label}</p>
                  <span className="shrink-0 rounded-md bg-deep-teal/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-deep-teal">
                    {CLAIM_KIND_LABELS[m.typicalKind]}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
                <p className="mt-3 font-heading text-sm font-bold tabular-nums text-muted-foreground">
                  — (dopočítá se po zadání)
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Financial Passport + Copilot */}
      <section
        aria-labelledby="home-passport-heading"
        className="border-b border-border bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
          <div className="rounded-2xl border border-border bg-[#f7f8f7] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Finanční pas
            </p>
            <h2
              id="home-passport-heading"
              className="mt-2 flex items-center gap-2 font-heading text-xl font-bold text-text-dark"
            >
              <Layers className="h-5 w-5 text-deep-teal" aria-hidden />
              Co získáte a proč
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>Sjednocený profil příjmu, závazků a záměru</li>
              <li>Orientační rozsah financování pro další nástroje</li>
              <li>Podklad pro nezávaznou konzultaci — ne schválení úvěru</li>
            </ul>
            <Link
              href={routes.financniPas}
              className="mt-5 inline-flex text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
            >
              Otevřít Finanční pas →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-[#f7f8f7] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              AI Copilot
            </p>
            <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-bold text-text-dark">
              <MessageSquareText className="h-5 w-5 text-deep-teal" aria-hidden />
              Praktický use-case
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Zeptejte se například: „Co se stane se splátkou, když sazba vzroste
              o 2&nbsp;%?“ Copilot propojí modelové scénáře a odkáže na nástroje —
              nevydává se za bankovní poradce.
            </p>
            <Link
              href={routes.copilot}
              className="mt-5 inline-flex text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
            >
              Zkusit Copilot →
            </Link>
          </div>
        </div>
      </section>

      {/* Akademie — secondary */}
      <section
        aria-labelledby="home-academy-heading"
        className="border-b border-border bg-[#f7f8f7]"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Akademie
            </p>
            <h2
              id="home-academy-heading"
              className="mt-1 flex items-center gap-2 font-heading text-xl font-bold text-text-dark"
            >
              <BookOpen className="h-5 w-5 text-deep-teal" aria-hidden />
              Vzdělání jako druhá vrstva
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              LTV, RPSN, DSTI a cesty podle situace — sekundárně vůči hlavnímu
              funnelu rozpočet → trh → analýza.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.akademie}
              className="inline-flex h-11 items-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-deep-teal hover:border-deep-teal/40"
            >
              Akademie →
            </Link>
            <Link
              href={routes.oMajetio}
              className="inline-flex h-11 items-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
            >
              Majetio →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
