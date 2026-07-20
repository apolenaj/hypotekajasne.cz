import type { ReportBlock, ReportDocument, ReportKeyValue } from "@/lib/report-engine/types";

const SENSITIVE_LABEL =
  /příjem|income|salary|plat|zůstatek|balance|dluh|úvěr|loan|adresa|address|e-mail|email|telefon|phone|iban|rodn/i;

const CZK_PATTERN = /[\d\s.,]+(?:\s*(?:Kč|CZK))?/;

function maskCzkValue(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits || digits.length < 4) return "••••";
  const n = Number(digits);
  if (Number.isNaN(n)) return "••••";
  if (n < 10_000) return "do 10 tis. Kč (maskováno)";
  if (n < 50_000) return "10–50 tis. Kč (maskováno)";
  if (n < 200_000) return "50–200 tis. Kč (maskováno)";
  if (n < 1_000_000) return "200 tis. – 1 mil. Kč (maskováno)";
  if (n < 5_000_000) return "1–5 mil. Kč (maskováno)";
  return "5+ mil. Kč (maskováno)";
}

function sanitizeKv(item: ReportKeyValue): ReportKeyValue {
  if (!SENSITIVE_LABEL.test(item.label)) return item;
  if (CZK_PATTERN.test(item.value)) {
    return { ...item, value: maskCzkValue(item.value), claimKind: "ODHAD" };
  }
  if (item.value.includes("@")) {
    return { ...item, value: "•••@•••.cz", claimKind: "ODHAD" };
  }
  return { ...item, value: "•••• (maskováno)", claimKind: "ODHAD" };
}

function sanitizeBlock(block: ReportBlock): ReportBlock {
  return {
    ...block,
    items: block.items.map(sanitizeKv),
  };
}

/**
 * Public share default — mask PII and exact financials.
 * Full detail only when allowSensitive=true on share grant.
 */
export function sanitizeReportForShare(
  doc: ReportDocument,
  allowSensitive: boolean
): ReportDocument {
  if (allowSensitive) return { ...doc };

  const maskedDisclaimer: ReportBlock = {
    ...doc.disclaimers,
    prose: [
      ...(doc.disclaimers.prose ?? []),
      "Veřejně sdílená verze — citlivá pole (příjmy, přesné zůstatky, kontakty) jsou maskována.",
    ],
  };

  return {
    ...doc,
    sensitivity: "shareable_summary",
    highlights: doc.highlights.map((h) => ({
      ...h,
      value: SENSITIVE_LABEL.test(h.label) ? maskCzkValue(h.value) : h.value,
      sub: h.sub && SENSITIVE_LABEL.test(h.label) ? undefined : h.sub,
    })),
    inputs: sanitizeBlock(doc.inputs),
    outputs: sanitizeBlock(doc.outputs),
    disclaimers: maskedDisclaimer,
  };
}
