"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { routes } from "@/lib/routes";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import { PRODUCT_CODE } from "@/lib/property-rentgen/products";

type PublicOrder = {
  publicId: string;
  productCode: string;
  status: string;
  amountExpectedCzk: number;
  email: string | null;
  propertyLabel: string | null;
  hasDownload: boolean;
};

export function RentgenOrderRecoveryClient() {
  const params = useSearchParams();
  const publicId = params.get("order");
  const access = params.get("access");
  const canceled = params.get("canceled") === "1";
  const missingLink = !publicId || !access;
  const accessToken = access || "";
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId || !access) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(
        `/api/checkout/rentgen/order?order=${encodeURIComponent(publicId)}&access=${encodeURIComponent(access)}`
      );
      const json = (await res.json()) as {
        order?: PublicOrder;
        error?: string;
      };
      if (cancelled) return;
      if (!res.ok || !json.order) {
        setFetchError(json.error || "Objednávka nenalezena.");
        return;
      }
      setOrder(json.order);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicId, access]);

  const resumePay = async () => {
    if (!order || !publicId || !accessToken) return;
    setLoading(true);
    setPayError(null);
    try {
      const res = await fetch("/api/checkout/rentgen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productCode: order.productCode,
          email: order.email,
          resumePublicId: publicId,
          resumeAccess: accessToken,
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setPayError(
          json.error ||
            "Platbu obnovte z formuláře — údaje z náhledu zůstávají v prohlížeči."
        );
        setLoading(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setPayError("Platbu se nepodařilo spustit.");
      setLoading(false);
    }
  };

  const error = missingLink ? "Chybí odkaz na objednávku." : fetchError;
  const isDigital =
    order?.productCode === PRODUCT_CODE.INVESTMENT_XRAY ||
    order?.amountExpectedCzk === 999;
  const priceLabel = isDigital
    ? formatDigitalRentgenPrice()
    : formatAnalysisPrice();

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-text-dark">
        {canceled ? "Platba nebyla dokončena" : "Vaše objednávka"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {canceled
          ? "Vaše údaje jsme zachovali. Můžete platbu dokončit, kdykoli budete připraveni."
          : "Stav rozpracované nebo uhrazené objednávky Investičního rentgenu."}
      </p>

      {error ? (
        <p className="mt-6 text-sm text-red-700">{error}</p>
      ) : order ? (
        <div className="mt-8 rounded-2xl border border-border bg-white p-5">
          <p className="font-bold text-text-dark">
            {isDigital ? "Investiční rentgen" : "Individuální rozbor"}
          </p>
          <p className="mt-1 text-2xl font-bold text-deep-teal">{priceLabel}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Objednávka{" "}
            <span className="font-semibold text-text-dark">{order.publicId}</span>
            {" · "}
            stav {order.status}
          </p>
          {order.propertyLabel ? (
            <p className="mt-2 text-sm text-text-dark">{order.propertyLabel}</p>
          ) : null}

          {(order.status === "DRAFT" ||
            order.status === "CHECKOUT_CREATED" ||
            order.status === "EXPIRED" ||
            order.status === "CANCELLED") && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void resumePay()}
              className="mt-6 w-full rounded-xl bg-muted-gold px-4 py-3 text-sm font-bold text-text-dark disabled:opacity-50"
            >
              {loading ? "Připravuji platbu…" : `Dokončit platbu – ${priceLabel}`}
            </button>
          )}
          {payError ? (
            <p className="mt-3 text-xs text-muted-foreground">{payError}</p>
          ) : null}
          {order.hasDownload ? (
            <a
              href={`/api/checkout/rentgen/download?order=${encodeURIComponent(order.publicId)}&access=${encodeURIComponent(accessToken)}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-deep-teal px-4 py-3 text-sm font-bold text-white"
            >
              Stáhnout PDF
            </a>
          ) : null}
        </div>
      ) : !missingLink ? (
        <p className="mt-6 text-sm text-muted-foreground">Načítám objednávku…</p>
      ) : null}

      <p className="mt-8">
        <Link
          href={`${routes.investicniRentgen}#premium-objednavka`}
          className="text-sm font-semibold text-deep-teal underline"
        >
          ← Zpět k formuláři
        </Link>
      </p>
    </div>
  );
}
