"use client";

import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DataSourcePopover } from "@/components/trust/DataSourcePopover";
import { LastUpdated } from "@/components/trust/LastUpdated";
import { missingDataLabel } from "@/lib/data/display";
import { toProvenanceFields } from "@/lib/data/provenance";
import { resolveEffectiveStatus } from "@/lib/data/freshness";
import type { MortgageProduct } from "@/lib/mortgage-pipeline/types";
import { cn } from "@/lib/utils";

type MortgageProductCardProps = {
  product: MortgageProduct;
  className?: string;
};

/**
 * UI: sazba, podmínky, timestamp, zdroj, status — bez marketingových tvrzení.
 */
export function MortgageProductCard({
  product,
  className,
}: MortgageProductCardProps) {
  const record = toProvenanceFields({
    id: product.id,
    value: product.nominalRateFrom,
    unit: "percent_pa",
    country: product.country === "cz" ? "cz" : null,
    source: product.lender,
    sourceUrl: product.sourceUrl,
    sourceType:
      product.sourceType === "official_bank"
        ? "official_bank"
        : product.sourceType === "insider"
          ? "insider"
          : product.sourceType === "aggregator"
            ? "aggregator"
            : "unknown",
    status: product.status,
    confidence: product.confidence,
    lastFetchedAt: product.scrapedAt,
    lastVerifiedAt: product.verifiedAt,
    notes: product.representativeExample,
  });
  const { effectiveStatus } = resolveEffectiveStatus(record);

  const rateLabel =
    product.nominalRateFrom != null
      ? `${product.nominalRateFrom.toFixed(2)} %`
      : missingDataLabel(effectiveStatus);

  const aprLabel =
    product.representativeAPR != null && product.representativeExample
      ? `${product.representativeAPR.toFixed(2)} %`
      : missingDataLabel(null);

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-white p-4 sm:p-5",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.lender}
          </p>
          <h3 className="mt-0.5 font-heading text-base font-semibold text-text-dark">
            {product.productName}
          </h3>
        </div>
        <DataStatusBadge status={effectiveStatus} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Sazba od</dt>
          <dd className="mt-0.5 text-xl font-bold tabular-nums text-deep-teal">
            {rateLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Reprezentativní RPSN</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums text-text-dark">
            {aprLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fixace</dt>
          <dd className="mt-0.5 font-medium text-text-dark">
            {product.fixation != null ? `${product.fixation} let` : "Na vyžádání"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Pojištění</dt>
          <dd className="mt-0.5 font-medium text-text-dark">
            {product.requiredInsurance === true
              ? "Vyžadováno / v sazbě"
              : product.requiredInsurance === false
                ? "Bez pojištění"
                : "Na vyžádání"}
          </dd>
        </div>
      </dl>

      {product.representativeExample && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {product.representativeExample}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3">
        <DataSourcePopover
          record={{ ...record, status: effectiveStatus }}
          methodologyTopic="rates"
          label="Zdroj"
        />
        <LastUpdated
          at={product.scrapedAt}
          status={effectiveStatus}
          label="Ze zdroje banky"
        />
        {product.sourceUrl && (
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-deep-teal underline-offset-2 hover:underline"
          >
            Otevřít zdroj →
          </a>
        )}
      </div>
    </article>
  );
}
