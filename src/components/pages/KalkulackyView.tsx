"use client";

import { useEffect } from "react";
import { DecisionLabWorkspace } from "@/components/decision-lab/DecisionLabWorkspace";
import { track } from "@/lib/analytics/track";
import { routes } from "@/lib/routes";

export function KalkulackyView() {
  useEffect(() => {
    track("calculator_started", {
      tool_id: "decision_lab",
      country_id: "cz",
      path: routes.kalkulacky.koupeVsNajem,
    });
  }, []);

  return <DecisionLabWorkspace />;
}
