/**
 * Calculation provenance kinds for UI — exact math vs model vs external data.
 */

export type CalculationKind = "exact" | "model" | "external";

export type CalculationKindMeta = {
  kind: CalculationKind;
  labelCs: string;
  shortCs: string;
  descriptionCs: string;
};

export const CALCULATION_KIND_META: Record<CalculationKind, CalculationKindMeta> =
  {
    exact: {
      kind: "exact",
      labelCs: "Přesný výpočet",
      shortCs: "Přesný",
      descriptionCs:
        "Deterministická finanční matematika z vašich vstupů (anuita, LTV, výnos). Nejde o schválení bankou.",
    },
    model: {
      kind: "model",
      labelCs: "Modelový předpoklad",
      shortCs: "Model",
      descriptionCs:
        "Orientační heuristika nebo scénář (DSTI stropy UX, stress +pp, růst/FX). Není regulatorní limit ani bankovní nabídka.",
    },
    external: {
      kind: "external",
      labelCs: "Externí data",
      shortCs: "Externí",
      descriptionCs:
        "Hodnota z ověřeného zdroje (ČNB limity, bankovní sazba, RPSN příklad). Podléhá datu kontroly a statusu zdroje.",
    },
  };
