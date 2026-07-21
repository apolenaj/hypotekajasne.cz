/**
 * Pipeline orchestrátor — in-memory stages + volitelné Supabase I/O.
 * Nevymýšlí sazby. Vadná / anomální data nejdou automaticky do produkce.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { detectAnomalies, detectDisappearedProducts } from "@/lib/mortgage-pipeline/anomaly";
import { productToRow, rowToProduct } from "@/lib/mortgage-pipeline/hash";
import { normalizeAllScraped } from "@/lib/mortgage-pipeline/normalize";
import { validateMortgageProduct } from "@/lib/mortgage-pipeline/validate";
import type { ScrapedBankRate } from "@/lib/scrape/bank-scrapers";
import {
  EMPTY_PIPELINE_STATS,
  type AnomalyFlag,
  type MortgageProduct,
  type PipelineRunStats,
  type StagingReviewStatus,
  type ValidationIssue,
} from "@/lib/mortgage-pipeline/types";

export type PipelineDecision = {
  product: MortgageProduct;
  reviewStatus: StagingReviewStatus;
  anomalies: AnomalyFlag[];
  validationIssues: ValidationIssue[];
};

export type PipelineResult = {
  runId: string;
  scrapedAt: string;
  stats: PipelineRunStats;
  decisions: PipelineDecision[];
  disappeared: AnomalyFlag[];
  errorLog: { stage: string; message: string }[];
  published: MortgageProduct[];
  blocked: MortgageProduct[];
};

function newRunId(): string {
  return crypto.randomUUID();
}

/**
 * Čistá pipeline logika (bez DB) — vhodná pro unit/integration testy.
 */
export function runPipelineCore(
  scraped: ScrapedBankRate[],
  published: MortgageProduct[],
  opts?: { scrapedAt?: string; runId?: string }
): PipelineResult {
  const scrapedAt = opts?.scrapedAt ?? new Date().toISOString();
  const runId = opts?.runId ?? newRunId();
  const stats = { ...EMPTY_PIPELINE_STATS };
  const errorLog: PipelineResult["errorLog"] = [];
  const decisions: PipelineDecision[] = [];
  const publishedOut: MortgageProduct[] = [];
  const blocked: MortgageProduct[] = [];

  const publishedById = new Map(published.map((p) => [p.id, p]));

  // RAW + NORMALIZE
  const { products } = normalizeAllScraped(scraped, scrapedAt);
  stats.rawCount = scraped.length;
  stats.normalizedCount = products.length;

  const incomingIds: string[] = [];

  for (const product of products) {
    incomingIds.push(product.id);

    // VALIDATE
    const validation = validateMortgageProduct(product);
    if (!validation.ok) {
      stats.invalidCount += 1;
      decisions.push({
        product: { ...product, status: "STALE" },
        reviewStatus: "blocked",
        anomalies: [],
        validationIssues: validation.issues,
      });
      blocked.push(product);
      errorLog.push({
        stage: "VALIDATE",
        message: `${product.id}: ${validation.issues.map((i) => i.message).join("; ")}`,
      });
      continue;
    }
    stats.validCount += 1;

    // ANOMALY
    const prev = publishedById.get(product.id) ?? null;
    const anomaly = detectAnomalies(product, prev);

    if (anomaly.blockAutoPublish) {
      stats.anomalyBlocked += 1;
      stats.stagedForReview += 1;
      decisions.push({
        product,
        reviewStatus: "pending",
        anomalies: anomaly.flags,
        validationIssues: validation.issues,
      });
      blocked.push(product);
      continue;
    }

    // AUTO PUBLISH
    stats.autoPublished += 1;
    const next: MortgageProduct = {
      ...product,
      status: product.status === "MODEL" ? "MODEL" : product.status,
    };
    decisions.push({
      product: next,
      reviewStatus: "auto_published",
      anomalies: anomaly.flags,
      validationIssues: validation.issues,
    });
    publishedOut.push(next);
  }

  // DISAPPEARED — keep published as STALE, don't delete
  const activePublished = published.filter((p) => p.status !== "STALE");
  const disappeared = detectDisappearedProducts(
    activePublished.map((p) => p.id),
    incomingIds
  );
  stats.disappeared = disappeared.length;

  for (const flag of disappeared) {
    const id = String(flag.details?.productId ?? "");
    const prev = publishedById.get(id);
    if (!prev) continue;
    publishedOut.push({
      ...prev,
      status: "STALE",
      confidence: Math.min(prev.confidence, 0.3),
    });
  }

  stats.historyWritten = publishedOut.length + blocked.length;

  return {
    runId,
    scrapedAt,
    stats,
    decisions,
    disappeared,
    errorLog,
    published: publishedOut,
    blocked,
  };
}

/**
 * Persists pipeline result to Supabase (service role).
 * Pokud tabulky neexistují, loguje chyby a nehazí — legacy bank_rates dál funguje.
 */
export async function persistPipelineResult(
  supabase: SupabaseClient,
  result: PipelineResult,
  trigger: "cron" | "manual" | "api" = "api"
): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  const { error: runErr } = await supabase.from("pipeline_runs").upsert({
    id: result.runId,
    started_at: result.scrapedAt,
    finished_at: new Date().toISOString(),
    trigger,
    status:
      result.errorLog.length > 0 && result.stats.autoPublished === 0
        ? "failed"
        : result.stats.anomalyBlocked > 0 || result.stats.invalidCount > 0
          ? "partial"
          : "success",
    stage: "HISTORY",
    stats: result.stats,
    error_log: result.errorLog,
  });
  if (runErr) errors.push(`pipeline_runs: ${runErr.message}`);

  for (const d of result.decisions) {
    const { error: stErr } = await supabase.from("mortgage_products_staging").upsert(
      {
        id: d.product.id,
        pipeline_run_id: result.runId,
        payload: d.product,
        review_status: d.reviewStatus,
        anomaly_flags: d.anomalies,
        review_notes:
          d.validationIssues.length > 0
            ? d.validationIssues.map((i) => i.message).join("; ")
            : null,
      },
      { onConflict: "pipeline_run_id,id" }
    );
    if (stErr) errors.push(`staging ${d.product.id}: ${stErr.message}`);
  }

  for (const p of result.published) {
    const row = { ...productToRow(p), pipeline_run_id: result.runId, updated_at: new Date().toISOString() };
    const { data: prev } = await supabase
      .from("mortgage_products")
      .select("*")
      .eq("id", p.id)
      .maybeSingle();

    const { error: pubErr } = await supabase
      .from("mortgage_products")
      .upsert(row, { onConflict: "id" });
    if (pubErr) {
      errors.push(`publish ${p.id}: ${pubErr.message}`);
      continue;
    }

    await supabase.from("mortgage_products_history").insert({
      product_id: p.id,
      pipeline_run_id: result.runId,
      change_type: prev ? (p.status === "STALE" ? "stale" : "updated") : "created",
      previous_payload: prev ? rowToProduct(prev) : null,
      next_payload: p,
      anomaly_flags: [],
    });
  }

  for (const d of result.decisions.filter((x) => x.reviewStatus === "pending")) {
    await supabase.from("pipeline_alerts").insert({
      pipeline_run_id: result.runId,
      product_id: d.product.id,
      severity: "critical",
      alert_type: d.anomalies[0]?.code ?? "RATE_JUMP",
      message: d.anomalies.map((a) => a.message).join(" | ") || "Vyžaduje review",
      details: { anomalies: d.anomalies },
    });
  }

  for (const flag of result.disappeared) {
    await supabase.from("pipeline_alerts").insert({
      pipeline_run_id: result.runId,
      product_id: String(flag.details?.productId ?? ""),
      severity: "warning",
      alert_type: "PRODUCT_DISAPPEARED",
      message: flag.message,
      details: flag.details ?? {},
    });
  }

  return { ok: errors.length === 0, errors };
}

export async function fetchPublishedProducts(
  supabase: SupabaseClient
): Promise<MortgageProduct[]> {
  const { data, error } = await supabase.from("mortgage_products").select("*");
  if (error || !data) return [];
  return data.map((row) => rowToProduct(row));
}

export async function approveStagingProduct(
  supabase: SupabaseClient,
  opts: {
    pipelineRunId: string;
    productId: string;
    reviewedBy: string;
    approve: boolean;
    notes?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { data: staging, error: fetchErr } = await supabase
    .from("mortgage_products_staging")
    .select("*")
    .eq("pipeline_run_id", opts.pipelineRunId)
    .eq("id", opts.productId)
    .maybeSingle();

  if (fetchErr || !staging) {
    return { ok: false, error: fetchErr?.message ?? "Staging řádek nenalezen" };
  }

  const reviewStatus: StagingReviewStatus = opts.approve
    ? "approved"
    : "rejected";

  await supabase
    .from("mortgage_products_staging")
    .update({
      review_status: reviewStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: opts.reviewedBy,
      review_notes: opts.notes ?? null,
    })
    .eq("pipeline_run_id", opts.pipelineRunId)
    .eq("id", opts.productId);

  if (!opts.approve) {
    await supabase.from("mortgage_products_history").insert({
      product_id: opts.productId,
      pipeline_run_id: opts.pipelineRunId,
      change_type: "rejected",
      previous_payload: null,
      next_payload: staging.payload,
      anomaly_flags: staging.anomaly_flags ?? [],
    });
    return { ok: true };
  }

  const product = staging.payload as MortgageProduct;
  const row = {
    ...productToRow(product),
    pipeline_run_id: opts.pipelineRunId,
    verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: prev } = await supabase
    .from("mortgage_products")
    .select("*")
    .eq("id", product.id)
    .maybeSingle();

  const { error: pubErr } = await supabase
    .from("mortgage_products")
    .upsert(row, { onConflict: "id" });
  if (pubErr) return { ok: false, error: pubErr.message };

  await supabase.from("mortgage_products_history").insert({
    product_id: product.id,
    pipeline_run_id: opts.pipelineRunId,
    change_type: prev ? "updated" : "created",
    previous_payload: prev ? rowToProduct(prev) : null,
    next_payload: product,
    anomaly_flags: staging.anomaly_flags ?? [],
  });

  return { ok: true };
}
