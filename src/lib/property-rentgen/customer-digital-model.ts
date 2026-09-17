/**
 * Zákaznický model 999 Kč — stejný výpočetní modul jako kontrolní příklad.
 * Nikdy nepoužívá CONTROL_MODEL_INPUTS jako tiché výchozí hodnoty ceny/nájmu.
 */

import {
  CONTROL_MODEL_INPUTS,
  CONTROL_MODEL_VERSION,
  ControlModelValidationError,
  runControlModel,
  runRelativeScenarios,
  type ControlModelInputs,
  type ControlModelResult,
  type ControlScenarioResult,
} from "@/lib/property-rentgen/control-model";
import type { ManualPropertyInput } from "@/lib/property-rentgen/types";

export type CustomerDigitalModelDefaults = {
  /** Modelové předpoklady — explicitně označené, ne skryté demo čísla */
  annualRatePercent: number;
  termYears: number;
  vacancyRate: number;
  managementFeeRate: number;
  initialFitOutCzk: number;
  closingCostsCzk: number;
  cashReserveCzk: number;
  ownerBuildingCostsAnnualCzk: number;
  insuranceAnnualCzk: number;
  propertyTaxAnnualCzk: number;
  unitMaintenanceReserveAnnualCzk: number;
};

/** Předpoklady provozu/sazby — sdílené s kontrolním modelem, ale oddělené od ceny/nájmu. */
export const CUSTOMER_DIGITAL_DEFAULTS: CustomerDigitalModelDefaults = {
  annualRatePercent: CONTROL_MODEL_INPUTS.annualRatePercent,
  termYears: CONTROL_MODEL_INPUTS.termYears,
  vacancyRate: CONTROL_MODEL_INPUTS.vacancyRate,
  managementFeeRate: CONTROL_MODEL_INPUTS.managementFeeRate,
  initialFitOutCzk: 0,
  closingCostsCzk: 0,
  cashReserveCzk: 0,
  ownerBuildingCostsAnnualCzk:
    CONTROL_MODEL_INPUTS.ownerBuildingCostsAnnualCzk,
  insuranceAnnualCzk: CONTROL_MODEL_INPUTS.insuranceAnnualCzk,
  propertyTaxAnnualCzk: CONTROL_MODEL_INPUTS.propertyTaxAnnualCzk,
  unitMaintenanceReserveAnnualCzk:
    CONTROL_MODEL_INPUTS.unitMaintenanceReserveAnnualCzk,
};

export type CustomerDigitalModelRequest = {
  purchasePriceCzk: number;
  areaM2: number;
  monthlyRentCzk: number;
  /** Vlastní část kupní ceny (ne celková hotovost včetně rezerv) */
  equityTowardPurchaseCzk: number;
  annualRatePercent?: number;
  termYears?: number;
  vacancyRate?: number;
  managementFeeRate?: number;
  initialFitOutCzk?: number;
  closingCostsCzk?: number;
  cashReserveCzk?: number;
  loanAmountCzk?: number;
};

export type CustomerDigitalModelReady = {
  ok: true;
  source: "customer_inputs";
  modelVersion: typeof CONTROL_MODEL_VERSION;
  inputs: ControlModelInputs;
  result: ControlModelResult;
  scenarios: ControlScenarioResult[];
  assumptionNotesCs: string[];
};

export type CustomerDigitalModelBlocked = {
  ok: false;
  source: "customer_inputs";
  missing: string[];
  messageCs: string;
};

export type CustomerDigitalModelOutcome =
  | CustomerDigitalModelReady
  | CustomerDigitalModelBlocked;

export function digitalModelMissingFields(
  input: ManualPropertyInput
): string[] {
  const missing: string[] = [];
  if (input.priceCzk == null || !(input.priceCzk > 0)) {
    missing.push("kupní cena");
  }
  if (input.areaM2 == null || !(input.areaM2 > 0)) {
    missing.push("plocha");
  }
  if (input.rentMonthlyCzk == null) {
    missing.push("měsíční nájem (chybějící nájem ≠ nula)");
  } else if (!(input.rentMonthlyCzk > 0)) {
    missing.push("měsíční nájem (musí být kladný)");
  }
  if (input.equityCzk == null) {
    missing.push("vlastní kapitál vůči kupní ceně");
  } else if (input.equityCzk < 0) {
    missing.push("vlastní kapitál (nesmí být záporný)");
  }
  return missing;
}

export function canRunCustomerDigitalModel(
  input: ManualPropertyInput
): boolean {
  return digitalModelMissingFields(input).length === 0;
}

export function buildControlInputsFromCustomer(
  req: CustomerDigitalModelRequest,
  defaults: CustomerDigitalModelDefaults = CUSTOMER_DIGITAL_DEFAULTS
): ControlModelInputs {
  if (!(req.purchasePriceCzk > 0) || !(req.areaM2 > 0)) {
    throw new ControlModelValidationError(
      "Kupní cena a plocha musí být kladné."
    );
  }
  if (req.monthlyRentCzk == null || !Number.isFinite(req.monthlyRentCzk)) {
    throw new ControlModelValidationError(
      "Chybějící nájem není nula — zadejte kladný měsíční nájem."
    );
  }
  if (!(req.monthlyRentCzk > 0)) {
    throw new ControlModelValidationError("Měsíční nájem musí být kladný.");
  }
  if (
    !Number.isFinite(req.equityTowardPurchaseCzk) ||
    req.equityTowardPurchaseCzk < 0
  ) {
    throw new ControlModelValidationError(
      "Vlastní kapitál musí být nezáporný."
    );
  }
  if (req.equityTowardPurchaseCzk > req.purchasePriceCzk) {
    throw new ControlModelValidationError(
      "Vlastní kapitál vůči kupní ceně nesmí převýšit kupní cenu."
    );
  }

  const loanAmountCzk =
    req.loanAmountCzk != null
      ? req.loanAmountCzk
      : Math.max(0, req.purchasePriceCzk - req.equityTowardPurchaseCzk);

  const annualRatePercent =
    req.annualRatePercent ?? defaults.annualRatePercent;
  const termYears = req.termYears ?? defaults.termYears;
  const vacancyRate = req.vacancyRate ?? defaults.vacancyRate;
  const managementFeeRate =
    req.managementFeeRate ?? defaults.managementFeeRate;

  return {
    areaM2: req.areaM2,
    purchasePriceCzk: req.purchasePriceCzk,
    initialFitOutCzk: req.initialFitOutCzk ?? defaults.initialFitOutCzk,
    closingCostsCzk: req.closingCostsCzk ?? defaults.closingCostsCzk,
    cashReserveCzk: req.cashReserveCzk ?? defaults.cashReserveCzk,
    loanAmountCzk,
    loanToPurchaseRatio:
      req.purchasePriceCzk > 0 ? loanAmountCzk / req.purchasePriceCzk : 0,
    annualRatePercent,
    termYears,
    monthlyRentCzk: req.monthlyRentCzk,
    vacancyRate,
    managementFeeRate,
    ownerBuildingCostsAnnualCzk: defaults.ownerBuildingCostsAnnualCzk,
    insuranceAnnualCzk: defaults.insuranceAnnualCzk,
    propertyTaxAnnualCzk: defaults.propertyTaxAnnualCzk,
    unitMaintenanceReserveAnnualCzk:
      defaults.unitMaintenanceReserveAnnualCzk,
  };
}

export function runCustomerDigitalModelFromManual(
  input: ManualPropertyInput,
  defaults: CustomerDigitalModelDefaults = CUSTOMER_DIGITAL_DEFAULTS
): CustomerDigitalModelOutcome {
  const missing = digitalModelMissingFields(input);
  if (missing.length > 0) {
    return {
      ok: false,
      source: "customer_inputs",
      missing,
      messageCs: `Pro model cash flow doplňte: ${missing.join(", ")}.`,
    };
  }

  try {
    const controlInputs = buildControlInputsFromCustomer(
      {
        purchasePriceCzk: input.priceCzk!,
        areaM2: input.areaM2!,
        monthlyRentCzk: input.rentMonthlyCzk!,
        equityTowardPurchaseCzk: input.equityCzk!,
        annualRatePercent:
          input.annualRatePercent != null && input.annualRatePercent >= 0
            ? input.annualRatePercent
            : undefined,
        termYears:
          input.termYears != null && input.termYears > 0
            ? input.termYears
            : undefined,
      },
      defaults
    );
    const result = runControlModel(controlInputs);
    const scenarios = runRelativeScenarios(controlInputs);
    return {
      ok: true,
      source: "customer_inputs",
      modelVersion: CONTROL_MODEL_VERSION,
      inputs: controlInputs,
      result,
      scenarios,
      assumptionNotesCs: [
        `Sazba ${controlInputs.annualRatePercent} %, splatnost ${controlInputs.termYears} let — modelový předpoklad, ne nabídka banky.`,
        `Výpadek ${(controlInputs.vacancyRate * 100).toLocaleString("cs-CZ")} % a správa ${(controlInputs.managementFeeRate * 100).toLocaleString("cs-CZ")} % inkasovaného nájmu — modelový předpoklad.`,
        `Provozní náklady (dům, pojištění, daň, rezerva na údržbu) celkem ${(
          controlInputs.ownerBuildingCostsAnnualCzk +
          controlInputs.insuranceAnnualCzk +
          controlInputs.propertyTaxAnnualCzk +
          controlInputs.unitMaintenanceReserveAnnualCzk
        ).toLocaleString("cs-CZ")} Kč/rok — modelový předpoklad, dokud nedodáte skutečné doklady.`,
        "Úpravy, vedlejší náklady a oddělená hotovostní rezerva jsou ve výchozím modelu 0 Kč, pokud je nezadáte zvlášť.",
        "Výsledek není investiční doporučení ani schválení úvěru.",
      ],
    };
  } catch (err) {
    const message =
      err instanceof ControlModelValidationError
        ? err.message
        : "Výpočet se nepodařilo dokončit.";
    return {
      ok: false,
      source: "customer_inputs",
      missing: [],
      messageCs: message,
    };
  }
}
