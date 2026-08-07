"use client";

import { useEffect } from "react";
import { DecisionLabWorkspace } from "@/components/decision-lab/DecisionLabWorkspace";
import { track } from "@/lib/analytics/track";
import type { DecisionLabToolId } from "@/lib/decision-lab/types";
import { routes } from "@/lib/routes";

type KalkulackyViewProps = {
  initialTab?: DecisionLabToolId;
};

export function KalkulackyView({
  initialTab = "buy_vs_rent",
}: KalkulackyViewProps) {
  useEffect(() => {
    track("calculator_started", {
      tool_id: "decision_lab",
      country_id: "cz",
      path: routes.kalkulacky.root,
    });
  }, []);

  return <DecisionLabWorkspace initialTab={initialTab} />;
}
