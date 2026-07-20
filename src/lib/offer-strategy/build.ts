import {
  buildOfferStrategyOutput,
  buildScenarioSlider,
} from "@/lib/offer-strategy/calculate";
import { buildOfferTextDraft } from "@/lib/offer-strategy/offer-text";
import type {
  OfferStrategyInput,
  OfferStrategyModel,
  OfferTextDraft,
} from "@/lib/offer-strategy/types";

export function buildOfferStrategyModel(
  input: OfferStrategyInput,
  propertyLabel = "nemovitost",
  now: Date = new Date()
): OfferStrategyModel & { offerText: OfferTextDraft } {
  const output = buildOfferStrategyOutput(input);
  const sliderPoints = buildScenarioSlider(input, output);
  const offerText = buildOfferTextDraft({
    strategyInput: input,
    openingPriceCzk: output.openingScenarioCzk,
    targetPriceCzk: output.targetPriceCzk,
    propertyLabel,
  });

  return {
    generatedAt: now.toISOString(),
    input,
    output,
    sliderRange: {
      minCzk: output.openingScenarioCzk,
      maxCzk: Math.max(
        output.openingScenarioCzk,
        output.targetPriceCzk,
        output.maximumEconomicallySensibleCzk
      ),
      stepCzk:
        sliderPoints.length > 1
          ? sliderPoints[1]!.priceCzk - sliderPoints[0]!.priceCzk
          : 50_000,
    },
    methodology: [
      "Všechny ceny a výnosy jsou MODEL — ne garantovaná valuace.",
      "Fair-value rozsah zadává uživatel nebo import z analýzy (Rentgen).",
      "Konkurence se promítá jen pokud verified = true.",
      "Opening discount reflektuje DOM, stav, urgenci — ne manipulaci.",
      "Návrh textu je etický — bez falešných protinabídek a ultimát.",
      "Scenario slider používá investment engine (waterfall, IRR).",
    ],
    offerText,
  };
}
