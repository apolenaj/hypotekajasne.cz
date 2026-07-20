import type {
  DataCountryCode,
  DataRecord,
  DataSourceType,
  DataStatus,
  DataUnit,
} from "@/lib/data/types";

type MakeRecordInput<T> = {
  id: string;
  value: T;
  unit: DataUnit;
  country: DataCountryCode;
  source: string;
  sourceUrl?: string | null;
  sourceType: DataSourceType;
  status: DataStatus;
  confidence: number;
  notes?: string | null;
  validFrom?: string | null;
  lastFetchedAt?: string | null;
  lastVerifiedAt?: string | null;
};

export function makeDataRecord<T>(
  input: MakeRecordInput<T>
): DataRecord<T> {
  return {
    id: input.id,
    value: input.value,
    unit: input.unit,
    country: input.country,
    source: input.source,
    sourceUrl: input.sourceUrl ?? null,
    sourceType: input.sourceType,
    validFrom: input.validFrom ?? null,
    lastFetchedAt: input.lastFetchedAt ?? null,
    lastVerifiedAt: input.lastVerifiedAt ?? null,
    status: input.status,
    confidence: input.confidence,
    notes: input.notes ?? null,
  };
}

/** Chybějící údaj — explicitní null, žádná inventura. */
export function missingDataRecord(
  id: string,
  {
    unit,
    country,
    source,
    notes,
    status = "STALE",
  }: {
    unit: DataUnit;
    country: DataCountryCode;
    source: string;
    notes?: string;
    status?: DataStatus;
  }
): DataRecord<null> {
  return makeDataRecord({
    id,
    value: null,
    unit,
    country,
    source,
    sourceType: "unknown",
    status,
    confidence: 0,
    notes: notes ?? "Údaj není k dispozici — nezobrazovat vymyšlenou hodnotu.",
  });
}
