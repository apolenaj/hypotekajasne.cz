/**
 * Delete the synthetic Phase 6 conversion E2E lead row only.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 *   E2E_DELETE_TEST_LEAD=1 npx tsx scripts/delete-phase6-e2e-lead.ts
 */
import { createClient } from "@supabase/supabase-js";

const EMAIL = "phase6-conversion-e2e@example.com";
const NAME = "PHASE6 CONVERSION E2E TEST";

async function main() {
  if (process.env.E2E_DELETE_TEST_LEAD !== "1") {
    console.error("Refusing to run without E2E_DELETE_TEST_LEAD=1");
    process.exit(1);
  }

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: before, error: findErr } = await supabase
    .from("leads")
    .select("id,email,name,metadata")
    .eq("email", EMAIL)
    .eq("name", NAME);

  if (findErr) {
    console.error(findErr);
    process.exit(1);
  }

  console.log("Matching rows before delete:", before?.length ?? 0);
  for (const row of before ?? []) {
    const intent =
      row.metadata &&
      typeof row.metadata === "object" &&
      "page_intent" in row.metadata
        ? (row.metadata as { page_intent?: string }).page_intent
        : undefined;
    console.log("row", row.id, "page_intent=", intent ?? "(none)");
  }

  const { error: delErr } = await supabase
    .from("leads")
    .delete()
    .eq("email", EMAIL)
    .eq("name", NAME);

  if (delErr) {
    console.error(delErr);
    process.exit(1);
  }

  const { data: after, error: afterErr } = await supabase
    .from("leads")
    .select("id")
    .eq("email", EMAIL)
    .eq("name", NAME);

  if (afterErr) {
    console.error(afterErr);
    process.exit(1);
  }

  if ((after?.length ?? 0) > 0) {
    console.error("Rows still remain after delete:", after);
    process.exit(1);
  }

  console.log("Deleted synthetic Phase 6 E2E lead; zero matching rows remain.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
