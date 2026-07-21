/**
 * CI / pre-release legal gate.
 *
 * Default: soft warnings (exit 0) — partner/operator may be unpublished.
 * Strict: LEGAL_STRICT_PRODUCTION=true → exit 1 if partner handoff or operator identity missing.
 */

import {
  collectLegalProductionIssues,
} from "../src/lib/legal/production-guard";

const strict = process.env.LEGAL_STRICT_PRODUCTION === "true";
const issues = collectLegalProductionIssues({
  requirePartnerHandoff: strict,
  requireOperatorIdentity: strict,
});

for (const issue of issues) {
  const tag = issue.severity === "error" ? "ERROR" : "WARN";
  console.log(`[${tag}] ${issue.code}: ${issue.message}`);
}

const errors = issues.filter((i) => i.severity === "error");
if (errors.length > 0) {
  console.error(
    `\nLegal gate failed (${errors.length} error(s)). Fill LEGAL_PARTNER_* / LEGAL_OPERATOR_* or unset LEGAL_STRICT_PRODUCTION.`
  );
  process.exit(1);
}

console.log(
  strict
    ? "\nLegal strict gate OK."
    : "\nLegal soft check OK (warnings allowed). Set LEGAL_STRICT_PRODUCTION=true for hard gate."
);
