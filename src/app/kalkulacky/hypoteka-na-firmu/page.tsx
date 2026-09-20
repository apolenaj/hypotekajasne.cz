import type { Metadata } from "next";
import { CompanyMortgagePage } from "@/components/scenarios/CompanyMortgagePage";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { scenarioRoutes } from "@/lib/scenarios/sources";

export const metadata: Metadata = buildPageMetadata({
  title: "Kalkulačka financování firmy",
  description:
    "Orientační anuitní model firemního úvěru zajištěného nemovitostí. LTV, splátka a volitelné DSCR — ne individuální nabídka banky.",
  path: scenarioRoutes.companyCalc,
});

export default function Page() {
  return <CompanyMortgagePage mode="calculator" />;
}
