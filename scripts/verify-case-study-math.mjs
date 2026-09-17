/** Quick numeric checks for case-study golden values (no TS path aliases). */
import { createRequire } from "node:module";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Prefer running via: npx tsx scripts/verify-case-study-math.ts
console.log("Use: npx tsx scripts/verify-case-study-math.ts");
