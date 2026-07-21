import Link from "next/link";
import { ClaimBadge, ClaimLegend } from "@/components/property-rentgen/ClaimBadge";
import {
  ANALYSIS_PRODUCT_TIERS,
  ANONYMOUS_DEMO_REPORT,
  RENTGEN_FAQ,
  RENTGEN_METRICS_CATALOG,
  formatAnalysisPrice,
  formatTierPrice,
  withAnalysisPrice,
  PROPERTY_ANALYSIS_PRICING,
} from "@/lib/property-rentgen";
import { routes } from "@/lib/routes";

export function RentgenHero() {
  return (
    <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
          Investiční rentgen
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Nejdřív jasný náhled. Pak detailní analýza — bez falešných jistot.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          Zdarma uvidíte snapshot, klíčové metriky, red flags a financing fit.
          Za {formatAnalysisPrice()} dostanete hloubkový model a report. Produkt
          není právní due diligence, technická prohlídka ani schválení banky.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#nastroj"
            className="inline-flex items-center justify-center rounded-lg bg-muted-gold px-6 py-3 text-sm font-bold text-[#0b3d3a] transition hover:bg-muted-gold-light"
          >
            Spustit bezplatný náhled
          </a>
          <a
            href="#cena"
            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            {PROPERTY_ANALYSIS_PRICING.ctaLabel} · {formatAnalysisPrice()}
          </a>
        </div>
      </div>
    </header>
  );
}

export function RentgenValueProp() {
  return (
    <section className="border-b border-border bg-white py-12 sm:py-16" aria-labelledby="value-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 id="value-heading" className="font-heading text-2xl font-bold text-text-dark sm:text-3xl">
          Funnel rozhodnutí — ne marketingové skóre
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Vstup → bezplatný výsledek → vysvětlení premium → kontakt → očekávání
          dodání. Každý údaj má status Data / Model / Odhad / Neověřeno.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            { n: "1", t: "Vstup", d: "Cena, m², nájem, kapitál (URL jen jako reference)." },
            { n: "2", t: "Free výsledek", d: "Snapshot, metriky, red flags, financing fit." },
            { n: "3", t: "Premium", d: `Co dostanete navíc za ${formatAnalysisPrice()}.` },
            { n: "4", t: "Kontakt", d: "CTA „Získat detailní analýzu“ → další postup." },
          ].map((item) => (
            <li
              key={item.n}
              className="rounded-xl border border-border bg-[#f7f8f7] p-5"
            >
              <span className="text-xs font-bold text-muted-gold">{item.n}</span>
              <p className="mt-1 font-semibold text-deep-teal">{item.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <ClaimLegend />
        </div>
      </div>
    </section>
  );
}

export function RentgenWhatWeAnalyze() {
  return (
    <section
      className="border-b border-border bg-[#f4f6f5] py-12 sm:py-16"
      aria-labelledby="analyze-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="analyze-heading"
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          Co analyzujeme
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Tři vstupy: URL inzerátu (reference), manuální údaje, později nahrání
          dokumentů. Výstup vždy odděluje ověřené od modelu.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Vložit URL",
              d: "Uložíme odkaz jako referenci. Obsah inzerátu automaticky neprohlašujeme za Data.",
            },
            {
              n: "2",
              t: "Manuální údaje",
              d: "Cena, m², lokalita, nájem, vlastní kapitál — základ bezplatného náhledu.",
            },
            {
              n: "3",
              t: "Nahrání dokumentů (připravujeme)",
              d: "Dokumenty a fotky pro hloubkovou kontrolu — připravujeme.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-border bg-white p-5"
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

export function RentgenMetricsGrid() {
  return (
    <section
      className="border-b border-border bg-white py-12 sm:py-16"
      aria-labelledby="metrics-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="metrics-heading"
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          12 hlavních metrik
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Bezplatný náhled pokrývá základ; zbytek je v detailní analýze.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RENTGEN_METRICS_CATALOG.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-text-dark">{m.label}</p>
                <ClaimBadge kind={m.typicalKind} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{m.description}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-deep-teal">
                {m.tier === "free" ? "Zdarma" : "Detailní analýza"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function RentgenDemoReport() {
  const demo = ANONYMOUS_DEMO_REPORT;
  return (
    <section
      id="ukazka"
      className="border-b border-border bg-[#f4f6f5] py-12 sm:py-16"
      aria-labelledby="demo-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
            DEMO
          </span>
          <h2
            id="demo-heading"
            className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
          >
            Ukázka anonymizované struktury reportu
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{demo.subtitle}</p>
        <p className="mt-3 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {demo.disclaimer}
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border bg-deep-teal px-5 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-gold">
              {demo.title}
            </p>
            <p className="mt-1 font-heading text-lg font-bold">
              Demo ID: {demo.id}
            </p>
          </div>
          <div className="grid gap-0 sm:grid-cols-2">
            {demo.metrics.map((m) => (
              <div
                key={m.id}
                className="border-b border-border px-5 py-4 sm:odd:border-r"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </p>
                  <ClaimBadge kind={m.kind} />
                </div>
                <p className="mt-1 text-base font-bold tabular-nums text-text-dark">
                  {m.display}
                </p>
                {m.note ? (
                  <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-[#f7f8f7] px-5 py-4">
            <p className="text-xs font-semibold uppercase text-deep-teal">
              Vhodnost financování (DEMO)
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <ClaimBadge kind={demo.financingFit.kind} className="mr-2" />
              {demo.financingFit.value}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase text-amber-800">
              Varovné signály (DEMO)
            </p>
            <ul className="mt-1 space-y-1">
              {demo.redFlags.map((f) => (
                <li key={f.text} className="text-sm text-muted-foreground">
                  <ClaimBadge kind={f.kind} className="mr-2" />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
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
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          FAQ
        </h2>
        <dl className="mt-8 space-y-5">
          {RENTGEN_FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-border p-5">
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

export function RentgenPricing() {
  const p = PROPERTY_ANALYSIS_PRICING;
  return (
    <section
      id="cena"
      className="border-b border-border bg-[#f4f6f5] py-12 sm:py-16"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="pricing-heading"
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          Co je zdarma, za co platíte
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Jedna cena detailní analýzy: {formatAnalysisPrice()}. Pokročilá due
          diligence není e-shop produkt — jen individuální poptávka.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {ANALYSIS_PRODUCT_TIERS.map((tier) => {
            const isPremium = tier.id === "premium";
            const isInquiry = tier.id === "advanced_inquiry";
            return (
              <div
                key={tier.id}
                className={
                  isPremium
                    ? "rounded-2xl border-2 border-muted-gold bg-white p-6 shadow-sm"
                    : "rounded-2xl border border-border bg-white p-6"
                }
              >
                <p
                  className={
                    isPremium
                      ? "text-xs font-bold uppercase tracking-wide text-muted-gold"
                      : "text-xs font-bold uppercase tracking-wide text-deep-teal"
                  }
                >
                  {isInquiry ? "Na poptávku" : isPremium ? "Placené" : "Zdarma"}
                </p>
                <p className="mt-2 font-heading text-xl font-bold text-text-dark">
                  {tier.name}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-deep-teal">
                  {formatTierPrice(tier)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{tier.summary}</p>
                <p className="mt-4 text-xs font-semibold text-text-dark">
                  Dostanete
                </p>
                <ul className="mt-1 space-y-1.5 text-sm text-muted-foreground">
                  {tier.includes.map((i) => (
                    <li key={i}>+ {i}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-semibold text-text-dark">
                  Produkt není
                </p>
                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                  {tier.isNot.map((i) => (
                    <li key={i}>− {i}</li>
                  ))}
                </ul>
                {isPremium ? (
                  <>
                    <p className="mt-3 text-xs font-semibold text-text-dark">
                      Po CTA
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {p.ctaNextSteps.map((s) => (
                        <li key={s}>→ {s}</li>
                      ))}
                    </ul>
                    <a
                      href="#nastroj"
                      className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-muted-gold px-4 py-3 text-sm font-bold text-[#0b3d3a]"
                    >
                      {p.ctaLabel}
                    </a>
                  </>
                ) : tier.id === "free" ? (
                  <a
                    href="#nastroj"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-deep-teal px-4 py-3 text-sm font-bold text-white"
                  >
                    Spustit náhled
                  </a>
                ) : (
                  <a
                    href="#nastroj"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-deep-teal/30 px-4 py-3 text-sm font-bold text-deep-teal"
                  >
                    Poptat individuálně
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link
            href={routes.oMajetio}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Více o Majetio →
          </Link>
          {" · "}
          <Link
            href={routes.legal.placenaAnalyza}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Obchodní podmínky →
          </Link>
        </p>
      </div>
    </section>
  );
}

export function RentgenBottomCta() {
  return (
    <section className="bg-deep-teal py-12 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold">
          Připraveni na konkrétní nemovitost?
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Nejdřív bezplatný náhled. Detailní analýzu za {formatAnalysisPrice()}{" "}
          objednáte, až budete mít jasno — bez slibu garantovaného výnosu.
        </p>
        <a
          href="#nastroj"
          className="mt-6 inline-flex rounded-lg bg-muted-gold px-6 py-3 text-sm font-bold text-[#0b3d3a]"
        >
          {PROPERTY_ANALYSIS_PRICING.ctaLabel}
        </a>
        <p className="mt-4 text-xs text-white/60">
          Pokročilý modelář scénářů:{" "}
          <Link href={routes.investicniRentgenModelar} className="underline">
            Investiční rentgen — modelář
          </Link>
        </p>
      </div>
    </section>
  );
}
