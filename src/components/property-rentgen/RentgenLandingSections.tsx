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

const digitalPrice = () => formatDigitalRentgenPrice();
const premiumPrice = () => formatAnalysisPrice();

export function RentgenHero() {
  return (
    <header className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #c9a86c 0%, transparent 45%), radial-gradient(circle at 85% 10%, #ffffff 0%, transparent 35%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
          Investiční rentgen
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Kolik vám z nájmu skutečně zůstane?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          Prověřte cash flow, potřebnou hotovost, financování a rizikové scénáře
          ještě před koupí nemovitosti.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={`${routes.investicniRentgen}?balicek=999#premium-objednavka`}
            className="inline-flex items-center justify-center rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a] shadow-sm transition hover:bg-muted-gold-light"
            data-analytics="hero_999_click"
          >
            Prověřit nemovitost – {digitalPrice()}
          </Link>
          <a
            href="#nastroj"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            data-analytics="hero_free_click"
          >
            Spočítat náhled zdarma
          </a>
        </div>
        <p className="mt-3">
          <a
            href="#ukazky-vystupu"
            className="text-sm font-medium text-white/75 underline-offset-2 hover:text-white hover:underline"
          >
            Prohlédnout ukázkový výstup
          </a>
        </p>

        <ul className="mt-6 flex flex-col gap-1.5 text-xs text-white/70 sm:flex-row sm:flex-wrap sm:gap-x-5">
          <li>✓ jednorázová platba</li>
          <li>✓ bez předplatného</li>
          <li>✓ bezpečná platba přes Stripe</li>
        </ul>
        <p className="mt-4 max-w-2xl text-[11px] leading-relaxed text-white/55">
          Model vychází z vámi zadaných údajů a předpokladů. Nejde o investiční
          doporučení ani záruku výnosu.
        </p>
      </div>
    </header>
  );
}

export function RentgenProofQuestions() {
  return (
    <section
      className="border-b border-border bg-white py-10 sm:py-12"
      aria-labelledby="proof-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="proof-heading"
          className="font-heading text-xl font-bold text-text-dark sm:text-2xl"
        >
          Pět odpovědí, které chcete znát před koupí
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Kolik vlastních peněz potřebuji?",
            "Budu každý měsíc doplácet?",
            "Co se stane, když sazba vzroste?",
            "Co když bude nájem nižší?",
            "Jak vysoký nájem potřebuji pro nulové cash flow?",
          ].map((q) => (
            <li
              key={q}
              className="rounded-xl border border-border/80 bg-[#f7f9f8] px-4 py-3 text-sm font-medium text-text-dark"
            >
              {q}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function RentgenPricing() {
  const dig = digitalPrice();
  const prem = premiumPrice();

  return (
    <section
      id="cena"
      className="scroll-mt-24 border-b border-border bg-[#f4f6f5] py-12 sm:py-16"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="pricing-heading"
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          Vyberte rozsah analýzy
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Jednorázová platba přes Stripe. Bez předplatného.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-stretch">
          {/* 999 — dominant */}
          <article className="relative flex h-full flex-col rounded-2xl border-2 border-muted-gold bg-white p-6 shadow-[0_8px_30px_rgba(11,61,58,0.08)]">
            <p className="absolute -top-3 left-6 rounded-full bg-deep-teal px-3 py-0.5 text-[11px] font-bold text-white">
              Nejčastější volba
            </p>
            <h3 className="font-heading text-xl font-bold text-text-dark">
              Investiční rentgen
            </h3>
            <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-deep-teal">
              {dig}
            </p>
            <p className="text-xs text-muted-foreground">
              jednorázově / 1 nemovitost
            </p>
            <p className="mt-3 text-sm font-semibold text-text-dark">
              Čísla konkrétní nemovitosti ještě před koupí.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Zjistěte, jak náklady a financování mění výsledek investice.
            </p>

            <div className="mt-5 flex-1 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
                  Co zjistíte
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {[
                    "Kolik vlastní hotovosti budete potřebovat",
                    "Kolik vám po nákladech a splátce zbude nebo budete doplácet",
                    "Jak investici ovlivní změna nájmu",
                    "Jak investici ovlivní změna sazby",
                    "Co ukáže nepříznivý scénář",
                    "Kde je bod zvratu / hranice nulového cash flow",
                    "Jak se během splácení mění jistina úvěru",
                  ].map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
                  Co dostanete
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>✓ Interaktivní výsledek, scénáře, stress test</li>
                  <li>✓ Citlivost nájem × sazba a amortizace</li>
                  <li>
                    ✓ {DIGITAL_SAMPLE_PAGE_COUNT}stránkový PDF Rentgen
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 lg:mt-auto lg:pt-6">
              <Link
                href={`${routes.investicniRentgen}?balicek=999#premium-objednavka`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-muted-gold px-4 py-3.5 text-sm font-bold text-text-dark shadow-sm"
                data-analytics="pricing_999_click"
              >
                Analyzovat nemovitost – {dig}
              </Link>
              <Link
                href={`${routes.investicniRentgenUkazka}?balicek=999`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-deep-teal/30 px-4 py-2.5 text-sm font-semibold text-deep-teal"
                data-analytics="sample_999_view"
              >
                Ukázat výstup za {dig}
              </Link>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Automatický finanční model z vašich vstupů.
            </p>
          </article>

          {/* 4990 */}
          <article className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm ring-1 ring-deep-teal/10">
            <h3 className="font-heading text-xl font-bold text-text-dark">
              Individuální investiční rozbor
            </h3>
            <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-deep-teal">
              {prem}
            </p>
            <p className="text-xs text-muted-foreground">
              jednorázově / 1 nemovitost
            </p>
            <p className="mt-3 text-sm font-semibold text-text-dark">
              Finanční model + individuální práce s podklady a veřejnými daty.
            </p>
            <p className="mt-3 rounded-xl bg-deep-teal/5 px-3 py-2.5 text-sm text-deep-teal">
              Rentgen za {dig} počítá z vašich vstupů. Individuální rozbor za{" "}
              {prem} navíc přidává práci člověka s podklady, dostupnými daty a
              konkrétní nemovitostí.
            </p>

            <div className="mt-5 flex-1 space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-text-dark">
                Vše z Rentgenu + lidská práce
              </p>
              <ul className="space-y-1.5">
                {[
                  "projdeme dodané podklady",
                  "zkontrolujeme finanční předpoklady",
                  "dohledáme relevantní veřejná data",
                  "dohledáme relevantní místní nabídky",
                  "porovnáme původní předpoklady s dostupnými podklady",
                  "upozorníme na rozpory a oblasti k prověření",
                  "doplníme individuální komentář",
                  "rozšíříme scénáře podle dostupných informací",
                  `${PREMIUM_SAMPLE_PAGE_COUNT}stránkový individuální PDF rozbor`,
                ].map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-col gap-2 lg:mt-auto lg:pt-6">
              <Link
                href={`${routes.investicniRentgen}?balicek=4990#premium-objednavka`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-deep-teal px-4 py-3.5 text-sm font-bold text-white shadow-sm"
                data-analytics="pricing_4990_click"
              >
                Objednat individuální rozbor – {prem}
              </Link>
              <Link
                href={`${routes.investicniRentgenUkazka}?balicek=4990`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-deep-teal/30 px-4 py-2.5 text-sm font-semibold text-deep-teal"
                data-analytics="sample_4990_view"
              >
                Ukázat rozbor za {prem}
              </Link>
            </div>
          </article>
        </div>

        {/* Free — smaller entry */}
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-white/70 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="font-semibold text-text-dark">
              Nejste ještě rozhodnutí?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vyzkoušejte základní náhled zdarma — cena za m², hrubý výnos a
              orientační čísla. Pro kompletní cash flow, scénáře a PDF: Rentgen{" "}
              {dig}.
            </p>
          </div>
          <a
            href="#nastroj"
            className="mt-3 inline-flex shrink-0 rounded-xl border border-deep-teal/25 px-4 py-2.5 text-sm font-bold text-deep-teal sm:mt-0"
          >
            Spočítat náhled zdarma
          </a>
        </div>

        <RentgenWhichProduct />
        <RentgenComparisonDetails />

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

function RentgenWhichProduct() {
  return (
    <div className="mt-10 rounded-2xl border border-border bg-white px-5 py-6 sm:px-7">
      <h3 className="font-heading text-xl font-bold text-text-dark">
        Který produkt je pro mě?
      </h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-muted-gold/40 bg-muted-gold/10 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            Rentgen {digitalPrice()}
          </p>
          <p className="mt-2 text-sm font-semibold text-text-dark">
            Chci vědět: „Jak tato nemovitost vychází podle mých čísel?“
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            → automatický finanční model
          </p>
        </div>
        <div className="rounded-xl border border-border bg-[#f7f9f8] px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            Rozbor {premiumPrice()}
          </p>
          <p className="mt-2 text-sm font-semibold text-text-dark">
            Chci vědět: „Co se změní, když se na nemovitost a podklady podíváme
            hlouběji?“
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            → finanční model + individuální zpracování
          </p>
        </div>
      </div>
    </div>
  );
}

function RentgenComparisonDetails() {
  const rows: {
    cat: string;
    label: string;
    free: boolean;
    digital: boolean;
    premium: boolean;
  }[] = [
    {
      cat: "Základní výsledek",
      label: "Cena za m², hrubý výnos",
      free: true,
      digital: true,
      premium: true,
    },
    {
      cat: "Základní výsledek",
      label: "Rozpočet hotovosti a cash flow",
      free: false,
      digital: true,
      premium: true,
    },
    {
      cat: "Financování",
      label: "Splátka, jistina, amortizace",
      free: false,
      digital: true,
      premium: true,
    },
    {
      cat: "Rizikové scénáře",
      label: "Scénáře, citlivost, bod zvratu",
      free: false,
      digital: true,
      premium: true,
    },
    {
      cat: "Výstup",
      label: "PDF report",
      free: false,
      digital: true,
      premium: true,
    },
    {
      cat: "Individuální práce",
      label: "Dohledání místních nabídek",
      free: false,
      digital: false,
      premium: true,
    },
    {
      cat: "Individuální práce",
      label: "Rozbor dodaných dokumentů",
      free: false,
      digital: false,
      premium: true,
    },
    {
      cat: "Individuální práce",
      label: "Individuální komentář",
      free: false,
      digital: false,
      premium: true,
    },
  ];

  const Cell = ({
    ok,
    label,
  }: {
    ok: boolean;
    label: string;
  }) => (
    <td className="px-2 py-2 text-center">
      <span
        className={ok ? "font-bold text-deep-teal" : "text-muted-foreground"}
        aria-label={`${label}: ${ok ? "ano" : "ne"}`}
      >
        {ok ? "✓" : "—"}
      </span>
    </td>
  );

  return (
    <details className="mt-6 rounded-2xl border border-border bg-white px-5 py-4">
      <summary className="cursor-pointer list-none font-semibold text-deep-teal [&::-webkit-details-marker]:hidden">
        Zobrazit detailní srovnání
      </summary>

      {/* Desktop matrix */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[520px] text-left text-sm">
          <caption className="sr-only">Srovnání balíčků</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-3">Rozsah</th>
              <th className="px-2 py-2 text-center">Zdarma</th>
              <th className="px-2 py-2 text-center">Rentgen</th>
              <th className="px-2 py-2 text-center">Rozbor</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-border/70">
                <td className="py-2 pr-3">
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                    {r.cat}
                  </span>
                  <span className="text-text-dark">{r.label}</span>
                </td>
                <Cell ok={r.free} label={r.label} />
                <Cell ok={r.digital} label={r.label} />
                <Cell ok={r.premium} label={r.label} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked */}
      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-xl border border-border bg-[#fafbfa] px-3 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {r.cat}
            </p>
            <p className="text-sm font-medium text-text-dark">{r.label}</p>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <dt className="text-muted-foreground">Zdarma</dt>
                <dd
                  className="font-bold text-deep-teal"
                  aria-label={`Zdarma: ${r.free ? "ano" : "ne"}`}
                >
                  {r.free ? "✓" : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rentgen</dt>
                <dd
                  className="font-bold text-deep-teal"
                  aria-label={`Rentgen: ${r.digital ? "ano" : "ne"}`}
                >
                  {r.digital ? "✓" : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rozbor</dt>
                <dd
                  className="font-bold text-deep-teal"
                  aria-label={`Rozbor: ${r.premium ? "ano" : "ne"}`}
                >
                  {r.premium ? "✓" : "—"}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </details>
  );
}

export function RentgenSamplePreviewCards() {
  return (
    <section
      id="ukazky-vystupu"
      className="scroll-mt-24 border-b border-border bg-white py-12 sm:py-14"
      aria-labelledby="samples-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="samples-heading"
          className="font-heading text-2xl font-bold text-text-dark"
        >
          Podívejte se, co dostanete
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Veřejné modelové ukázky — stejná struktura výstupu jako u placené
          objednávky.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href={`${routes.investicniRentgenUkazka}?balicek=999`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-muted-gold/50 bg-[#faf9f6] transition hover:border-muted-gold"
            data-analytics="sample_999_view"
          >
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[#0b3d3a] to-[#1a5c4a] p-5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-gold">
                PDF · {DIGITAL_SAMPLE_PAGE_COUNT} stran
              </p>
              <p className="mt-2 font-heading text-lg font-bold">
                Investiční rentgen
              </p>
              <ul className="mt-4 space-y-1 text-xs text-white/80">
                <li>· Měsíční cash flow po nákladech a splátce</li>
                <li>· Scénáře a citlivost nájem × sazba</li>
                <li>· Bod zvratu a amortizace jistiny</li>
              </ul>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-sm font-semibold text-text-dark group-hover:text-deep-teal">
                Podívejte se, co dostanete
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Automatický model z vašich vstupů · {digitalPrice()}
              </p>
            </div>
          </Link>

          <Link
            href={`${routes.investicniRentgenUkazka}?balicek=4990`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-[#f7f9f8] transition hover:border-deep-teal/40"
            data-analytics="sample_4990_view"
          >
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[#123f3c] via-[#0f4c48] to-[#2a6b55] p-5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-gold">
                PDF · {PREMIUM_SAMPLE_PAGE_COUNT} stran
              </p>
              <p className="mt-2 font-heading text-lg font-bold">
                Individuální rozbor
              </p>
              <ul className="mt-4 space-y-1 text-xs text-white/80">
                <li>· Hodnoty před a po práci s podklady</li>
                <li>· Změna pravidelných nákladů</li>
                <li>· Individuální zjištění a oblasti k prověření</li>
              </ul>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-sm font-semibold text-text-dark group-hover:text-deep-teal">
                Podívejte se, co přidá individuální zpracování
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Model + lidská práce · {premiumPrice()}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function RentgenRevealCards() {
  return (
    <section
      className="border-b border-border bg-[#f4f6f5] py-12"
      aria-labelledby="reveal-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="reveal-heading"
          className="font-heading text-2xl font-bold text-text-dark"
        >
          Co může analýza odhalit
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Typické situace z modelových výpočtů — ne příslib výsledku u vaší
          nemovitosti.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              t: "Výnos vypadá dobře. Cash flow už ne.",
              d: "Hrubý výnos může skrývat měsíční doplácení po splátce a nákladech.",
            },
            {
              t: "Potřebujete více hotovosti, než jste čekali.",
              d: "Vedle vlastního podílu vstupují úpravy, vedlejší náklady a rezerva.",
            },
            {
              t: "Vyšší sazba změní výsledek o tisíce měsíčně.",
              d: "Stress test ukáže, jak citlivý je výsledek na financování.",
            },
            {
              t: "Nulové cash flow vyžaduje vyšší nájem nebo jinou kupní cenu.",
              d: "Bod zvratu převádí model na konkrétní hranici, kterou chcete znát před koupí.",
            },
          ].map((c) => (
            <article
              key={c.t}
              className="rounded-2xl border border-border bg-white px-5 py-5"
            >
              <h3 className="font-heading text-base font-bold text-text-dark">
                {c.t}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RentgenHowItWorks() {
  return (
    <section
      className="border-b border-border bg-white py-12"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="how-heading"
          className="font-heading text-2xl font-bold text-text-dark"
        >
          Jak služba funguje
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
              d: "Náhled ihned. Placený výstup po úhradě přes Stripe. Individuální rozbor pokračuje doplněním podkladů.",
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-border bg-[#f7f9f8] px-5 py-5"
            >
              <span className="text-xs font-bold text-muted-gold">{s.n}</span>
              <p className="mt-1 font-semibold text-text-dark">{s.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-border bg-[#f7f9f8] px-5 py-5">
          <h3 className="font-heading text-lg font-bold text-text-dark">
            Metodika a důvěra
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico},{" "}
            {legalOperator.street}, {legalOperator.zip} {legalOperator.city}.
            Výpočty vycházejí z vašich vstupů a zveřejněných předpokladů modelu.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Označení údajů:{" "}
            <strong className="font-medium text-text-dark">
              Zadáno klientem
            </strong>
            ,{" "}
            <strong className="font-medium text-text-dark">
              Modelový předpoklad
            </strong>
            ,{" "}
            <strong className="font-medium text-text-dark">Vypočteno</strong>,{" "}
            <strong className="font-medium text-text-dark">Neověřeno</strong>.
            Váš vstup automaticky neoznačujeme jako ověřený.
          </p>
          <p className="mt-3 text-sm">
            <Link
              href={routes.metodika}
              className="font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              Metodika a zdroje dat
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export function RentgenFaq() {
  return (
    <section
      className="border-b border-border bg-[#f4f6f5] py-12 sm:py-16"
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
              className="rounded-2xl border border-border bg-white px-5 py-4"
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
      </div>
    </section>
  );
}

export function RentgenBottomCta() {
  return (
    <section className="bg-deep-teal py-12 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          Prověřte nemovitost před koupí
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Začněte Rentgenem za {formatDigitalRentgenPrice()}, nebo vyzkoušejte
          náhled zdarma.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`${routes.investicniRentgen}?balicek=999#premium-objednavka`}
            className="inline-flex rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a]"
          >
            {rentgenPrimaryCtaLabel("digital")}
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
