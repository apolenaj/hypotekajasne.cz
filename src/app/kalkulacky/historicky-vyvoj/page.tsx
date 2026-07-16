import type { Metadata } from "next";
import { HistoricalTrendsView } from "@/components/sections/HistoricalTrendsView";

export const metadata: Metadata = {
  title: "Historický vývoj | HypotékaJasně.cz",
  description:
    "Stroj času a makroekonomické grafy vývoje realitních trhů v ČR i zahraničí.",
};

export default function HistorickyVyvojPage() {
  return <HistoricalTrendsView />;
}
