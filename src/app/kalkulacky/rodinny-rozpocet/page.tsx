import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FamilyBudgetCalculator } from "@/components/family-budget/FamilyBudgetCalculator";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Zvládneme hypotéku i s rodinou? — rodinný rozpočet",
  description:
    "Spočítejte si, kolik vám zbude na život a jak rozpočet ovlivní rodičovství, výpadek příjmu nebo vyšší splátka. Model podle vašich údajů, ne schválení banky.",
  path: routes.kalkulacky.rodinnyRozpocet,
});

export default function Page() {
  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs(
              { name: "Kalkulačky", path: routes.kalkulacky.root },
              {
                name: "Rodinný rozpočet",
                path: routes.kalkulacky.rodinnyRozpocet,
              }
            )}
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Kalkulačka
          </p>
          <h1 className="mt-2 max-w-3xl font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            Zvládneme hypotéku i s rodinou?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Spočítejte si, kolik vám zbude na život a jak rozpočet ovlivní
            rodičovství, výpadek příjmu nebo vyšší splátka.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Nejde o bankovní schvalovací kalkulačku. Výstup popisuje rozpočet
            podle zadaných údajů. Bez registrace; citlivé údaje neposíláme do
            analytiky ani do URL.
          </p>
          <p className="mt-3 text-sm">
            <Link
              href={`${routes.temata}/hypoteka-a-rodina`}
              className="font-medium text-deep-teal hover:underline"
            >
              Průvodce: Hypotéka a plánování rodiny
            </Link>
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <FamilyBudgetCalculator />
      </div>
    </div>
  );
}
