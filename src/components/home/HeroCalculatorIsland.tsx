"use client";

import { MiniMortgageCalculator } from "@/components/home/MiniMortgageCalculator";
import type { MortgageJourneyParseResult } from "@/lib/mortgage-rates/mortgage-journey-context";

export function HeroCalculatorIsland({
  serverJourney,
}: {
  serverJourney: MortgageJourneyParseResult;
}) {
  return <MiniMortgageCalculator serverJourney={serverJourney} />;
}
