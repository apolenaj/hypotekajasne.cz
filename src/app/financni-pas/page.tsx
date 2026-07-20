import type { Metadata } from "next";
import { FinancialPassportView } from "@/components/financial-passport/FinancialPassportView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Financial Passport — finančně-realitní profil",
  description:
    "Centrální profil dostupnosti, rizik a připravenosti s dimenzionálním skóre, timeline a simulacemi. Bez PII, kompatibilní s Majetio.",
  path: routes.financniPas,
});

export default function FinancniPasPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({
              name: "Financial Passport",
              path: routes.financniPas,
            })}
          />
        </div>
      </div>
      <FinancialPassportView />
    </>
  );
}
