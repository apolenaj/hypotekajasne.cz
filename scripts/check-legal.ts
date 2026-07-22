/**
 * CI / pre-release / Vercel production legal gate.
 *
 * Soft (default local): warnings, exit 0.
 * Hard: VERCEL_ENV=production OR LEGAL_STRICT_PRODUCTION=true
 *   → exit 1 if operator identity incomplete while collecting leads.
 */

import {
  mustEnforceLegalIdentityForLeadCollection,
} from "../src/config/legal";
import { collectLegalProductionIssues } from "../src/lib/legal/production-guard";

const strictFlag = process.env.LEGAL_STRICT_PRODUCTION === "true";
const leadGate = mustEnforceLegalIdentityForLeadCollection();
const hard = strictFlag || leadGate;

const issues = collectLegalProductionIssues({
  requirePartnerHandoff: strictFlag,
  requireOperatorIdentity: hard,
  requireIdentityForLeads: leadGate,
});

for (const issue of issues) {
  const tag = issue.severity === "error" ? "ERROR" : "WARN";
  console.log(`[${tag}] ${issue.code}: ${issue.message}`);
}

const errors = issues.filter((i) => i.severity === "error");
if (errors.length > 0) {
  console.error(
    `\nLegal gate failed (${errors.length} error(s)).\n` +
      `Fill LEGAL_OPERATOR_LEGAL_NAME, LEGAL_OPERATOR_ICO, LEGAL_OPERATOR_REGISTER_URL,\n` +
      `LEGAL_OPERATOR_STREET+CITY+ZIP (or REGISTERED_OFFICE). See docs/legal-production-checklist.md.\n` +
      `Emergency only: LEGAL_ALLOW_INCOMPLETE_FOR_LEADS=true`
  );
  process.exit(1);
}

console.log(
  hard
    ? "\nLegal production / lead-collection gate OK."
    : "\nLegal soft check OK (warnings allowed). Vercel production or LEGAL_STRICT_PRODUCTION=true enforces operator identity for leads."
);
