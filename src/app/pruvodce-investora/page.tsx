import type { Metadata } from "next";
import { InvestorGuideHub } from "@/components/pages/InvestorGuideHub";

export const metadata: Metadata = {
  title: "Průvodce investora | HypotékaJasně.cz",
  description:
    "Vyberte investiční destinaci — kalkulačka, tržní analýza a financování pro 8 zemí.",
};

export default function PruvodceInvestoraPage() {
  return <InvestorGuideHub />;
}
