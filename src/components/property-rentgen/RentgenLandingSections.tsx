import Link from "next/link";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
  formatTierPrice,
  getAnalysisTier,
  getRentgenPremiumConfig,
  rentgenPrimaryCtaLabel,
  withAnalysisPrice,
  RENTGEN_FAQ,
} from "@/lib/property-rentgen";
import { CLAIM_KIND_DESCRIPTIONS, CLAIM_KIND_LABELS } from "@/lib/property-rentgen/types";
import { routes } from "@/lib/routes";
import { legalOperator } from "@/config/legal";

const QUESTIONS = [
  {
    q: "Kolik potřebuji hotovosti?",
    a: "Vlastní část kupní ceny, úpravy, vedlejší náklady a oddělená hotovostní rezerva.",
  },
  {
    q: "Kolik zůstane měsíčně?",
    a: "Nájem po výpadku a správě minus provoz, rezervy a splátka úvěru.",
  },
  {
    q: "Co když se zvýší sazba nebo vypadne nájem?",
    a: "Tři modelové situace a citlivost — bez předstírání, že známe budoucnost.",
  },
  {
    q: "Jaká cena odpovídá mému cíli?",
    a: "Bod zvratu a cenová hranice modelu při zadaném financování — ne tržní ocenění.",
  },
] as const;

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
          Zjistěte potřebný kapitál, měsíční výsledek a rizika konkrétní
          nemovitosti. Ještě předtím, než ji koupíte.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={routes.investicniRentgenUkazka}
            className="inline-flex items-center justify-center rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a] transition hover:bg-muted-gold-light"
          >
            Prohlédnout modelový rozbor
          </Link>
          <a
            href="#nastroj"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Spočítat náhled zdarma
          </a>
        </div>
        <p className="mt-5 max-w-2xl text-[11px] leading-relaxed text-white/55">
          Modelový analytický nástroj. Nejsme investiční doporučení, znalecký
          posudek ani právní due diligence. Neslibujeme jistou budoucnost ani
          zaručený výnos.
        </p>
      </div>
    </header>
  );
}

export function RentgenFourQuestions() {
  return (
    <section
      className="border-b border-border bg-white py-10 sm:py-12"
      aria-labelledby="questions-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="questions-heading"
          className="font-heading text-xl font-bold text-text-dark sm:text-2xl"
        >
          Čtyři otázky před koupí
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {QUESTIONS.map((item) => (
            <li
              key={item.q}
              className="rounded-2xl border border-border bg-[#f7f9f8] px-4 py-4"
            >
              <p className="font-semibold text-deep-teal">{item.q}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function RentgenPricing() {
  const tiers = getAnalysisTier();
  const live = getRentgenPremiumConfig().commerciallyActive;

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
          Co dostanete
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Jednoznačný rozsah plnění. Ceny z jediné konfigurace. Dokud není
          platba a doručení připravené, nabízíme poptávku — ne předstíraný nákup.
        </p>
        {!live ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Placené balíčky zatím nejsou v prodeji. Můžete poptat rozbor — ozveme
            se, až bude plnění připravené.
          </p>
        ) : null}

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">Srovnání balíčků Investičního rentgenu</caption>
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-semibold text-muted-foreground">Rozsah</th>
                {tiers.map((t) => (
                  <th key={t.id} className="px-3 py-3 font-heading text-base text-text-dark">
                    {t.name}
                    <div className="mt-1 text-lg font-bold tabular-nums text-deep-teal">
                      {formatTierPrice(t)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {(
                [
                  ["Cena za m², hrubý výnos", true, true, true],
                  ["Rozpočet koupě a vlastní hotovosti", false, true, true],
                  ["Cash flow včetně provozu, úvěru a rezerv", false, true, true],
                  ["Tři scénáře, citlivost a bod zvratu", false, true, true],
                  ["Interaktivní výstup a souhrnné PDF", false, true, true],
                  [
                    "Dohledání místních nabídek (odkazy + datum)",
                    false,
                    false,
                    true,
                  ],
                  ["Rozbor dodaných dokumentů", false, false, true],
                  ["Individuální komentovaný závěr", false, false, true],
                ] as const
              ).map(([label, free, digital, premium]) => (
                <tr key={label} className="border-b border-border/80">
                  <td className="py-3 pr-4 text-text-dark">{label}</td>
                  {[free, digital, premium].map((ok, i) => (
                    <td key={i} className="px-3 py-3 tabular-nums">
                      {ok ? "Ano" : "Ne"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={
                tier.id === "digital"
                  ? "rounded-2xl border-2 border-muted-gold bg-white p-5 shadow-sm"
                  : "rounded-2xl border border-border bg-[#f7f9f8] p-5"
              }
            >
              <p className="text-sm text-muted-foreground">{tier.summary}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {tier.deliveryExpectation.slice(0, 2).map((d) => (
                  <li key={d}>· {d}</li>
                ))}
              </ul>
              <a
                href={
                  tier.id === "free"
                    ? "#nastroj"
                    : "#premium-objednavka"
                }
                className={
                  tier.id === "digital"
                    ? "mt-5 inline-flex w-full items-center justify-center rounded-xl bg-muted-gold px-4 py-3 text-sm font-bold text-text-dark"
                    : "mt-5 inline-flex w-full items-center justify-center rounded-xl bg-deep-teal px-4 py-3 text-sm font-bold text-white"
                }
              >
                {rentgenPrimaryCtaLabel(tier.id)}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href={routes.legal.placenaAnalyza}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Obchodní podmínky
          </Link>
          {" · "}
          Provozovatel {legalOperator.companyName}, IČO {legalOperator.ico}
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
              t: "Podklady",
              d: "Cena, plocha, nájem, kapitál. Dokumenty jen u podrobného rozboru — a jen v rozsahu, který skutečně zpracujeme.",
            },
            {
              n: "2",
              t: "Výpočet / rozbor",
              d: `Automatický model (náhled a ${formatDigitalRentgenPrice()}) vs. individuální služba (${formatAnalysisPrice()}) s doloženými podklady.`,
            },
            {
              n: "3",
              t: "Doručení",
              d: "Náhled ihned. Placené výstupy až po úhradě a kompletních vstupech — pokud je prodej aktivní.",
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

export function RentgenDataTrustNote() {
  return (
    <section className="border-b border-border bg-white py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl font-bold text-text-dark">
          Kdo odpovídá a odkud jsou čísla
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico},{" "}
          {legalOperator.street}, {legalOperator.zip} {legalOperator.city}.
          Výpočty jsou deterministické z vašich vstupů a zveřejněných předpokladů.
        </p>
        <details className="group mt-4 rounded-2xl border border-border bg-[#f7f9f8] px-5 py-4">
          <summary className="cursor-pointer list-none font-semibold text-deep-teal [&::-webkit-details-marker]:hidden">
            Jak označujeme údaje
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {(
              ["DATA", "MODEL", "ODHAD", "NEOVERENO"] as const
            ).map((k) => (
              <li key={k}>
                <strong className="text-text-dark">{CLAIM_KIND_LABELS[k]}</strong>
                {" — "}
                {CLAIM_KIND_DESCRIPTIONS[k]}
              </li>
            ))}
          </ul>
        </details>
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
            <div key={item.q} className="rounded-2xl border border-border bg-white px-5 py-4">
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
          Spočítejte konkrétní nemovitost
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Nejdřív náhled zdarma. Model {formatDigitalRentgenPrice()} a podrobný
          rozbor {formatAnalysisPrice()} — až bude prodej připraven, nebo formou
          poptávky.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#nastroj"
            className="inline-flex rounded-xl bg-muted-gold px-6 py-3.5 text-sm font-bold text-[#0b3d3a]"
          >
            Spočítat náhled zdarma
          </a>
          <Link
            href={routes.investicniRentgenUkazka}
            className="inline-flex rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white"
          >
            Prohlédnout modelový rozbor
          </Link>
        </div>
        {!live ? (
          <p className="mt-4 text-[11px] text-white/55">
            Placené plnění není aktivní — CTA vedou na poptávku, ne na fiktivní
            platbu.
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Back-compat aliases */
export const RentgenPillars = RentgenFourQuestions;
export const RentgenValueProp = RentgenFourQuestions;
export const RentgenWhatWeAnalyze = RentgenHowItWorks;
export const RentgenMetricsGrid = RentgenFourQuestions;
export function RentgenDemoReport() {
  return null;
}
