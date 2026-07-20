import type { Metadata } from "next";
import { InvestmentPassportView } from "@/components/sections/InvestmentPassportView";

export const metadata: Metadata = {
  title: "Osobní investiční průvodce | HypotékaJasně.cz",
  description:
    "Transparentní market matching: Overall Match, vážené dimenze, Top 3 trhy a side-by-side srovnání.",
};

export default function InvesticniPasPage() {
  return <InvestmentPassportView />;
}
