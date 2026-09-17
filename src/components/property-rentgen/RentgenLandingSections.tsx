import Link from "next/link";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
  formatTierPrice,
  getAnalysisTier,
  getRentgenPremiumConfig,
  withAnalysisPrice,
  DIGITAL_RENTGEN_PRICING,
  PROPERTY_ANALYSIS_PRICING,
  RENTGEN_FAQ,
} from "@/lib/property-rentgen";
import { CLAIM_KIND_DESCRIPTIONS, CLAIM_KIND_LABELS } from "@/lib/property-rentgen/types";
import { routes } from "@/lib/routes";
import { legalOperator } from "@/config/legal";

const PILLARS = [
  {
    title: "Výnos",
    text: "Hrubý a čistý modelový výnos z vašich čísel.",
  },
  {
    title: "Cash flow",
    text: "Nájem vs. splátka, provoz a rezervy.",
  },
  {
    title: "Financování",
    text: "LTV, kapitál a orientační dluhová služba.",
  },
  {
    title: "Náklady",
    text: "Pořízení, provoz, CAPEX — bez skrytých marketingových čísel.",
  },
  {
    title: "Rizika",
    text: "Signály k ověření, ne falešná jistota.",
  },
  {
    title: "Scénáře",
    text: "Základní, konzervativní a citlivost sazby / nájmu.",
  },
] as const;

export function RentgenHero() {
  return (
    <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
          Investiční rentgen nemovitosti
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Než investujete miliony, prověřte čísla.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          Spočítejte výnos, cash flow, financování, náklady a klíčová rizika
          konkrétní nemovitosti.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#nastroj"
            className="inline-flex items-center justify-center rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a] transition hover:bg-muted-gold-light"
          >
            Analyzovat nemovitost
          </a>
          <a
            href="#ukazka"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Ukázka výsledku
          </a>
        </div>
        <p className="mt-5 max-w-2xl text-[11px] leading-relaxed text-white/55">
          Modelový analytický nástroj. Výstupy nejsou investičním doporučením,
          znaleckým posudkem ani právní due diligence.
        </p>
      </div>
    </header>
  );
}

export function RentgenPillars() {
  return (
    <section
      className="border-b border-border bg-white py-10 sm:py-12"
      aria-labelledby="pillars-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="pillars-heading"
          className="font-heading text-xl font-bold text-text-dark sm:text-2xl"
        >
          Co Rentgen ukáže
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Šest oblastí ekonomiky konkrétní nemovitosti — bez dlouhých definic.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <li
              key={p.title}
              className="rounded-2xl border border-border bg-[#f7f9f8] px-4 py-4"
            >
              <p className="font-heading text-lg font-bold text-deep-teal">
                {p.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function RentgenDataTrustNote() {
  return (
    <section className="border-b border-border bg-[#f4f6f5] py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <details className="group rounded-2xl border border-border bg-white px-5 py-4 shadow-sm">
          <summary className="cursor-pointer list-none font-semibold text-deep-teal marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              Jak pracujeme s daty
              <span className="text-xs font-normal text-muted-foreground group-open:hidden">
                — rozbalit
              </span>
            </span>
          </summary>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>
              Ve výsledcích oddělujeme vstupy a výpočty:{" "}
              {(
                ["DATA", "MODEL", "ODHAD", "NEOVERENO"] as const
              ).map((k, i) => (
                <span key={k}>
                  {i > 0 ? " · " : null}
                  <strong className="text-text-dark">{CLAIM_KIND_LABELS[k]}</strong>
                  {" — "}
                  {CLAIM_KIND_DESCRIPTIONS[k]}
                </span>
              ))}
            </p>
            <p>
              Neověřená právní nebo technická fakta nevydáváme za jistotu.
              Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico}.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}

export function RentgenPricing() {
  const tiers = getAnalysisTier();
  const premiumCfg = getRentgenPremiumConfig();
  const live = premiumCfg.commerciallyActive;

  return (
    <section
      id="cena"
      className="scroll-mt-24 border-b border-border bg-white py-12 sm:py-16"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="pricing-heading"
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          Tři úrovně — jasný rozsah
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Zdarma si ověříte smysl investice. Digitální Rentgen a kompletní
          analýza jdou hlouběji — bez falešného checkoutu, dokud produkt není
          aktivní.
        </p>
        {!live ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Placené vrstvy připravujeme. Můžete zanechat zájem u formuláře —
            nejde o platbu ani o rezervaci „posledních míst“.
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => {
            const highlight = tier.id === "digital";
            const isPremium = tier.id === "premium";
            return (
              <div
                key={tier.id}
                className={
                  highlight
                    ? "rounded-2xl border-2 border-muted-gold bg-white p-6 shadow-md"
                    : "rounded-2xl border border-border bg-[#f7f9f8] p-6"
                }
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
                  {tier.id === "free"
                    ? "Zdarma"
                    : highlight
                      ? "Hlavní digitální produkt"
                      : "Premium report"}
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-text-dark">
                  {tier.name}
                </h3>
                <p className="mt-1 font-heading text-3xl font-bold tabular-nums text-deep-teal">
                  {formatTierPrice(tier)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{tier.summary}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {tier.includes.slice(0, 5).map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
                {tier.id === "free" ? (
                  <a
                    href="#nastroj"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-deep-teal px-4 py-3 text-sm font-bold text-white"
                  >
                    Analyzovat nemovitost
                  </a>
                ) : highlight ? (
                  <a
                    href={live ? "#nastroj" : "#premium-objednavka"}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-muted-gold px-4 py-3 text-sm font-bold text-text-dark"
                  >
                    {live
                      ? `Spustit Rentgen za ${formatDigitalRentgenPrice()}`
                      : "Chci vědět, až bude Rentgen dostupný"}
                  </a>
                ) : (
                  <a
                    href={live ? "#premium-objednavka" : "#premium-objednavka"}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-deep-teal/25 bg-white px-4 py-3 text-sm font-bold text-deep-teal"
                  >
                    {live
                      ? `Objednat kompletní analýzu za ${formatAnalysisPrice()}`
                      : "Mám zájem o kompletní analýzu"}
                  </a>
                )}
                {isPremium ? (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Termín dodání potvrdíme při objednávce
                    {premiumCfg.deliverySla.configured &&
                    premiumCfg.deliverySla.label
                      ? ` (${premiumCfg.deliverySla.label})`
                      : ""}
                    . Neslibujeme „30 stran“, dokud to není součást aktivního
                    deliverable.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href={routes.legal.placenaAnalyza}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Obchodní podmínky placené analýzy
          </Link>
          {" · "}
          Provozovatel {legalOperator.companyName}
        </p>
      </div>
    </section>
  );
}

export function RentgenHowItWorks() {
  return (
    <section
      className="border-b border-border bg-[#f4f6f5] py-12"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="how-heading"
          className="font-heading text-2xl font-bold text-text-dark"
        >
          Jak to funguje
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Zadejte nemovitost",
              d: "Cena, lokalita, nájem, kapitál — volitelně odkaz na inzerát.",
            },
            {
              n: "2",
              t: "Získejte náhled",
              d: "Okamžitý modelový snapshot s označením předpokladů.",
            },
            {
              n: "3",
              t: "Jděte hlouběji",
              d: `Digitální Rentgen (${formatDigitalRentgenPrice()}) nebo kompletní report (${formatAnalysisPrice()}).`,
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-border bg-white px-5 py-5"
            >
              <span className="text-xs font-bold text-muted-gold">{s.n}</span>
              <p className="mt-1 font-semibold text-text-dark">{s.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function RentgenFaq() {
  return (
    <section
      className="border-b border-border bg-white py-12 sm:py-16"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2
          id="faq-heading"
          className="font-heading text-2xl font-bold text-text-dark"
        >
          FAQ
        </h2>
        <dl className="mt-8 space-y-4">
          {RENTGEN_FAQ.map((item) => (
            <div key={item.q} className="rounded-2xl border border-border px-5 py-4">
              <dt className="font-semibold text-text-dark">
                {withAnalysisPrice(item.q)}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {withAnalysisPrice(item.a)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function RentgenBottomCta() {
  const live = getRentgenPremiumConfig().commerciallyActive;
  return (
    <section className="bg-deep-teal py-12 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          Máte konkrétní nemovitost?
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Než investujete miliony, prověřte čísla — výnos, cash flow,
          financování a rizika na jednom místě.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#nastroj"
            className="inline-flex rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a]"
          >
            Analyzovat nemovitost
          </a>
          <a
            href={live ? "#cena" : "#premium-objednavka"}
            className="inline-flex rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white"
          >
            {live
              ? `Rentgen od ${formatDigitalRentgenPrice()}`
              : "Chci vědět, až bude Rentgen dostupný"}
          </a>
        </div>
        <p className="mt-4 text-[11px] text-white/55">
          {DIGITAL_RENTGEN_PRICING.productName} ·{" "}
          {PROPERTY_ANALYSIS_PRICING.productName} · model, ne doporučení banky
        </p>
      </div>
    </section>
  );
}

/** @deprecated — retained export aliases for any stray imports */
export const RentgenValueProp = RentgenPillars;
export const RentgenWhatWeAnalyze = RentgenHowItWorks;
export const RentgenMetricsGrid = RentgenPillars;
export function RentgenDemoReport() {
  return null;
}
