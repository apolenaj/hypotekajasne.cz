import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AppraisalVsPriceCalculator } from "@/components/family-budget/AppraisalVsPriceCalculator";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

export const metadata: Metadata = getStaticPageSeo(
  routes.kalkulacky.odhadVersusKupniCena
);

export default function Page() {
  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs(
              { name: "Kalkulačky", path: routes.kalkulacky.root },
              {
                name: "Odhad versus kupní cena",
                path: routes.kalkulacky.odhadVersusKupniCena,
              }
            )}
          />
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-text-dark">
            Odhad versus kupní cena
          </h1>
          <p className="mt-3 text-muted-foreground">
            Kompaktní model vlastních peněz při rozdílu bankovního odhadu a
            kupní ceny. LTV strop není schválená hypotéka.
          </p>
          <p className="mt-3 text-sm">
            Související:{" "}
            <Link
              href={routes.kalkulacky.hypotecniKalkulacka}
              className="font-medium text-deep-teal hover:underline"
            >
              hypoteční kalkulačka
            </Link>
            {" · "}
            <Link
              href={`${routes.akademie}/ltv`}
              className="font-medium text-deep-teal hover:underline"
            >
              Akademie: LTV
            </Link>
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <AppraisalVsPriceCalculator />
      </div>
    </div>
  );
}
