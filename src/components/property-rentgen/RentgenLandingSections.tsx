import Link from "next/link";
import { ClaimBadge, ClaimLegend } from "@/components/property-rentgen/ClaimBadge";
import {
  ANONYMOUS_DEMO_REPORT,
  RENTGEN_FAQ,
  RENTGEN_METRICS_CATALOG,
  formatAnalysisPrice,
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
          Analýza nemovitosti, které můžete věřit jen tolik, kolik mají data
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          Server-rendered přehled metrik, free preview a cesta ke{" "}
          <strong className="font-semibold text-white">
            Kompletní Majetio Property Analysis
          </strong>
          . Každý údaj označíme jako DATA, MODEL, ODHAD nebo NEOVĚŘENO — právní
          a technická fakta bez zdroje nevymýšlíme.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#nastroj"
            className="inline-flex items-center justify-center rounded-lg bg-muted-gold px-6 py-3 text-sm font-bold text-[#0b3d3a] transition hover:bg-muted-gold-light"
          >
            Spustit free preview
          </a>
          <a
            href="#cena"
            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Premium {formatAnalysisPrice()}
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
          Proč rentgen místo marketingového „skóre“
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Chcete rychle pochopit, jestli má nemovitost smysl zkoumat dál — ne
          falešnou jistotu. Free vrstva je crawlable a srozumitelná; hloubka je
          v Premium reportu Majetio.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "SSR first",
              d: "Klíčový obsah (H1, metriky, demo, FAQ, cena) je ve HTML bez čekání na JS.",
            },
            {
              t: "Transparentní claimy",
              d: "DATA / MODEL / ODHAD / NEOVĚŘENO u každého důležitého čísla.",
            },
            {
              t: "Monetizace bez lži",
              d: "Free preview konvertuje na kompletní analýzu — bez vymyšlených právních závěrů.",
            },
          ].map((item) => (
            <li
              key={item.t}
              className="rounded-xl border border-border bg-[#f7f8f7] p-5"
            >
              <p className="font-semibold text-deep-teal">{item.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
            </li>
          ))}
        </ul>
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
          Tři vstupy: URL inzerátu (reference), manuální údaje, později upload
          dokumentů a fotek. Výstup vždy odděluje ověřené od modelu.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Vložit URL",
              d: "Uložíme odkaz jako referenci. Obsah inzerátu automaticky neprohlašujeme za DATA.",
            },
            {
              n: "2",
              t: "Manuální údaje",
              d: "Cena, m², lokalita, nájem, equity — základ free preview.",
            },
            {
              n: "3",
              t: "Upload (připravujeme)",
              d: "Dokumenty a fotky pro Premium due diligence — architektura ready, UI postupně.",
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
          Free preview pokrývá základ; zbytek je v Premium reportu.
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
                {m.tier === "free" ? "Free preview" : "Premium"}
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
        <h2
          id="demo-heading"
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          Ukázka reportu
        </h2>
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
              Financing fit
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <ClaimBadge kind={demo.financingFit.kind} className="mr-2" />
              {demo.financingFit.value}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase text-amber-800">
              Red flags
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
              <dt className="font-semibold text-text-dark">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.a.includes("4 990")
                  ? item.a.replace(
                      /4 990\/5 000 Kč/g,
                      formatAnalysisPrice()
                    )
                  : item.a}
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
          Pricing & funnel
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Free preview → rozhodnutí → Premium analýza. Cena je konfigurovatelná
          v produktové konfiguraci (ne hardcode marketingu).
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
              Free
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-text-dark">
              Preview
            </p>
            <p className="mt-1 text-sm text-muted-foreground">0 Kč</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Orientační výnos</li>
              <li>Cena / m²</li>
              <li>Základní financing fit</li>
              <li>Základní red flags</li>
            </ul>
            <a
              href="#nastroj"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-deep-teal px-4 py-3 text-sm font-bold text-white"
            >
              Spustit preview
            </a>
          </div>

          <div className="rounded-2xl border-2 border-muted-gold bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-gold">
              Premium
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-text-dark">
              {p.productName}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-deep-teal">
              {formatAnalysisPrice(p)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              productId: {p.productId}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.includes.map((i) => (
                <li key={i}>+ {i}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-semibold text-text-dark">Neobsahuje</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {p.excludes.map((i) => (
                <li key={i}>− {i}</li>
              ))}
            </ul>
            <a
              href="#nastroj"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-muted-gold px-4 py-3 text-sm font-bold text-[#0b3d3a]"
            >
              {p.ctaLabel}
            </a>
            <Link
              href={routes.oMajetio}
              className="mt-3 block text-center text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              Více o Majetio →
            </Link>
          </div>
        </div>
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
          Začněte free preview — Premium report objednáte, až budete mít jasno.
        </p>
        <a
          href="#nastroj"
          className="mt-6 inline-flex rounded-lg bg-muted-gold px-6 py-3 text-sm font-bold text-[#0b3d3a]"
        >
          Přejít na nástroj
        </a>
        <p className="mt-4 text-xs text-white/60">
          Pokročilý 30letý modelář zůstává na{" "}
          <Link href={routes.investicniRentgenModelar} className="underline">
            /investicni-rentgen/modelar
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
