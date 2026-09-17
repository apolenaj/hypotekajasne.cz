/**
 * GET /api/rentgen-sample-pdf
 * - balicek=999|digital → automatický modelový report
 * - balicek=4990|premium → individuální modelový rozbor (~30 stran)
 * - source=customer + price/area/rent/equity → zákaznické PDF (digitální)
 */

import { NextResponse } from "next/server";
import {
  CONTROL_MODEL_VERSION,
  ControlModelValidationError,
  runControlModel,
} from "@/lib/property-rentgen/control-model";
import { buildControlInputsFromCustomer } from "@/lib/property-rentgen/customer-digital-model";
import {
  DIGITAL_SAMPLE_PAGE_COUNT,
  renderCustomerModelPdfBuffer,
  renderDigitalSamplePdfBuffer,
} from "@/lib/property-rentgen/control-model-sample-pdf";
import {
  PREMIUM_SAMPLE_PAGE_COUNT,
  renderPremiumCaseStudyPdfBuffer,
} from "@/lib/property-rentgen/premium-case-study-pdf";
import { samplePackageFromQuery } from "@/lib/property-rentgen/package-query";

export const runtime = "nodejs";
export const maxDuration = 60;

function num(v: string | null): number | null {
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const source = url.searchParams.get("source");
    const balicek =
      url.searchParams.get("balicek") ?? url.searchParams.get("variant");

    if (source === "customer") {
      const price = num(url.searchParams.get("price"));
      const area = num(url.searchParams.get("area"));
      const rent = num(url.searchParams.get("rent"));
      const equity = num(url.searchParams.get("equity"));

      if (price == null || area == null || rent == null || equity == null) {
        return NextResponse.json(
          {
            error:
              "Pro zákaznické PDF jsou povinné query: price, area, rent, equity.",
          },
          { status: 400 }
        );
      }

      try {
        const inputs = buildControlInputsFromCustomer({
          purchasePriceCzk: price,
          areaM2: area,
          monthlyRentCzk: rent,
          equityTowardPurchaseCzk: equity,
        });
        const pdf = await renderCustomerModelPdfBuffer(inputs);
        const filename = `investicni-rentgen-999-zakaznik-${CONTROL_MODEL_VERSION}.pdf`;
        return new NextResponse(new Uint8Array(pdf), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
            "X-Rentgen-Model-Version": CONTROL_MODEL_VERSION,
            "X-Rentgen-Source": "customer_inputs",
            "X-Rentgen-Variant": "digital",
            "X-Rentgen-Pages": String(DIGITAL_SAMPLE_PAGE_COUNT),
          },
        });
      } catch (err) {
        const message =
          err instanceof ControlModelValidationError || err instanceof Error
            ? err.message
            : "Neplatné vstupy.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const pkg = samplePackageFromQuery(balicek);

    if (pkg === "premium") {
      const pdf = await renderPremiumCaseStudyPdfBuffer();
      const filename = `investicni-rentgen-4990-individualni-rozbor-${CONTROL_MODEL_VERSION}.pdf`;
      return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, max-age=120",
          "X-Rentgen-Model-Version": CONTROL_MODEL_VERSION,
          "X-Rentgen-Source": "control_demo_premium",
          "X-Rentgen-Variant": "premium",
          "X-Rentgen-Pages": String(PREMIUM_SAMPLE_PAGE_COUNT),
        },
      });
    }

    const pdf = await renderDigitalSamplePdfBuffer(runControlModel(), "demo");
    const filename = `investicni-rentgen-999-automaticky-model-${CONTROL_MODEL_VERSION}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=120",
        "X-Rentgen-Model-Version": CONTROL_MODEL_VERSION,
        "X-Rentgen-Source": "control_demo_digital",
        "X-Rentgen-Variant": "digital",
        "X-Rentgen-Pages": String(DIGITAL_SAMPLE_PAGE_COUNT),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generování selhalo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
