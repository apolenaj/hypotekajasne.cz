import type { Metadata } from "next";
import { CompanyMortgagePage } from "@/components/scenarios/CompanyMortgagePage";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { scenarioRoutes } from "@/lib/scenarios/sources";

export const metadata: Metadata = buildPageMetadata({
  title: "Hypotéka na firmu — financování nemovitosti přes s.r.o.",
  description:
    "Jak financovat nemovitost přes firmu: rozdíl oproti OSVČ, doklady, rizika a orientační kalkulačka anuitního úvěru se zajištěním.",
  path: scenarioRoutes.companyTopic,
});

export default function Page() {
  return <CompanyMortgagePage mode="topic" />;
}
