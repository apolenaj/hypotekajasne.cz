/**
 * GET /api/rentgen-sample-pdf
 * - bez parametrů: ukázkové demo (kontrolní model)
 * - source=customer + price/area/rent/equity: PDF z zákaznických vstupů
 */

import { NextResponse } from "next/server";
import {
  CONTROL_MODEL_VERSION,
  ControlModelValidationError,
  runControlModel,
} from "@/lib/property-rentgen/control-model";
import { buildControlInputsFromCustomer } from "@/lib/property-rentgen/customer-digital-model";
import {
  renderControlModelSamplePdfBuffer,
  renderCustomerModelPdfBuffer,
} from "@/lib/property-rentgen/control-model-sample-pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

function num(v: string | null): number | null {
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const source = url.searchParams.get("source");

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
        const filename = `investicni-rentgen-zakaznik-${CONTROL_MODEL_VERSION}.pdf`;
        return new NextResponse(new Uint8Array(pdf), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
            "X-Rentgen-Model-Version": CONTROL_MODEL_VERSION,
            "X-Rentgen-Source": "customer_inputs",
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

    const pdf = await renderControlModelSamplePdfBuffer(runControlModel(), "demo");
    const filename = `investicni-rentgen-ukazka-${CONTROL_MODEL_VERSION}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=300",
        "X-Rentgen-Model-Version": CONTROL_MODEL_VERSION,
        "X-Rentgen-Source": "control_demo",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generování selhalo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
