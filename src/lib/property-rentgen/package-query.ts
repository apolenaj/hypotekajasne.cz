import type { AnalysisProductTierId } from "@/lib/property-rentgen/pricing";

export type RentgenSamplePackageId = "digital" | "premium";

/** Map URL `?balicek=` to paid product tier (defaults to digital / 999). */
export function analysisPackageFromQuery(
  raw: string | null | undefined
): AnalysisProductTierId {
  if (raw === "4990" || raw === "premium") return "premium";
  if (raw === "999" || raw === "digital") return "digital";
  return "digital";
}

/** Map URL `?balicek=` for the public sample page toggle. */
export function samplePackageFromQuery(
  raw: string | null | undefined
): RentgenSamplePackageId {
  return analysisPackageFromQuery(raw) === "premium" ? "premium" : "digital";
}

export function packageQueryValue(tier: AnalysisProductTierId): string {
  if (tier === "premium") return "4990";
  if (tier === "digital") return "999";
  return "free";
}
