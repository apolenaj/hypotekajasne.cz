/**
 * Apply Phase 7.1 SQL via Supabase SQL HTTP when DATABASE_URL is unavailable.
 * Prefers SUPABASE_DB_URL / DATABASE_URL (postgres). Never prints secrets.
 *
 * Usage:
 *   node --env-file=.env.local scripts/apply-phase71-sql.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sqlPath = join(
  process.cwd(),
  "supabase/leads_idempotency_rate_limit.sql"
);
const sql = readFileSync(sqlPath, "utf8");

const dbUrl =
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  "";

if (!dbUrl) {
  console.error(
    JSON.stringify({
      ok: false,
      error: "missing_database_url",
      hint: "Set SUPABASE_DB_URL (or DATABASE_URL) to apply DDL, or paste supabase/leads_idempotency_rate_limit.sql into the Supabase SQL Editor.",
      file: "supabase/leads_idempotency_rate_limit.sql",
    })
  );
  process.exit(2);
}

async function main() {
  let pg;
  try {
    pg = await import("pg");
  } catch {
    console.error(
      JSON.stringify({
        ok: false,
        error: "pg_module_missing",
        hint: "npm i pg  OR apply SQL manually in Supabase SQL Editor",
      })
    );
    process.exit(2);
  }

  const client = new pg.default.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    const col = await client.query(`
      select 1 as ok
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leads'
        and column_name = 'idempotency_key'
      limit 1
    `);
    const fn = await client.query(`
      select 1 as ok
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'consume_lead_api_rate_limit'
      limit 1
    `);
    console.log(
      JSON.stringify({
        ok: true,
        idempotency_column: col.rowCount > 0,
        rate_limit_rpc: fn.rowCount > 0,
      })
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(
    JSON.stringify({
      ok: false,
      error: "apply_failed",
      message: err instanceof Error ? err.message : "unknown",
    })
  );
  process.exit(1);
});
