/**
 * POST /api/generate-premium-rentgen
 *
 * Flow: validate → rentgenMathEngine → @react-pdf buffer → Supabase Storage → signed URL
 *
 * Vercel notes:
 * - runtime=nodejs (react-pdf needs Node APIs)
 * - maxDuration=60 (Hobby 10s / Pro 60s+ — bump on Pro if charts expand)
 * - Prefer @react-pdf over Puppeteer: no Chromium binary, lower memory
 */

import { NextResponse } from "next/server";
import {
  DEFAULT_MARKET_ASSUMPTIONS,
  type MarketAssumptions,
  type MortgageAssumptions,
  type PremiumRentgenAuditInput,
  type PropertyInput,
} from "@/lib/property-rentgen/audit-types";
import { renderPremiumRentgenPdfBuffer } from "@/lib/property-rentgen/premium-audit-pdf";
import { uploadPremiumRentgenPdf } from "@/lib/property-rentgen/premium-audit-storage";
import {
  RentgenMathValidationError,
  runPremiumRentgenAudit,
} from "@/lib/property-rentgen/rentgen-math-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

type GenerateBody = {
  property?: Partial<PropertyInput>;
  mortgage?: Partial<MortgageAssumptions>;
  market?: Partial<MarketAssumptions>;
  /** Skip Storage upload — return PDF as base64 (local/dev only). */
  returnBase64?: boolean;
};

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function parseBody(raw: unknown): PremiumRentgenAuditInput | { error: string } {
  if (!raw || typeof raw !== "object") {
    return { error: "Neplatné JSON tělo." };
  }
  const body = raw as GenerateBody;
  const p = body.property ?? {};
  const m = body.mortgage ?? {};
  const k = body.market ?? {};

  const purchasePriceCzk = asNumber(p.purchasePriceCzk);
  const ownFundsCzk = asNumber(m.ownFundsCzk);
  const annualRatePercent = asNumber(m.annualRatePercent);
  const monthlyGrossRentCzk = asNumber(p.monthlyGrossRentCzk);

  if (
    purchasePriceCzk == null ||
    ownFundsCzk == null ||
    annualRatePercent == null ||
    monthlyGrossRentCzk == null
  ) {
    return {
      error:
        "Povinné: property.purchasePriceCzk, property.monthlyGrossRentCzk, mortgage.ownFundsCzk, mortgage.annualRatePercent.",
    };
  }

  const property: PropertyInput = {
    reportId: typeof p.reportId === "string" ? p.reportId : undefined,
    label: typeof p.label === "string" ? p.label : undefined,
    city: typeof p.city === "string" ? p.city : undefined,
    district: typeof p.district === "string" ? p.district : undefined,
    propertyType: p.propertyType,
    areaM2: asNumber(p.areaM2),
    purchasePriceCzk,
    capexCzk: asNumber(p.capexCzk) ?? 0,
    closingCostsCzk: asNumber(p.closingCostsCzk) ?? 0,
    monthlyGrossRentCzk,
    monthlyOperatingCostsCzk: asNumber(p.monthlyOperatingCostsCzk) ?? 0,
    monthlyReserveCzk: asNumber(p.monthlyReserveCzk) ?? 0,
    vacancyRate: asNumber(p.vacancyRate) ?? 0.05,
  };

  const mortgage: MortgageAssumptions = {
    ownFundsCzk,
    loanAmountCzk: asNumber(m.loanAmountCzk),
    annualRatePercent,
    termYears: asNumber(m.termYears) ?? 30,
    fixationYears: asNumber(m.fixationYears) ?? 5,
  };

  const market: MarketAssumptions = {
    ...DEFAULT_MARKET_ASSUMPTIONS,
    rentGrowthPa: asNumber(k.rentGrowthPa) ?? DEFAULT_MARKET_ASSUMPTIONS.rentGrowthPa,
    opexGrowthPa: asNumber(k.opexGrowthPa) ?? DEFAULT_MARKET_ASSUMPTIONS.opexGrowthPa,
    propertyAppreciationPa:
      asNumber(k.propertyAppreciationPa) ??
      DEFAULT_MARKET_ASSUMPTIONS.propertyAppreciationPa,
    sp500ReturnPa:
      asNumber(k.sp500ReturnPa) ?? DEFAULT_MARKET_ASSUMPTIONS.sp500ReturnPa,
    projectionYears:
      asNumber(k.projectionYears) ?? DEFAULT_MARKET_ASSUMPTIONS.projectionYears,
    rateShockPercents: Array.isArray(k.rateShockPercents)
      ? k.rateShockPercents.filter(
          (x): x is number => typeof x === "number" && Number.isFinite(x)
        )
      : DEFAULT_MARKET_ASSUMPTIONS.rateShockPercents,
  };

  if (!market.rateShockPercents.length) {
    market.rateShockPercents = DEFAULT_MARKET_ASSUMPTIONS.rateShockPercents;
  }

  return { property, mortgage, market };
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    method: "POST",
    product: "Komplexní Investiční Audit",
    pdf: "@react-pdf/renderer (serverless-safe)",
    storageBucket: "premium-rentgen-reports",
    body: {
      property: {
        purchasePriceCzk: 7200000,
        monthlyGrossRentCzk: 32000,
        capexCzk: 420000,
        closingCostsCzk: 120000,
        monthlyOperatingCostsCzk: 4500,
        monthlyReserveCzk: 2500,
        vacancyRate: 0.05,
        label: "Praha 7 · DEMO",
      },
      mortgage: {
        ownFundsCzk: 1800000,
        annualRatePercent: 4.89,
        termYears: 30,
        fixationYears: 5,
      },
      market: {
        rentGrowthPa: 0.03,
        opexGrowthPa: 0.04,
        propertyAppreciationPa: 0.03,
        sp500ReturnPa: 0.08,
        projectionYears: 30,
        rateShockPercents: [7, 9],
      },
      returnBase64: false,
    },
  });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const returnBase64 =
    typeof raw === "object" &&
    raw != null &&
    (raw as GenerateBody).returnBase64 === true;

  try {
    const audit = runPremiumRentgenAudit(parsed);
    const pdfBuffer = await renderPremiumRentgenPdfBuffer(audit);

    if (returnBase64) {
      return NextResponse.json({
        status: "ok",
        mode: "base64",
        reportId: parsed.property.reportId ?? null,
        summary: audit.summary,
        stressTests: audit.stressTests,
        wealthTerminal: audit.wealthCreation.terminal,
        pdfBase64: pdfBuffer.toString("base64"),
        pdfBytes: pdfBuffer.byteLength,
        disclaimer: audit.disclaimer,
      });
    }

    const uploaded = await uploadPremiumRentgenPdf({
      pdfBuffer,
      reportId: parsed.property.reportId,
    });

    return NextResponse.json({
      status: "ok",
      mode: "storage",
      reportId: uploaded.reportId,
      downloadUrl: uploaded.signedUrl,
      expiresInSeconds: uploaded.expiresInSeconds,
      storagePath: uploaded.path,
      pdfBytes: pdfBuffer.byteLength,
      summary: audit.summary,
      stressTests: audit.stressTests,
      wealthTerminal: audit.wealthCreation.terminal,
      disclaimer: audit.disclaimer,
    });
  } catch (err) {
    if (err instanceof RentgenMathValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    const isConfig = message.includes("Supabase credentials");
    console.error("[generate-premium-rentgen]", message);
    return NextResponse.json(
      {
        error: isConfig
          ? "Úložiště není nakonfigurované. Pro local/dev pošlete returnBase64: true."
          : "Generování reportu selhalo.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: isConfig ? 503 : 500 }
    );
  }
}
