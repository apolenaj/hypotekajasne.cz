import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyCompareView } from "@/components/property-compare/PropertyCompareView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Porovnání nemovitostí — profesionální srovnání",
  description:
    "Srovnejte 2–5 nemovitostí: výnos, peněžní tok, IRR, DSCR, riziko a shodu s profilem. Kategorie vítězů, kompromisy, sdílený odkaz a PDF report.",
  path: routes.investicniRentgenPorovnani,
});

export default function InvesticniRentgenPorovnaniPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7] print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={[
              ...crumbs({
                name: "Investiční rentgen",
                path: routes.investicniRentgen,
              }),
              { name: "Porovnání", path: routes.investicniRentgenPorovnani },
            ]}
          />
        </div>
      </div>
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
            Načítám porovnání…
          </div>
        }
      >
        <PropertyCompareView />
      </Suspense>
    </>
  );
}
