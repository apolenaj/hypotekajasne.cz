"use client";

import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";
import { LeadGen } from "@/components/sections/LeadGen";

type DecisionLabWorkspaceProps = {
  showLeadGen?: boolean;
};

/**
 * Stránka koupě vs. nájem. Ostatní nástroje laboratoře mají vlastní routy.
 */
export function DecisionLabWorkspace({
  showLeadGen = true,
}: DecisionLabWorkspaceProps) {
  return (
    <>
      <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-10">
        <BuyVsRentSection embedded />
      </div>
      {showLeadGen ? <LeadGen /> : null}
    </>
  );
}
