import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { LeadGen } from "@/components/sections/LeadGen";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { webApplicationJsonLd } from "@/lib/seo/json-ld";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

export const metadata: Metadata = getStaticPageSeo(routes.kalkulacky.root);

const CALCULATOR_CARDS = [
  {
    href: routes.kalkulacky.hypotecniKalkulacka,
    title: "Hypoteční kalkulačka",
    text: "Orientační měsíční splátka podle ceny, vlastních peněz a splatnosti.",
  },
  {
    href: routes.kalkulacky.koupeVsNajem,
    title: "Koupě vs. nájem",
    text: "Vyplatí se vlastní bydlení s hypotékou, nebo platit nájem?",
  },
  {
    href: routes.kalkulacky.rodinnyRozpocet,
    title: "Rodinný rozpočet",
    text: "Kolik zbude na život při splátce, dětech nebo výpadku příjmu.",
  },
  {
    href: routes.kalkulacky.odhadVersusKupniCena,
    title: "Odhad versus kupní cena",
    text: "Vlastní peníze a LTV, když je bankovní odhad nižší než cena.",
  },
  {
    href: routes.kalkulacky.hypotekaNaFirmu,
    title: "Financování firmy",
    text: "Anuitní model firemního úvěru zajištěného nemovitostí.",
  },
  {
    href: routes.kalkulacky.vystavba,
    title: "Výstavba a novostavba",
    text: "Rozpočet, pozemek, čerpání a úroky během stavby.",
  },
  {
    href: routes.kalkulacky.budouciPrijemZNajmu,
    title: "Budoucí příjem z nájmu",
    text: "Modelově uznaný nájem a tok po nákladech a splátce.",
  },
  {
    href: routes.kalkulacky.historickyVyvoj,
    title: "Historický vývoj",
    text: "Kontext sazeb a historická data — ne predikce.",
  },
  {
    href: routes.kalkulacky.potencialniVyvoj,
    title: "Potenciální vývoj investice",
    text: "Scénáře vývoje s viditelnými předpoklady modelu.",
  },
  {
    href: routes.investicniRentgen,
    title: "Investiční rentgen",
    text: "Cash flow, kapitál a rizika konkrétní investiční nemovitosti.",
  },
] as const;

export default function KalkulackyPage() {
  return (
    <>
      <JsonLdScript
        data={webApplicationJsonLd({
          name: "Hypotéka Jasně kalkulačky",
          description:
            "Webové kalkulačky hypotéky a investic — orientační model, ne závazná nabídka.",
          path: routes.kalkulacky.root,
        })}
      />
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs({
              name: "Kalkulačky",
              path: routes.kalkulacky.root,
            })}
          />
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            Hypoteční a investiční kalkulačky
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Spočítejte splátku, porovnejte koupě s nájmem nebo prověřte
            investiční cash flow. Výpočty jsou modelové — nejde o nabídku banky
            ani o schválení úvěru. Pro zveřejněné sazby bank použijte{" "}
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

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATOR_CARDS.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-colors hover:border-deep-teal/40"
              >
                <span className="font-heading text-lg font-semibold text-text-dark">
                  {c.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.text}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-12 max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-text-dark">
            Jak kalkulačky používat
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nejprve si spočítejte orientační splátku a vlastní zdroje. Pak
            porovnejte scénáře bydlení nebo investiční výnos. Pokud řešíte
            konkrétní byt na pronájem, pokračujte na{" "}
            <Link
              href={routes.investicniRentgen}
              className="font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              Investiční rentgen
            </Link>
            . Vzdělávací kontext najdete v{" "}
            <Link
              href={routes.akademie}
              className="font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              Hypoteční akademii
            </Link>{" "}
            a v{" "}
            <Link
              href={routes.temata}
              className="font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              tématech hypoték
            </Link>
            .
          </p>
        </section>
      </div>
      <LeadGen />
    </>
  );
}
