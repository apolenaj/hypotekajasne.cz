import { buildFinancialPassportDocument } from "@/lib/financial-passport/build";
import { applySimulation } from "@/lib/financial-passport/mutations";
import type {
  FinancialProfileAnswers,
  FinancialPassportDocument,
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
  const simulatedProfile = applySimulation(profile, id, amount);
  const simulated = buildFinancialPassportDocument(
    simulatedProfile,
    modelRatePercent
  );

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
