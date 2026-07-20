import type { Metadata } from "next";
import {
  RentgenBottomCta,
  RentgenDemoReport,
  RentgenFaq,
  RentgenHero,
  RentgenMetricsGrid,
  RentgenPricing,
  RentgenValueProp,
  RentgenWhatWeAnalyze,
} from "@/components/property-rentgen/RentgenLandingSections";
import { RentgenToolIsland } from "@/components/property-rentgen/RentgenToolIsland";
import { formatAnalysisPrice, formatAnalysisPriceLabel } from "@/lib/property-rentgen";

export const metadata: Metadata = {
  title: "Investiční rentgen | Analýza nemovitosti | HypotékaJasně.cz",
  description: `Bezplatný náhled a kompletní analýza nemovitosti za ${formatAnalysisPrice()}. Údaje označujeme jako Data, Modelový výpočet, Odhad nebo Neověřeno.`,
};

export default function InvesticniRentgenPage() {
  return (
    <div className="bg-white">
      <RentgenHero />
      <RentgenValueProp />
      <RentgenWhatWeAnalyze />
      <RentgenMetricsGrid />
      <RentgenDemoReport />
      <RentgenToolIsland />
      <RentgenPricing />
      <RentgenFaq />
      <RentgenBottomCta />
      <p className="sr-only">{formatAnalysisPriceLabel()}</p>
    </div>
  );
}
