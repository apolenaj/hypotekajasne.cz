import type { Metadata } from "next";
import { InvestmentModelerView } from "@/components/sections/InvestmentModelerView";

export const metadata: Metadata = {
  title: "Investiční rentgen 360° | HypotékaJasně.cz",
  description:
    "Nejpokročilejší investiční modelář nemovitostí — cash-flow, scénáře růstu, sněhová koule, S&P 500 a SWOT analýza.",
};

export default function InvesticniRentgenPage() {
  return <InvestmentModelerView />;
}
