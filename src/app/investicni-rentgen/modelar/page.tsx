import type { Metadata } from "next";
import { InvestmentModelerView } from "@/components/sections/InvestmentModelerView";

export const metadata: Metadata = {
  title: "Investiční modelář 30 let | HypotékaJasně.cz",
  description:
    "Pokročilý 30letý model cash-flow, scénářů růstu, sněhové koule a SWOT. Doplněk k Investičnímu rentgenu.",
};

export default function InvesticniRentgenModelarPage() {
  return <InvestmentModelerView />;
}
