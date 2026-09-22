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
import { track } from "@/lib/analytics/track";

type PublicOrder = {
  publicId: string;
  productCode: string;
  status: string;
  amountExpectedCzk: number;
  email: string | null;
  propertyLabel: string | null;
  hasDownload: boolean;
};

const STATUS_COPY: Record<
  string,
  { title: string; body: string }
> = {
  READY: {
    title: "Platba byla úspěšná",
    body: "Vaše zadání jsme přijali. Výstup je připravený ke stažení.",
  },
  AWAITING_DOCUMENTS: {
    title: "Platba byla úspěšná",
    body: "Vaše zadání jsme přijali. Modelový výstup je připravený — pro dokončení individuálního rozboru doplňte podklady.",
  },
  PROCESSING: {
    title: "Platba byla úspěšná",
    body: "Vaše zadání jsme přijali. Připravujeme výstup podle zakoupeného balíčku.",
  },
  PAID: {
    title: "Platba byla úspěšná",
    body: "Vaše zadání jsme přijali. Zahajujeme zpracování.",
  },
  PAYMENT_PENDING: {
    title: "Platbu ještě potvrzujeme",
    body: "Jakmile Stripe potvrdí úhradu, výstup se připraví automaticky.",
  },
  FAILED: {
    title: "Výstup se nepodařilo připravit",
    body: "Platba zůstává evidovaná. Zkuste obnovit stránku, nebo nás kontaktujte s číslem objednávky.",
  },
  CHECKOUT_CREATED: {
    title: "Čekáme na potvrzení platby",
    body: "Pokud jste platbu dokončili, chvíli strpení — potvrzení přichází ze Stripe.",
  },
};

export function RentgenThankYouClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const missingSession = !sessionId;
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [downloadPath, setDownloadPath] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    track("checkout_completed", {
      tool_id: "property_rentgen",
    });
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/checkout/rentgen/order?session_id=${encodeURIComponent(sessionId)}`
        );
        const json = (await res.json()) as {
          order?: PublicOrder;
          accessToken?: string;
          downloadPath?: string | null;
          message?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setFetchError(json.error || "Stav se nepodařilo načíst.");
          return;
        }
        if (json.order) {
          setOrder(json.order);
          if (json.accessToken) setAccessToken(json.accessToken);
          setDownloadPath(json.downloadPath ?? null);
          setPendingMessage(null);
          const done =
            json.order.status === "READY" ||
            json.order.status === "AWAITING_DOCUMENTS" ||
            json.order.status === "FAILED";
          if (!done) timer = setTimeout(poll, 2500);
          return;
        }
        setPendingMessage(json.message || "Platbu ještě potvrzujeme.");
        timer = setTimeout(poll, 2500);
      } catch {
        if (!cancelled) {
          setFetchError("Dočasná chyba sítě. Zkuste obnovit stránku.");
        }
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  const error = missingSession
    ? "Chybí identifikátor platební session."
    : fetchError;
  const statusKey = order?.status || "PAYMENT_PENDING";
  const copy = STATUS_COPY[statusKey] || STATUS_COPY.PAYMENT_PENDING;
  const isDigital =
    order?.productCode === PRODUCT_CODE.INVESTMENT_XRAY ||
    order?.productCode === "digital";
  const priceLabel = isDigital
    ? formatDigitalRentgenPrice()
    : formatAnalysisPrice();
  const productName = isDigital
    ? "Investiční rentgen"
    : "Individuální rozbor";

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
        Hypotéka Jasně
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-text-dark">
        {error ? "Nepodařilo se načíst stav" : copy.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {error || pendingMessage || copy.body}
      </p>

      {order ? (
        <div className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-deep-teal">
            {productName}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-deep-teal">
            {priceLabel}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vaše zadání jsme přijali.
          </p>
          <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between gap-4">
              <dt>Objednávka</dt>
              <dd className="font-semibold text-text-dark">{order.publicId}</dd>
            </div>
            {order.propertyLabel ? (
              <div className="flex justify-between gap-4">
                <dt>Nemovitost</dt>
                <dd className="text-right text-text-dark">{order.propertyLabel}</dd>
              </div>
            ) : null}
            {order.email ? (
              <div className="flex justify-between gap-4">
                <dt>E-mail</dt>
                <dd className="text-text-dark">{order.email}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt>Stav</dt>
              <dd className="font-semibold text-text-dark">{order.status}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl bg-[#f7f9f8] px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
              Co bude následovat
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
              <li>Zpracujeme vaše vstupy.</li>
              <li>
                {isDigital
                  ? "Připravíme automatický výstup Rentgenu."
                  : "Připravíme individuální rozbor podle podkladů."}
              </li>
              <li>
                {isDigital
                  ? "PDF a odkaz ke stažení obdržíte e-mailem (a zde na této stránce)."
                  : "Modelový výstup je dostupný ihned; individuální komentář pokračuje po doplnění podkladů."}
              </li>
            </ol>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {downloadPath ? (
              <a
                href={downloadPath}
                className="inline-flex items-center justify-center rounded-xl bg-deep-teal px-4 py-3 text-sm font-bold text-white"
              >
                Stáhnout PDF
              </a>
            ) : null}
            {order.status === "AWAITING_DOCUMENTS" ? (
              <Link
                href={`${routes.kontakt}?predmet=${encodeURIComponent(`Podklady ${order.publicId}`)}`}
                className="inline-flex items-center justify-center rounded-xl border border-deep-teal/30 px-4 py-3 text-sm font-bold text-deep-teal"
              >
                Doplnit podklady
              </Link>
            ) : null}
            {order.status === "FAILED" && accessToken ? (
              <Link
                href={`${routes.investicniRentgenObjednavka}?order=${encodeURIComponent(order.publicId)}&access=${encodeURIComponent(accessToken)}`}
                className="inline-flex items-center justify-center rounded-xl border border-deep-teal/30 px-4 py-3 text-sm font-bold text-deep-teal"
              >
                Zkontrolovat objednávku
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-xs text-muted-foreground">
        Výstup je modelový — není investiční doporučení ani schválení úvěru.{" "}
        <Link href={routes.legal.placenaAnalyza} className="text-deep-teal underline">
          Obchodní podmínky placené analýzy
        </Link>
      </p>
      <p className="mt-4">
        <Link
          href={routes.investicniRentgen}
          className="text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
        >
          ← Zpět na Investiční rentgen
        </Link>
      </p>
    </div>
  );
}
