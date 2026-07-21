/**
 * Bridge: FinancialProfileAnswers → PassportFormData pro matchMarkets.
 * Nevymýšlí nové persistentní pole — preference jsou volitelné.
 */

import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import type { PassportFormData } from "@/lib/market-matching/score";
import type { MatchingPreferences } from "@/lib/moje-moznosti/types";

function defaultPrefs(
  profile: FinancialProfileAnswers
): MatchingPreferences {
  const intent = profile.intent;
  if (intent === "owner_occupied") {
    return {
      financing: "partial",
      purpose: "conservative",
      horizon: "just_looking",
      region: "czech_slovak",
    };
  }
  if (intent === "refinance") {
    return {
      financing: "partial",
      purpose: "conservative",
      horizon: "just_looking",
      region: "czech_slovak",
    };
  }
  if (intent === "foreign_purchase") {
    return {
      financing: "partial",
      purpose: "partial_use",
      horizon: "1_year",
      region: "eu_stability",
    };
  }
  // investment
  return {
    financing: "max_leverage",
    purpose: "yield_max",
    horizon: "1_year",
    region: "eu_stability",
  };
}

export function profileToMatchingForm(
  profile: FinancialProfileAnswers,
  prefs: MatchingPreferences = {
    financing: "",
    purpose: "",
    horizon: "",
    region: "",
  }
): PassportFormData {
  const defaults = defaultPrefs(profile);
  const capital = Math.max(
    0,
    profile.ownFunds +
      profile.investmentAssets +
      profile.existingPropertyEquity
  );

  return {
    capital: String(capital > 0 ? capital : 800_000),
    financing: prefs.financing || defaults.financing,
    purpose: prefs.purpose || defaults.purpose,
    horizon: prefs.horizon || defaults.horizon,
    region: prefs.region || defaults.region,
    name: "",
    email: "",
    phone: "",
  };
}
