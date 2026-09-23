/**
 * Unit tests for admin order e-mail builders (no network, no PII in asserts beyond fixtures).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAdminCheckoutPendingSubject,
  buildAdminOrderEmailText,
  buildAdminPaymentConfirmedSubject,
} from "@/lib/property-rentgen/send-admin-order-email";
import type { InvestmentAnalysisOrderRow } from "@/lib/property-rentgen/orders";

function fixture(
  patch: Partial<InvestmentAnalysisOrderRow> = {}
): InvestmentAnalysisOrderRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    public_id: "HJ-TEST01",
    access_token: "tok",
    product_code: "INVESTMENT_XRAY",
    status: "CHECKOUT_CREATED",
    currency: "CZK",
    amount_expected_czk: 999,
    email: "client@example.com",
    phone: "+420777000111",
    customer_name: "Jan Test",
    billing_type: "person",
    billing_company_name: null,
    billing_ico: null,
    billing_dic: null,
    billing_address: null,
    property_label: "Praha",
    input_snapshot: {
      purchasePriceCzk: 4200000,
      monthlyGrossRentCzk: 20000,
      ownFundsCzk: 1260000,
      annualRatePercent: 4.8,
      termYears: 30,
      listingUrl: "https://example.com/listing",
      photos: [{ id: "1" }, { id: "2" }],
    },
    result_snapshot: null,
    source_url: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    referrer: null,
    stripe_checkout_session_id: "cs_test_1",
    stripe_payment_intent_id: "pi_test_1",
    stripe_customer_id: null,
    stripe_price_id: null,
    last_stripe_event_id: null,
    storage_path: null,
    report_id: null,
    fulfillment_error: null,
    paid_at: null,
    processing_at: null,
    fulfilled_at: null,
    admin_checkout_notification_sent_at: null,
    admin_payment_notification_sent_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...patch,
  };
}

describe("send-admin-order-email", () => {
  it("builds checkout-pending subject", () => {
    assert.equal(
      buildAdminCheckoutPendingSubject(),
      "Nové zadání Rentgenu – čeká na platbu"
    );
  });

  it("builds paid subject for digital and premium", () => {
    assert.match(
      buildAdminPaymentConfirmedSubject(fixture()),
      /ZAPLACENO – Investiční rentgen/
    );
    assert.match(
      buildAdminPaymentConfirmedSubject(
        fixture({
          product_code: "INDIVIDUAL_ANALYSIS",
          amount_expected_czk: 4990,
        })
      ),
      /ZAPLACENO – Individuální rozbor/
    );
  });

  it("includes order summary without file attachments / storage URLs", () => {
    const text = buildAdminOrderEmailText({
      kind: "checkout_pending",
      order: fixture(),
    });
    assert.match(text, /ČEKÁ NA PLATBU/);
    assert.match(text, /HJ-TEST01/);
    assert.match(text, /client@example\.com/);
    assert.match(text, /Dokumenty \/ fotografie: 2 souborů/);
    assert.doesNotMatch(text, /storage\.supabase|signed|attachment/i);
  });

  it("payment email includes stripe ids", () => {
    const text = buildAdminOrderEmailText({
      kind: "payment_confirmed",
      order: fixture({ status: "PAID" }),
      stripeSessionId: "cs_abc",
      paymentIntentId: "pi_abc",
    });
    assert.match(text, /PLATBA POTVRZENA/);
    assert.match(text, /cs_abc/);
    assert.match(text, /pi_abc/);
  });
});
