import type { Metadata } from "next";
import { ConstructionMortgagePage } from "@/components/scenarios/ConstructionMortgagePage";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { scenarioRoutes } from "@/lib/scenarios/sources";

export const metadata: Metadata = buildPageMetadata({
  title: "Hypotéka na výstavbu a novostavbu — od pozemku po nastěhování",
  description:
    "Postup, rozpočet, čerpání a kalkulačka výstavby. Oddělujeme vlastní pozemek od hotovosti a modelujeme úroky během čerpání.",
  path: scenarioRoutes.constructionTopic,
});

export default function Page() {
  return <ConstructionMortgagePage mode="topic" />;
}
