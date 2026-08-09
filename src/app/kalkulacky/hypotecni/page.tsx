import type { Metadata } from "next";
import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

/**
 * Canonical calculator document is /kalkulacky/hypotecni.
 * Query/result UI state must not create separate indexable URLs.
 */
export const metadata: Metadata = getStaticPageSeo(
  routes.kalkulacky.hypotecniKalkulacka
);

export default function HypotecniKalkulackaPage() {
  return (
    <>
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
            <a
              href={routes.sazby}
              className="font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              porovnání sazeb
            </a>
            .
          </p>
        </div>
      </div>
      <KalkulackyView initialTab="mortgage_calc" />
    </>
  );
}
