import Link from "next/link";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
  rentgenPrimaryCtaLabel,
  withAnalysisPrice,
  RENTGEN_FAQ,
} from "@/lib/property-rentgen";
import {
  DIGITAL_SAMPLE_PAGE_COUNT,
  PREMIUM_SAMPLE_PAGE_COUNT,
} from "@/lib/property-rentgen/sample-pdf-meta";
import { routes } from "@/lib/routes";
import { legalOperator } from "@/config/legal";

export function RentgenHero() {
  return (
    <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
          Investiční rentgen
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Kolik vám z nájmu skutečně zůstane?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          Spočítejte potřebnou hotovost, měsíční výsledek po nákladech a splátce
          a rizika ještě před koupí.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={routes.investicniRentgenUkazka}
            className="inline-flex items-center justify-center rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a] shadow-sm transition hover:bg-muted-gold-light"
          >
            Zobrazit ukázku výsledku
          </Link>
          <a
            href="#nastroj"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Spočítat náhled zdarma
          </a>
        </div>
        <p className="mt-5 max-w-2xl text-[11px] leading-relaxed text-white/55">
          Model podle vašich vstupů a předpokladů. Nejde o investiční doporučení
          ani záruku výnosu.
        </p>
      </div>
    </header>
  );
}

export function RentgenPricing() {
  const digitalPrice = formatDigitalRentgenPrice();
  const premiumPrice = formatAnalysisPrice();

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
          Co si můžete objednat
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Vyberte rozsah analýzy a dokončete objednávku online. Bezpečná
          jednorázová platba přes Stripe.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-stretch">
          {/* 999 */}
          <article className="relative flex h-full flex-col rounded-2xl border-2 border-muted-gold bg-white p-6 shadow-sm">
            <p className="absolute -top-3 left-6 rounded-full bg-deep-teal px-3 py-0.5 text-[11px] font-bold text-white">
              Nejčastější volba
            </p>
            <h3 className="font-heading text-xl font-bold text-text-dark">
              Investiční rentgen
            </h3>
            <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-deep-teal">
              {digitalPrice}
            </p>
            <p className="text-xs text-muted-foreground">
              jednorázově / 1 nemovitost
            </p>
            <p className="mt-3 text-sm font-semibold text-text-dark">
              Zjistěte, co s investicí udělají skutečné náklady.
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li>· Potřebná vlastní hotovost</li>
              <li>· Cash flow po splátce</li>
              <li>· Výnos, scénáře a stress test</li>
              <li>· Bod zvratu</li>
              <li>· Interaktivní výstup a PDF</li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Forma: automatický model ze zadaných údajů. Dodání: po úhradě a
              kompletních vstupech.
            </p>
            <div className="mt-5 flex flex-col gap-2 lg:mt-auto lg:pt-6">
              <Link
                href={`${routes.investicniRentgen}?balicek=999#premium-objednavka`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-muted-gold px-4 py-3.5 text-sm font-bold text-text-dark shadow-sm"
              >
                {rentgenPrimaryCtaLabel("digital")}
              </Link>
              <Link
                href={`${routes.investicniRentgenUkazka}?balicek=999`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-deep-teal/30 px-4 py-2.5 text-sm font-semibold text-deep-teal"
              >
                Prohlédnout ukázku výstupu
              </Link>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              ✓ Jednorázová platba · ✓ Bez předplatného · ✓ Stripe
            </p>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              <a
                href="/api/rentgen-sample-pdf?balicek=999"
                className="underline-offset-2 hover:underline"
              >
                Stáhnout modelové PDF ({DIGITAL_SAMPLE_PAGE_COUNT} stran)
              </a>
            </p>
          </article>

          {/* 4990 */}
          <article className="flex h-full flex-col rounded-2xl border border-border bg-[#f7f9f8] p-6 shadow-sm ring-1 ring-deep-teal/10">
            <h3 className="font-heading text-xl font-bold text-text-dark">
              Individuální rozbor
            </h3>
            <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-deep-teal">
              {premiumPrice}
            </p>
            <p className="text-xs text-muted-foreground">
              jednorázově / 1 nemovitost
            </p>
            <p className="mt-3 text-sm font-semibold text-text-dark">
              Když chcete jít před koupí ještě hlouběji.
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li>· Kompletní Investiční rentgen</li>
              <li>· Rozbor dodaných podkladů</li>
              <li>· Kontrola finančních předpokladů</li>
              <li>· Dohledání relevantních veřejných dat a nabídek</li>
              <li>· Individuální komentář a rizika k prověření</li>
              <li>· Výstup v PDF</li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Forma: model + individuální práce s podklady. Termín dodání
              potvrdíme po kontrole rozsahu a podkladů.
            </p>
            <div className="mt-5 flex flex-col gap-2 lg:mt-auto lg:pt-6">
              <Link
                href={`${routes.investicniRentgen}?balicek=4990#premium-objednavka`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-deep-teal px-4 py-3.5 text-sm font-bold text-white shadow-sm"
              >
                {rentgenPrimaryCtaLabel("premium")}
              </Link>
              <Link
                href={`${routes.investicniRentgenUkazka}?balicek=4990`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-deep-teal/30 px-4 py-2.5 text-sm font-semibold text-deep-teal"
              >
                Prohlédnout celý modelový rozbor
              </Link>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              🔒 Bezpečná platba přes Stripe · Jednorázová · Bez předplatného
            </p>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              <a
                href="/api/rentgen-sample-pdf?balicek=4990"
                className="underline-offset-2 hover:underline"
              >
                Stáhnout modelové PDF ({PREMIUM_SAMPLE_PAGE_COUNT} stran)
              </a>
            </p>
          </article>
        </div>

        {/* Free as smaller entry */}
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-[#fafbfa] px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="font-semibold text-text-dark">Náhled zdarma</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cena za m² a hrubý výnos z vašich čísel — ihned v prohlížeči.
              Bez PDF a bez scénářů.
            </p>
          </div>
          <a
            href="#nastroj"
            className="mt-3 inline-flex shrink-0 rounded-xl border border-deep-teal/25 px-4 py-2.5 text-sm font-bold text-deep-teal sm:mt-0"
          >
            Spočítat náhled zdarma
          </a>
        </div>

        <details className="mt-6 rounded-2xl border border-border bg-white px-5 py-4">
          <summary className="cursor-pointer list-none font-semibold text-deep-teal [&::-webkit-details-marker]:hidden">
            Detailní srovnání rozsahu
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <caption className="sr-only">Srovnání balíčků</caption>
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3">Rozsah</th>
                  <th className="py-2 px-2">Zdarma</th>
                  <th className="py-2 px-2">Rentgen</th>
                  <th className="py-2 px-2">Rozbor</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {(
                  [
                    ["Cena za m², hrubý výnos", "Ano", "Ano", "Ano"],
                    ["Rozpočet hotovosti a cash flow", "Ne", "Ano", "Ano"],
                    ["Scénáře, citlivost, bod zvratu", "Ne", "Ano", "Ano"],
                    ["PDF výstup", "Ne", "Ano", "Ano"],
                    ["Dohledání místních nabídek", "Ne", "Ne", "Ano"],
                    ["Rozbor dodaných dokumentů", "Ne", "Ne", "Ano"],
                    ["Individuální komentář", "Ne", "Ne", "Ano"],
                  ] as const
                ).map(([label, a, b, c]) => (
                  <tr key={label} className="border-b border-border/70">
                    <td className="py-2 pr-3 text-text-dark">{label}</td>
                    <td className="px-2 py-2">{a}</td>
                    <td className="px-2 py-2">{b}</td>
                    <td className="px-2 py-2">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href={routes.legal.placenaAnalyza}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Obchodní podmínky
          </Link>
          {" · "}
          {legalOperator.companyName}, IČO {legalOperator.ico}
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
          Jak probíhá zpracování
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Zadáte údaje",
              d: "Cena, plocha, nájem, vlastní kapitál. U individuálního rozboru doplníte dokumenty, které máte.",
            },
            {
              n: "2",
              t: "Výpočet nebo rozbor",
              d: `Náhled a Rentgen (${formatDigitalRentgenPrice()}) běží automaticky. Individuální rozbor (${formatAnalysisPrice()}) přidává práci s podklady a nabídkami.`,
            },
            {
              n: "3",
              t: "Výstup",
              d: "Náhled ihned. Placený výstup po úhradě přes Stripe a kompletních vstupech. Individuální rozbor pokračuje doplněním podkladů.",
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

        <div className="mt-8 rounded-2xl border border-border bg-white px-5 py-5">
          <h3 className="font-heading text-lg font-bold text-text-dark">
            Kdo to zajišťuje
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico},{" "}
            {legalOperator.street}, {legalOperator.zip} {legalOperator.city}.
            Výpočty vycházejí z vašich vstupů a zveřejněných předpokladů modelu.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Označení údajů:{" "}
            <strong className="font-medium text-text-dark">Zadáno klientem</strong>
            ,{" "}
            <strong className="font-medium text-text-dark">Modelový předpoklad</strong>
            ,{" "}
            <strong className="font-medium text-text-dark">Vypočteno</strong>
            ,{" "}
            <strong className="font-medium text-text-dark">Neověřeno</strong>
            . Váš vstup automaticky neoznačujeme jako ověřený.
          </p>
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
          className="font-heading text-2xl font-bold text-text-dark"
        >
          Časté otázky
        </h2>
        <dl className="mt-8 space-y-4">
          {RENTGEN_FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-border bg-[#f7f9f8] px-5 py-4"
            >
              <dt className="font-semibold text-text-dark">
                {withAnalysisPrice(item.q)}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {withAnalysisPrice(item.a)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link
            href={routes.metodika}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Metodika a zdroje dat
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
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          Spočítejte svou nemovitost
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Začněte náhledem zdarma, nebo rovnou dokončete online objednávku přes
          Stripe.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`${routes.investicniRentgen}?balicek=4990#premium-objednavka`}
            className="inline-flex rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a]"
          >
            {rentgenPrimaryCtaLabel("premium")}
          </Link>
          <a
            href="#nastroj"
            className="inline-flex rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white"
          >
            Spočítat náhled zdarma
          </a>
        </div>
      </div>
    </section>
  );
}

/** Back-compat aliases */
export const RentgenFourQuestions = () => null;
export const RentgenDataTrustNote = () => null;
export const RentgenPillars = RentgenFourQuestions;
export const RentgenValueProp = RentgenFourQuestions;
export const RentgenWhatWeAnalyze = RentgenHowItWorks;
export const RentgenMetricsGrid = RentgenFourQuestions;
export function RentgenDemoReport() {
  return null;
}
