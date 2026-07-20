"use client";

import { ProvenanceInline } from "@/components/trust/ProvenanceInline";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DataSourcePopover } from "@/components/trust/DataSourcePopover";
import { marketAggregateToRecords } from "@/lib/data/live-rates";
import { withEffectiveStatus } from "@/lib/data/freshness";
import { getDefaultRateRecord } from "@/lib/data/static-market";
import { REGULATORY_RECORDS } from "@/lib/data/static-regulatory";
import type { CurrentRates } from "@/lib/rates";
import type { CountryId } from "@/lib/calculators";

export function MortgageRatesProvenance({
  rates,
  isCzechMarket,
  countryId,
}: {
  rates: CurrentRates;
  isCzechMarket: boolean;
  countryId: CountryId;
}) {
  if (isCzechMarket) {
    const live = withEffectiveStatus(
      marketAggregateToRecords(rates).withInsurance
    );
    return (
      <ProvenanceInline
        record={live}
        methodologyTopic="rates"
        className="rounded-lg border border-border bg-white/80 px-3 py-2"
      />
    );
  }

  const modelled = withEffectiveStatus(getDefaultRateRecord(countryId));
  return (
    <ProvenanceInline
      record={modelled}
      methodologyTopic="rates"
      className="rounded-lg border border-border bg-white/80 px-3 py-2"
    />
  );
}

export function LtvProvenanceInline() {
  const record = withEffectiveStatus(REGULATORY_RECORDS.ltvOwnerStandard);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <DataStatusBadge status={record.status} />
      <DataSourcePopover
        record={record}
        methodologyTopic="ltv"
        label="ČNB LTV"
      />
    </div>
  );
}
