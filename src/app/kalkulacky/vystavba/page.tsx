import type { Metadata } from "next";
import { ConstructionMortgagePage } from "@/components/scenarios/ConstructionMortgagePage";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { scenarioRoutes } from "@/lib/scenarios/sources";

export const metadata: Metadata = buildPageMetadata({
  title: "Kalkulačka výstavby a novostavby",
  description:
    "Rozpočet, vlastní pozemek, čerpání, úroky během stavby a splátka po dočerpání. Ilustrativní harmonogram, ne závazný plán banky.",
  path: scenarioRoutes.constructionCalc,
});

export default function Page() {
  return <ConstructionMortgagePage mode="calculator" />;
}
