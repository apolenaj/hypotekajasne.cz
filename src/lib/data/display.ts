import type { DataRecord, DataStatus } from "@/lib/data/types";

/** Chybějící údaj — nikdy nevymýšlej číslo. */
export function isMissingData(
  value: unknown
): value is null | undefined {
  if (value == null) return true;
  if (typeof value === "number" && !Number.isFinite(value)) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

/**
 * Text pro UI při chybějících datech.
 * STALE → „Data ověřujeme“; jinak „Na vyžádání“.
 */
export function missingDataLabel(
  status?: DataStatus | null
): "Na vyžádání" | "Data ověřujeme" {
  if (status === "STALE") return "Data ověřujeme";
  return "Na vyžádání";
}

export function formatDataValue(
  record: Pick<DataRecord, "value" | "unit" | "status"> | null | undefined,
  {
    decimals = 2,
    orientational = false,
  }: { decimals?: number; orientational?: boolean } = {}
): string {
  if (!record || isMissingData(record.value)) {
    return missingDataLabel(record?.status);
  }

  const v = record.value;
  if (typeof v === "boolean") return v ? "Ano" : "Ne";
  if (typeof v === "string") return v;

  if (typeof v !== "number") return missingDataLabel(record.status);

  const unit = record.unit;
  let formatted: string;
  if (unit === "percent" || unit === "percent_pa" || unit === "ltv_percent") {
    formatted = `${v.toLocaleString("cs-CZ", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} %`;
    if (unit === "percent_pa") {
      formatted = `${formatted} p. a.`;
    }
  } else if (unit === "ratio") {
    formatted = v.toLocaleString("cs-CZ", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } else if (unit === "years") {
    formatted = `${v} let`;
  } else if (unit === "months") {
    formatted = `${v} měs.`;
  } else {
    formatted = v.toLocaleString("cs-CZ", {
      maximumFractionDigits: decimals,
    });
  }

  if (orientational || record.status === "MODELLED") {
    return `${formatted} *orientačně`;
  }
  if (record.status === "PARTNER_QUOTE") {
    return `${formatted} *partner`;
  }
  return formatted;
}

export function statusBadgeLabel(status: DataStatus): string {
  switch (status) {
    case "LIVE":
      return "Aktuální data";
    case "VERIFIED":
      return "Ověřeno";
    case "MODELLED":
      return "Modelový výpočet";
    case "PARTNER_QUOTE":
      return "Nabídka partnera";
    case "STALE":
      return "Čeká na aktualizaci";
    default:
      return status;
  }
}

/** Delší české vysvětlení statusu (metodika, popovery). */
export function statusDescription(status: DataStatus): string {
  switch (status) {
    case "LIVE":
      return "Údaj ze zdroje, který pravidelně kontrolujeme. Stále nejde o závaznou nabídku banky.";
    case "VERIFIED":
      return "Manuálně ověřený editorial nebo oficiální rámec (např. ČNB).";
    case "MODELLED":
      return "Orientační modelový výpočet — není skutečná bankovní nabídka ani živá kotace.";
    case "PARTNER_QUOTE":
      return "Údaj od partnera — ověřený provozovatelem, ne veřejný ceník.";
    case "STALE":
      return "Neaktuální nebo chybějící data — ověřujeme, čísla nevymýšlíme.";
    default:
      return "";
  }
}
