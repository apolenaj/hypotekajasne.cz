import {
  buildDocumentFromReadiness,
  toMajetioHandoff,
} from "@/lib/financial-passport";
import type {
  ReadinessAnswers,
  ReadinessResult,
} from "@/lib/mortgage-readiness/types";
import type { FinancialPassport } from "@/lib/majetio/types";

/**
 * Sestaví Financial Passport z Hypoteční připravenosti.
 * Neobsahuje jméno, e-mail, telefon ani jiné PII.
 */
export function buildFinancialPassport(
  answers: ReadinessAnswers,
  result: ReadinessResult,
  modelRatePercent: number | null = 5
): FinancialPassport {
  void result; // kept for API compat; v2 document uses answers + rate
  const doc = buildDocumentFromReadiness(answers, modelRatePercent);
  return toMajetioHandoff(doc);
}
