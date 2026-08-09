/**
 * Server-only Supabase reader for normalized mortgage market offers.
 * Import from API routes / server components only — never Client Components.
 * READ-ONLY. Never writes. Never mixes model fallback into lender offers.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getMortgageOffers,
  type GetMortgageOffersQuery,
  type GetMortgageOffersResult,
  type MortgageMarketCatalog,
  type CatalogCondition,
  type CatalogEvidence,
  type CatalogFee,
  type CatalogLender,
  type CatalogProduct,
  type CatalogRateVariant,
  type CatalogRepresentativeExample,
} from "@/lib/mortgage-market/offers";

function createServiceRoleClient(): SupabaseClient | null {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

export async function loadMortgageMarketCatalog(
  client: SupabaseClient
): Promise<MortgageMarketCatalog> {
  const [
    lendersRes,
    productsRes,
    ratesRes,
    conditionsRes,
    feesRes,
    evidenceRes,
    examplesRes,
  ] = await Promise.all([
    client
      .from("mortgage_lenders")
      .select("id,slug,name,country_code,is_active")
      .eq("is_active", true),
    client
      .from("mortgage_catalog_products")
      .select(
        "id,lender_id,slug,name,product_type,max_ltv,is_active"
      )
      .eq("is_active", true),
    client
      .from("mortgage_rate_variants")
      .select(
        "id,product_id,pricing_scenario_key,pricing_scenario_label,financing_purpose,fixation_months,ltv_min,ltv_max,ltv_min_exclusive,ltv_max_exclusive,nominal_interest_rate,rate_type,valid_from,valid_to,checked_at,is_active,source_evidence_id,notes"
      )
      .eq("is_active", true),
    client
      .from("mortgage_rate_conditions")
      .select(
        "id,rate_variant_id,condition_type,condition_role,insurance_kind,requirement_mode,rate_effect_bp,description,is_required,is_optional,is_active"
      )
      .eq("is_active", true),
    client
      .from("mortgage_product_fees")
      .select(
        "id,product_id,fee_type,amount,currency,frequency,description,is_mandatory,is_active"
      )
      .eq("is_active", true),
    client
      .from("mortgage_source_evidence")
      .select(
        "id,source_type,source_name,source_url,checked_at,reliability_tier"
      ),
    client
      .from("mortgage_representative_examples")
      .select(
        "id,product_id,rate_variant_id,loan_amount,term_years,fixation_months,nominal_rate,rpsn,monthly_payment,total_amount_payable,insurance_included,insurance_cost,representative_example_text,is_active"
      )
      .eq("is_active", true),
  ]);

  const errors = [
    lendersRes.error,
    productsRes.error,
    ratesRes.error,
    conditionsRes.error,
    feesRes.error,
    evidenceRes.error,
    examplesRes.error,
  ].filter(Boolean);
  if (errors.length) {
    throw new Error(
      `mortgage market catalog read failed: ${errors.map((e) => e!.message).join("; ")}`
    );
  }

  const lenders: CatalogLender[] = (lendersRes.data ?? []).map((r) => ({
    id: str(r.id),
    slug: str(r.slug),
    name: str(r.name),
    countryCode: str(r.country_code),
    isActive: Boolean(r.is_active),
  }));

  const products: CatalogProduct[] = (productsRes.data ?? []).map((r) => ({
    id: str(r.id),
    lenderId: str(r.lender_id),
    slug: str(r.slug),
    name: str(r.name),
    productType: str(r.product_type),
    maxLtv: num(r.max_ltv),
    isActive: Boolean(r.is_active),
  }));

  const rates: CatalogRateVariant[] = (ratesRes.data ?? []).map((r) => ({
    id: str(r.id),
    productId: str(r.product_id),
    pricingScenarioKey: str(r.pricing_scenario_key),
    pricingScenarioLabel: r.pricing_scenario_label
      ? str(r.pricing_scenario_label)
      : null,
    financingPurpose: r.financing_purpose ? str(r.financing_purpose) : null,
    fixationMonths: Number(r.fixation_months),
    ltvMin: num(r.ltv_min),
    ltvMax: num(r.ltv_max),
    ltvMinExclusive: Boolean(r.ltv_min_exclusive),
    ltvMaxExclusive: Boolean(r.ltv_max_exclusive),
    nominalInterestRate: Number(r.nominal_interest_rate),
    rateType: str(r.rate_type) as CatalogRateVariant["rateType"],
    validFrom: str(r.valid_from),
    validTo: r.valid_to ? str(r.valid_to) : null,
    checkedAt: str(r.checked_at),
    isActive: Boolean(r.is_active),
    sourceEvidenceId: r.source_evidence_id ? str(r.source_evidence_id) : null,
    notes: r.notes ? str(r.notes) : null,
  }));

  const conditions: CatalogCondition[] = (conditionsRes.data ?? []).map((r) => ({
    id: str(r.id),
    rateVariantId: str(r.rate_variant_id),
    conditionType: str(r.condition_type),
    conditionRole: str(r.condition_role),
    insuranceKind: r.insurance_kind ? str(r.insurance_kind) : null,
    requirementMode: r.requirement_mode ? str(r.requirement_mode) : null,
    rateEffectBp: num(r.rate_effect_bp),
    description: str(r.description),
    isRequired: Boolean(r.is_required),
    isOptional: Boolean(r.is_optional),
    isActive: Boolean(r.is_active),
  }));

  const fees: CatalogFee[] = (feesRes.data ?? []).map((r) => ({
    id: str(r.id),
    productId: str(r.product_id),
    feeType: str(r.fee_type),
    amount: num(r.amount),
    currency: str(r.currency),
    frequency: str(r.frequency),
    description: r.description ? str(r.description) : null,
    isMandatory: Boolean(r.is_mandatory),
    isActive: Boolean(r.is_active),
  }));

  const evidence: CatalogEvidence[] = (evidenceRes.data ?? []).map((r) => ({
    id: str(r.id),
    sourceType: str(r.source_type),
    sourceName: str(r.source_name),
    sourceUrl: r.source_url ? str(r.source_url) : null,
    checkedAt: str(r.checked_at),
    reliabilityTier: r.reliability_tier ? str(r.reliability_tier) : null,
  }));

  const examples: CatalogRepresentativeExample[] = (examplesRes.data ?? []).map(
    (r) => ({
      id: str(r.id),
      productId: str(r.product_id),
      rateVariantId: r.rate_variant_id ? str(r.rate_variant_id) : null,
      loanAmount: Number(r.loan_amount),
      termYears: Number(r.term_years),
      fixationMonths: num(r.fixation_months),
      nominalRate: num(r.nominal_rate),
      rpsn: num(r.rpsn),
      monthlyPayment: num(r.monthly_payment),
      totalAmountPayable: num(r.total_amount_payable),
      insuranceIncluded:
        r.insurance_included == null ? null : Boolean(r.insurance_included),
      insuranceCost: num(r.insurance_cost),
      representativeExampleText: r.representative_example_text
        ? str(r.representative_example_text)
        : null,
      isActive: Boolean(r.is_active),
    })
  );

  return {
    lenders,
    products,
    rates,
    conditions,
    fees,
    evidence,
    examples,
  };
}

export async function getMortgageOffersFromSupabase(
  query: GetMortgageOffersQuery = {}
): Promise<GetMortgageOffersResult | null> {
  const client = createServiceRoleClient();
  if (!client) return null;
  const catalog = await loadMortgageMarketCatalog(client);
  return getMortgageOffers(catalog, query);
}
