/**
 * Apply Phase 6.1 evidence source_url patches to live Supabase.
 * Table: public.mortgage_source_evidence (UUID ids from stableUuid).
 *
 *   npx tsx scripts/apply-phase61-evidence-urls.ts
 */
import { createClient } from "@supabase/supabase-js";

const PATCHES: {
  id: string;
  source_url: string;
  source_type: string;
  label: string;
}[] = [
  {
    id: "2f7deb25-4be2-5763-854e-826c4bbda866",
    label: "Air Bank rates",
    source_type: "official_lender_web",
    source_url:
      "https://www.airbank.cz/co-vas-nejvic-zajima/urokove-sazby-u-hypoteky/",
  },
  {
    id: "6186cf87-157c-5912-85ea-9de81f9aaa3d",
    label: "MONETA rate sheet",
    source_type: "official_lender_web",
    source_url: "https://www.moneta.cz/dokumenty-ke-stazeni/sazebniky",
  },
  {
    id: "7ba4ea56-eb7a-5c7a-be47-564c78de33a6",
    label: "MONETA RPSN example",
    source_type: "official_lender_web",
    source_url: "https://www.moneta.cz/hypoteky/hypoteka",
  },
  {
    id: "4642db37-5575-5296-a827-889cce9805e6",
    label: "UniCredit purpose rates",
    source_type: "official_lender_web",
    source_url:
      "https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html",
  },
  {
    id: "4c39a68d-cecf-52a2-9678-084f2d94aac4",
    label: "RB product pages",
    source_type: "official_lender_web",
    source_url: "https://www.rb.cz/osobni/hypoteky",
  },
  {
    id: "4538e3aa-c077-58aa-9f30-a9cd2f058e10",
    label: "RB lower-payment example",
    source_type: "official_lender_web",
    source_url:
      "https://www.rb.cz/osobni/hypoteky/nabidka-hypotek/hypoteka-s-nizsi-splatkou",
  },
];

async function main() {
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

  for (const p of PATCHES) {
    const { data, error } = await supabase
      .from("mortgage_source_evidence")
      .update({ source_url: p.source_url, source_type: p.source_type })
      .eq("id", p.id)
      .select("id,source_url");
    if (error) {
      console.error("FAIL", p.label, error.message);
      process.exit(1);
    }
    console.log(
      "OK",
      p.label,
      data?.[0]?.source_url ? "updated" : "no matching row"
    );
  }

  const { data: nullPrimary, error: qErr } = await supabase
    .from("mortgage_source_evidence")
    .select("id,source_name,source_url,reliability_tier")
    .eq("reliability_tier", "primary")
    .is("source_url", null);

  if (qErr) {
    console.error("Verify query failed:", qErr.message);
    process.exit(1);
  }

  const remaining = (nullPrimary ?? []).filter((r) =>
    /Air Bank|MONETA Money Bank official rate|UniCredit Bank official purpose/i.test(
      String(r.source_name)
    )
  );
  console.log(
    "Remaining null primary URLs for Air/MONETA/UC:",
    remaining.length
  );
  if (remaining.length) {
    console.error(remaining);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
