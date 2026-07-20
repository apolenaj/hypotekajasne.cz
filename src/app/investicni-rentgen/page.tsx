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
import { formatAnalysisPriceLabel } from "@/lib/property-rentgen";

export const metadata: Metadata = {
  title: "Investiční rentgen | Analýza nemovitosti | HypotékaJasně.cz",
  description:
    "SSR analýza nemovitosti: free preview (výnos, cena/m², financing fit, red flags) a Kompletní Majetio Property Analysis. DATA / MODEL / ODHAD / NEOVĚŘENO.",
};

export default function InvesticniRentgenPage() {
  return (
    <div className="bg-white">
      <RentgenHero />
      <RentgenValueProp />
      <RentgenWhatWeAnalyze />
      <RentgenMetricsGrid />
      <RentgenDemoReport />
      {/* Client island — hydratace až po SSR obsahu */}
      <RentgenToolIsland />
      <RentgenPricing />
      <RentgenFaq />
      <RentgenBottomCta />
      <p className="sr-only">{formatAnalysisPriceLabel()}</p>
    </div>
  );
}
