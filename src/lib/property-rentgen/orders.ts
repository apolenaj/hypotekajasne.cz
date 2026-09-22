/**
 * Durable order store for Investiční rentgen checkout (Supabase).
 */

import { randomBytes, randomUUID } from "node:crypto";
import { getSupabaseAdminForRentgen } from "@/lib/property-rentgen/premium-audit-storage";
import {
  publicIdFromParts,
  type ProductCode,
} from "@/lib/property-rentgen/products";

export type OrderStatus =
  | "DRAFT"
  | "CHECKOUT_CREATED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PROCESSING"
  | "READY"
  | "AWAITING_DOCUMENTS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED";

export type InvestmentAnalysisOrderRow = {
  id: string;
  public_id: string;
  access_token: string;
  product_code: ProductCode | "rentgen_premium";
  status: OrderStatus;
  currency: string;
  amount_expected_czk: number;
  email: string | null;
  phone: string | null;
  customer_name: string | null;
  billing_type: string | null;
  billing_company_name: string | null;
  billing_ico: string | null;
  billing_dic: string | null;
  billing_address: string | null;
  property_label: string | null;
  input_snapshot: Record<string, unknown>;
  result_snapshot: Record<string, unknown> | null;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  last_stripe_event_id: string | null;
  storage_path: string | null;
  report_id: string | null;
  fulfillment_error: string | null;
  paid_at: string | null;
  processing_at: string | null;
  fulfilled_at: string | null;
  /** Internal ops e-mail: order created / checkout session ready */
  admin_checkout_notification_sent_at: string | null;
  /** Internal ops e-mail: payment confirmed (idempotent) */
  admin_payment_notification_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDraftOrderInput = {
  productCode: ProductCode;
  amountExpectedCzk: number;
  email: string;
  phone?: string;
  customerName?: string;
  billingType?: "person" | "company";
  billingCompanyName?: string;
  billingIco?: string;
  billingDic?: string;
  billingAddress?: string;
  propertyLabel?: string;
  inputSnapshot: Record<string, unknown>;
  sourceUrl?: string;
  utm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
  };
};

function newAccessToken(): string {
  return randomBytes(24).toString("hex");
}

function mapRow(row: Record<string, unknown>): InvestmentAnalysisOrderRow {
  return row as unknown as InvestmentAnalysisOrderRow;
}

export async function createDraftOrder(
  input: CreateDraftOrderInput
): Promise<InvestmentAnalysisOrderRow> {
  const supabase = getSupabaseAdminForRentgen();
  const id = randomUUID();
  const publicId = publicIdFromParts(id.replace(/-/g, "").slice(0, 8));
  const now = new Date().toISOString();

  const payload = {
    id,
    public_id: publicId,
    access_token: newAccessToken(),
    product_code: input.productCode,
    status: "DRAFT" as const,
    currency: "CZK",
    amount_expected_czk: input.amountExpectedCzk,
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    customer_name: input.customerName?.trim() || null,
    billing_type: input.billingType ?? "person",
    billing_company_name: input.billingCompanyName?.trim() || null,
    billing_ico: input.billingIco?.trim() || null,
    billing_dic: input.billingDic?.trim() || null,
    billing_address: input.billingAddress?.trim() || null,
    property_label: input.propertyLabel?.trim() || null,
    input_snapshot: input.inputSnapshot,
    source_url: input.sourceUrl ?? null,
    utm_source: input.utm?.utm_source ?? null,
    utm_medium: input.utm?.utm_medium ?? null,
    utm_campaign: input.utm?.utm_campaign ?? null,
    utm_content: input.utm?.utm_content ?? null,
    utm_term: input.utm?.utm_term ?? null,
    referrer: input.utm?.referrer ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("investment_analysis_orders")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Vytvoření draft objednávky selhalo: ${error?.message ?? "unknown"}`
    );
  }
  return mapRow(data);
}

export async function updateOrder(
  id: string,
  patch: Partial<InvestmentAnalysisOrderRow>
): Promise<InvestmentAnalysisOrderRow> {
  const supabase = getSupabaseAdminForRentgen();
  const { data, error } = await supabase
    .from("investment_analysis_orders")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Update objednávky selhal: ${error?.message ?? "unknown"}`);
  }
  return mapRow(data);
}

export async function getOrderById(
  id: string
): Promise<InvestmentAnalysisOrderRow | null> {
  const supabase = getSupabaseAdminForRentgen();
  const { data, error } = await supabase
    .from("investment_analysis_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function getOrderByPublicId(
  publicId: string
): Promise<InvestmentAnalysisOrderRow | null> {
  const supabase = getSupabaseAdminForRentgen();
  const { data, error } = await supabase
    .from("investment_analysis_orders")
    .select("*")
    .eq("public_id", publicId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function getOrderByCheckoutSessionId(
  sessionId: string
): Promise<InvestmentAnalysisOrderRow | null> {
  const supabase = getSupabaseAdminForRentgen();
  const { data, error } = await supabase
    .from("investment_analysis_orders")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function getOrderByAccess(
  publicId: string,
  accessToken: string
): Promise<InvestmentAnalysisOrderRow | null> {
  const order = await getOrderByPublicId(publicId);
  if (!order) return null;
  if (order.access_token !== accessToken) return null;
  return order;
}

/**
 * Insert Stripe event id; returns false if already processed (idempotent).
 */
export async function claimStripeEvent(
  eventId: string,
  eventType: string,
  orderId?: string | null
): Promise<boolean> {
  const supabase = getSupabaseAdminForRentgen();
  const { error } = await supabase.from("stripe_webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
    order_id: orderId ?? null,
  });
  if (error) {
    if (error.code === "23505") return false; // unique violation
    throw new Error(`stripe_webhook_events insert: ${error.message}`);
  }
  return true;
}

export function toPublicOrderView(order: InvestmentAnalysisOrderRow) {
  return {
    publicId: order.public_id,
    productCode: order.product_code,
    status: order.status,
    amountExpectedCzk: order.amount_expected_czk,
    currency: order.currency,
    email: order.email,
    propertyLabel: order.property_label,
    paidAt: order.paid_at,
    fulfilledAt: order.fulfilled_at,
    reportId: order.report_id,
    hasDownload: Boolean(order.storage_path) && order.status === "READY",
  };
}
