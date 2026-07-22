import { buildFinancialPassportDocument } from "@/lib/financial-passport/build";
import { applySimulation } from "@/lib/financial-passport/mutations";
import {
  applyWhatIfToProfile,
  whatIfFromProfile,
} from "@/lib/financial-passport/what-if";
import type {
  FinancialProfileAnswers,
  FinancialPassportDocument,
  FinancialWhatIfParams,
  SimulationId,
} from "@/lib/financial-passport/types";

export type SimulationResult = {
  simulationId: SimulationId;
  amount: number;
  baseline: FinancialPassportDocument;
  simulated: FinancialPassportDocument;
  scoreDelta: number;
  dimensionDeltas: { id: string; label: string; delta: number }[];
};

export function runSimulation(
  profile: FinancialProfileAnswers,
  id: SimulationId,
  amount: number,
  modelRatePercent: number | null = 5
): SimulationResult {
  const baseline = buildFinancialPassportDocument(profile, modelRatePercent);
  const rate =
    id === "change_rate"
      ? Math.max(0.5, (modelRatePercent ?? 5) + (amount || 1))
      : modelRatePercent;
  const simulatedProfile =
    id === "change_rate" ? profile : applySimulation(profile, id, amount);
  const simulated = buildFinancialPassportDocument(simulatedProfile, rate);

  const dimensionDeltas = baseline.readiness.dimensions.map((d) => {
    const s = simulated.readiness.dimensions.find((x) => x.id === d.id);
    return {
      id: d.id,
      label: d.label,
      delta: (s?.score ?? d.score) - d.score,
    };
  });

  return {
    simulationId: id,
    amount,
    baseline,
    simulated,
    scoreDelta: simulated.readiness.overall - baseline.readiness.overall,
    dimensionDeltas,
  };
}

export function runWhatIf(
  profile: FinancialProfileAnswers,
  whatIf: FinancialWhatIfParams,
  baseRate: number
): {
  baseline: FinancialPassportDocument;
  simulated: FinancialPassportDocument;
  scoreDelta: number;
} {
  const baseline = buildFinancialPassportDocument(profile, baseRate);
  const adjusted = applyWhatIfToProfile(profile, whatIf);
  const simulated = buildFinancialPassportDocument(
    adjusted,
    whatIf.modelRatePercent
  );
  return {
    baseline,
    simulated,
    scoreDelta: simulated.readiness.overall - baseline.readiness.overall,
  };
}
