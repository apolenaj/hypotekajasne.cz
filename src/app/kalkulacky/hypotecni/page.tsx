import type { Metadata } from "next";
import Link from "next/link";
import { MiniMortgageCalculator } from "@/components/home/MiniMortgageCalculator";
import { LeadGen } from "@/components/sections/LeadGen";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { faqPageJsonLd } from "@/lib/seo/json-ld";
import { routes } from "@/lib/routes";

/**
 * Canonical calculator document is /kalkulacky/hypotecni.
 * Query/result UI state must not create separate indexable URLs.
 */
export const metadata: Metadata = getStaticPageSeo(
  routes.kalkulacky.hypotecniKalkulacka
);

const FAQ = [
  {
    question: "Je výsledek hypoteční kalkulačky nabídkou banky?",
    answer:
      "Ne. Jde o orientační model měsíční splátky podle zadané ceny, vlastních peněz a splatnosti. Konečná sazba a schválení vždy závisí na bance a vaší situaci.",
  },
  {
    question: "Jaký je rozdíl mezi úrokem a RPSN?",
    answer:
      "Úrok popisuje cenu půjčených peněz. RPSN zahrnuje i související náklady úvěru a lépe ukazuje celkovou cenu. V akademii najdete jednoduché vysvětlení RPSN s příklady.",
  },
  {
    question: "Kolik musím mít vlastních peněz na hypotéku?",
    answer:
      "Typicky se počítá s vlastními zdroji podle LTV limitů banky a regulace. Kalkulačka ukáže orientační úvěr a splátku — konkrétní LTV a výjimky vždy ověří banka.",
  },
  {
    question: "Kde najdu aktuální sazby hypoték?",
    answer:
      "Zveřejněné sazby bank porovnáte na stránce Sazby. Oddělujeme modelový výpočet od sazebníku — modelová sazba v kalkulačce není nabídka konkrétní banky.",
  },
] as const;

export default function HypotecniKalkulackaPage() {
  return (
    <>
      <JsonLdScript
        data={faqPageJsonLd(
          FAQ.map((f) => ({ question: f.question, answer: f.answer }))
        )}
      />
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <Breadcrumbs
            items={crumbs(
              { name: "Kalkulačky", path: routes.kalkulacky.root },
              {
                name: "Hypoteční kalkulačka",
                path: routes.kalkulacky.hypotecniKalkulacka,
              }
            )}
          />
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl">
            Hypoteční kalkulačka
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Orientační výpočet měsíční splátky podle ceny nemovitosti, vlastních
            prostředků a splatnosti. Používáme modelovou sazbu — nejde o nabídku
            konkrétní banky. Pro zveřejněné sazby bank použijte{" "}
            <Link
              href={routes.sazby}
              className="font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              porovnání sazeb hypoték
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-md">
          <MiniMortgageCalculator />
        </div>
      </div>

      <div className="border-t border-border bg-white">
        <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
          <section className="max-w-3xl">
            <h2 className="font-heading text-xl font-bold text-text-dark">
              Jak výpočet funguje
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Z ceny nemovitosti a vlastních zdrojů odhadneme výši úvěru. Splátku
              počítáme anuitně podle zadané splatnosti a modelové sazby. Výsledek
              slouží k rychlé orientaci před návštěvou banky — nezohledňuje
              pojištění, poplatky ani individuální posouzení příjmů.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Příklad: při kupní ceně 5&nbsp;000&nbsp;000&nbsp;Kč a vlastních
              1&nbsp;000&nbsp;000&nbsp;Kč model počítá se 4&nbsp;000&nbsp;000&nbsp;Kč
              úvěru. Změna sazby nebo splatnosti výrazně ovlivní měsíční splátku —
              proto vždy porovnejte i{" "}
              <Link
                href={routes.sazby}
                className="font-medium text-deep-teal underline-offset-2 hover:underline"
              >
                aktuální sazby hypoték
              </Link>
              .
            </p>
          </section>

          <section className="max-w-3xl">
            <h2 className="font-heading text-xl font-bold text-text-dark">
              Časté otázky
            </h2>
            <dl className="mt-4 space-y-5">
              {FAQ.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-text-dark">{item.question}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="max-w-3xl">
            <h2 className="font-heading text-xl font-bold text-text-dark">
              Související nástroje a průvodci
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={routes.kalkulacky.koupeVsNajem}
                  className="font-medium text-deep-teal underline-offset-2 hover:underline"
                >
                  Kalkulačka koupě vs. nájem
                </Link>
              </li>
              <li>
                <Link
                  href={routes.kalkulacky.rodinnyRozpocet}
                  className="font-medium text-deep-teal underline-offset-2 hover:underline"
                >
                  Rodinný rozpočet a hypotéka
                </Link>
              </li>
              <li>
                <Link
                  href={`${routes.temata}/hypoteka-podle-prijmu`}
                  className="font-medium text-deep-teal underline-offset-2 hover:underline"
                >
                  Hypotéka podle příjmu
                </Link>
              </li>
              <li>
                <Link
                  href={`${routes.akademie}/rpsn`}
                  className="font-medium text-deep-teal underline-offset-2 hover:underline"
                >
                  Akademie: co je RPSN
                </Link>
              </li>
              <li>
                <Link
                  href={routes.investicniRentgen}
                  className="font-medium text-deep-teal underline-offset-2 hover:underline"
                >
                  Investiční rentgen nemovitosti
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
      <LeadGen />
    </>
  );
}
